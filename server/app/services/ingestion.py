import json
import re
from io import BytesIO

import httpx
from pypdf import PdfReader
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeItem, SourceType
from app.models.base import generate_cuid
from app.services.embeddings import call_llm, get_embedding
from app.services.linker import link_new_item
from app.services.vector_store import upsert_vector

CHUNK_SIZE = 512
CHUNK_OVERLAP = 50


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        if end >= len(words):
            break
        start = end - overlap
    return chunks


async def parse_paste(content: str) -> str:
    return content.strip()


async def parse_url(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True) as client:
        res = await client.get(url, timeout=30.0)
        res.raise_for_status()
        html = res.text
    text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


async def parse_file(filename: str, data: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        reader = PdfReader(BytesIO(data))
        return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    return data.decode("utf-8", errors="ignore").strip()


async def auto_tag(text: str) -> list[str]:
    system = "Return only a JSON array of 3-5 short topic tags, no other text."
    prompt = f"Given this text, return topic tags:\n\n{text[:2000]}"
    raw = await call_llm(prompt, system, model="google/gemini-flash-1.5")
    try:
        match = re.search(r"\[.*?\]", raw, re.DOTALL)
        if match:
            return json.loads(match.group())[:5]
    except json.JSONDecodeError:
        pass
    return ["general"]


async def auto_title(text: str) -> str:
    system = "Generate a short title (max 8 words). Return only the title, no quotes."
    return (await call_llm(text[:1500], system, model="google/gemini-flash-1.5")).strip()[:120]


async def ingest_knowledge(
    *,
    db: AsyncSession,
    org_id: str,
    user_id: str,
    content: str,
    source: str,
) -> KnowledgeItem:
    chunks = chunk_text(content)
    if not chunks:
        chunks = [content[:500] or "Empty document"]

    title = await auto_title(content)
    tags = await auto_tag(content)

    item = KnowledgeItem(
        id=generate_cuid(),
        org_id=org_id,
        title=title,
        content=content[:50000],
        source=SourceType(source),
        tags=tags,
        created_by=user_id,
    )
    db.add(item)
    await db.flush()

    primary_vector_id = f"{item.id}_0"
    embedding = await get_embedding(chunks[0])
    await upsert_vector(
        primary_vector_id,
        embedding,
        {"orgId": org_id, "itemId": item.id, "chunkIndex": 0},
    )

    for i, chunk in enumerate(chunks):
        vid = f"{item.id}_{i}"
        emb = await get_embedding(chunk)
        await upsert_vector(
            vid,
            emb,
            {"orgId": org_id, "itemId": item.id, "chunkIndex": i},
        )

    item.pinecone_id = primary_vector_id
    await db.flush()

    await link_new_item(org_id, item.id, title, tags, embedding)

    return item
