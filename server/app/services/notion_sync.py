"""Notion workspace sync — fetches all pages (+ private with consent)."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeItem, SourceType, Integration, SyncStatus
from app.models.base import generate_cuid
from app.services.embeddings import get_embedding
from app.services.ingestion import auto_tag, auto_title, chunk_text
from app.services.linker import link_new_item
from app.services.vector_store import upsert_vector

logger = logging.getLogger(__name__)

NOTION_API = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


async def _notion_post(token: str, path: str, body: dict | None = None) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{NOTION_API}{path}",
            headers=_headers(token),
            json=body or {},
            timeout=30.0,
        )
        res.raise_for_status()
        return res.json()


async def _notion_get(token: str, path: str) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{NOTION_API}{path}",
            headers=_headers(token),
            timeout=30.0,
        )
        res.raise_for_status()
        return res.json()


def _extract_title(page: dict) -> str:
    """Extract page title from Notion page properties."""
    props = page.get("properties", {})
    for prop in props.values():
        if prop.get("type") == "title":
            title_parts = prop.get("title", [])
            return "".join(t.get("plain_text", "") for t in title_parts)
    return "Untitled"


def _blocks_to_text(blocks: list[dict]) -> str:
    """Convert Notion blocks into plain text."""
    lines = []
    for block in blocks:
        btype = block.get("type", "")
        bdata = block.get(btype, {})

        # Extract rich_text from the block
        rich_text = bdata.get("rich_text", [])
        text = "".join(rt.get("plain_text", "") for rt in rich_text)

        if btype in ("heading_1", "heading_2", "heading_3"):
            prefix = "#" * int(btype[-1])
            lines.append(f"{prefix} {text}")
        elif btype == "bulleted_list_item":
            lines.append(f"• {text}")
        elif btype == "numbered_list_item":
            lines.append(f"- {text}")
        elif btype == "to_do":
            checked = "✓" if bdata.get("checked") else "☐"
            lines.append(f"{checked} {text}")
        elif btype == "code":
            lang = bdata.get("language", "")
            lines.append(f"```{lang}\n{text}\n```")
        elif btype == "callout":
            icon_data = bdata.get("icon")
            icon = icon_data.get("emoji", "") if icon_data and isinstance(icon_data, dict) else ""
            lines.append(f"{icon} {text}".strip())
        elif btype == "quote":
            lines.append(f"> {text}")
        elif btype == "divider":
            lines.append("---")
        elif text:
            lines.append(text)

    return "\n".join(lines)


async def _fetch_page_content(token: str, page_id: str) -> str:
    """Fetch all blocks from a Notion page and convert to text."""
    blocks = []
    start_cursor = None

    while True:
        path = f"/blocks/{page_id}/children?page_size=100"
        if start_cursor:
            path += f"&start_cursor={start_cursor}"
        data = await _notion_get(token, path)
        blocks.extend(data.get("results", []))

        if not data.get("has_more"):
            break
        start_cursor = data.get("next_cursor")

    return _blocks_to_text(blocks)


async def search_all_pages(token: str) -> list[dict]:
    """Search for all pages the integration has access to."""
    pages = []
    start_cursor = None

    while True:
        body: dict = {
            "filter": {"value": "page", "property": "object"},
            "page_size": 100,
        }
        if start_cursor:
            body["start_cursor"] = start_cursor

        data = await _notion_post(token, "/search", body)
        pages.extend(data.get("results", []))

        if not data.get("has_more"):
            break
        start_cursor = data.get("next_cursor")

    return pages


async def sync_notion(
    db: AsyncSession,
    integration: Integration,
) -> int:
    """
    Sync all Notion pages into knowledge items.
    Returns count of new items created.
    """
    token = integration.access_token
    org_id = integration.org_id

    # Update status
    integration.sync_status = SyncStatus.SYNCING
    integration.error_message = None
    await db.flush()

    created = 0

    try:
        pages = await search_all_pages(token)
        logger.info(f"Notion sync: found {len(pages)} pages")

        for page in pages:
            page_id = page["id"]
            external_id = f"notion:{page_id}"

            # Dedup check
            existing = await db.execute(
                select(KnowledgeItem).where(
                    KnowledgeItem.integration_id == integration.id,
                    KnowledgeItem.external_id == external_id,
                )
            )
            if existing.scalar_one_or_none():
                # Check if page was updated since last sync
                page_updated = page.get("last_edited_time", "")
                if integration.last_synced_at and page_updated:
                    try:
                        edited = datetime.fromisoformat(page_updated.replace("Z", "+00:00"))
                        if edited <= integration.last_synced_at:
                            continue
                    except Exception:
                        pass
                    # Page was updated — delete old, re-ingest
                    old_item = existing.scalar_one_or_none()
                    if old_item:
                        await db.delete(old_item)
                        await db.flush()
                else:
                    continue

            # Fetch page content
            notion_title = _extract_title(page)
            content = await _fetch_page_content(token, page_id)

            if not content or len(content.strip()) < 20:
                continue

            full_content = f"[Notion] {notion_title}\n\n{content}"

            # Generate title + tags
            try:
                title = await auto_title(full_content)
            except Exception:
                title = notion_title[:120] or "Notion Page"
            try:
                tags = await auto_tag(full_content)
            except Exception:
                tags = ["notion"]

            item = KnowledgeItem(
                id=generate_cuid(),
                org_id=org_id,
                title=title,
                content=full_content[:50000],
                source=SourceType.NOTION,
                tags=tags,
                created_by="system",
                integration_id=integration.id,
                external_id=external_id,
            )
            db.add(item)
            await db.flush()

            # Embed + vector store
            chunks = chunk_text(full_content)
            if not chunks:
                chunks = [full_content[:500]]

            embedding = await get_embedding(chunks[0])
            vid = f"{item.id}_0"
            await upsert_vector(
                vid, embedding,
                {"orgId": org_id, "itemId": item.id, "chunkIndex": 0},
            )
            item.pinecone_id = vid

            # Link in graph
            await link_new_item(org_id, item.id, title, tags, embedding)
            created += 1

        integration.sync_status = SyncStatus.IDLE
        integration.last_synced_at = datetime.now(timezone.utc)
        await db.commit()

    except Exception as e:
        integration.sync_status = SyncStatus.ERROR
        integration.error_message = str(e)[:500]
        await db.commit()
        raise

    return created
