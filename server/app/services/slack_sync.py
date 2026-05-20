"""Slack workspace sync — fetches messages from user-selected channels."""

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

SLACK_API = "https://slack.com/api"


async def _slack_get(token: str, method: str, params: dict | None = None) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SLACK_API}/{method}",
            headers={"Authorization": f"Bearer {token}"},
            params=params or {},
            timeout=30.0,
        )
        res.raise_for_status()
        data = res.json()
        if not data.get("ok"):
            raise RuntimeError(f"Slack API error: {data.get('error', 'unknown')}")
        return data


async def list_channels(token: str) -> list[dict]:
    """Return list of public channels the bot can see."""
    channels = []
    cursor = None
    while True:
        params = {"types": "public_channel", "limit": 200}
        if cursor:
            params["cursor"] = cursor
        data = await _slack_get(token, "conversations.list", params)
        channels.extend(
            {"id": c["id"], "name": c["name"], "topic": c.get("topic", {}).get("value", "")}
            for c in data.get("channels", [])
        )
        cursor = data.get("response_metadata", {}).get("next_cursor")
        if not cursor:
            break
    return channels


async def _fetch_thread(token: str, channel_id: str, thread_ts: str) -> str:
    """Fetch all replies in a thread and combine into one text."""
    data = await _slack_get(token, "conversations.replies", {
        "channel": channel_id, "ts": thread_ts, "limit": 100,
    })
    msgs = data.get("messages", [])
    return "\n\n".join(m.get("text", "") for m in msgs if m.get("text"))


async def _resolve_user(token: str, user_id: str, cache: dict) -> str:
    if user_id in cache:
        return cache[user_id]
    try:
        data = await _slack_get(token, "users.info", {"user": user_id})
        name = data["user"].get("real_name") or data["user"].get("name", user_id)
    except Exception:
        name = user_id
    cache[user_id] = name
    return name


async def sync_slack(
    db: AsyncSession,
    integration: Integration,
    channel_ids: list[str] | None = None,
) -> int:
    """
    Sync messages from selected Slack channels into knowledge items.
    Returns count of new items created.
    """
    token = integration.bot_token or integration.access_token
    org_id = integration.org_id
    selected = channel_ids or (integration.config or {}).get("channels", [])

    if not selected:
        logger.info("No channels selected for Slack sync")
        return 0

    # Update status
    integration.sync_status = SyncStatus.SYNCING
    integration.error_message = None
    await db.flush()

    user_cache: dict[str, str] = {}
    created = 0

    try:
        for ch_id in selected:
            params: dict = {"channel": ch_id, "limit": 100}
            # Only fetch messages since last sync
            if integration.last_synced_at:
                params["oldest"] = str(integration.last_synced_at.timestamp())

            data = await _slack_get(token, "conversations.history", params)

            for msg in data.get("messages", []):
                ts = msg.get("ts", "")
                text = msg.get("text", "")
                if not text or len(text) < 20:
                    continue

                external_id = f"slack:{ch_id}:{ts}"

                # Dedup check
                existing = await db.execute(
                    select(KnowledgeItem).where(
                        KnowledgeItem.integration_id == integration.id,
                        KnowledgeItem.external_id == external_id,
                    )
                )
                if existing.scalar_one_or_none():
                    continue

                # If threaded, fetch full thread
                if msg.get("reply_count", 0) > 0:
                    text = await _fetch_thread(token, ch_id, ts)

                # Resolve author
                author = await _resolve_user(token, msg.get("user", ""), user_cache)
                content = f"[Slack #{ch_id}] {author}:\n{text}"

                # Generate title + tags
                try:
                    title = await auto_title(content)
                except Exception:
                    title = f"Slack message from {author}"[:120]
                try:
                    tags = await auto_tag(content)
                except Exception:
                    tags = ["slack"]

                item = KnowledgeItem(
                    id=generate_cuid(),
                    org_id=org_id,
                    title=title,
                    content=content[:50000],
                    source=SourceType.SLACK,
                    tags=tags,
                    created_by="system",
                    integration_id=integration.id,
                    external_id=external_id,
                )
                db.add(item)
                await db.flush()

                # Embed + vector store
                chunks = chunk_text(content)
                if not chunks:
                    chunks = [content[:500]]

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
