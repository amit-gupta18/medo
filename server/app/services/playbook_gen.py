import json
import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeItem, Playbook, PlaybookStep
from app.models.base import generate_cuid
from app.services.embeddings import call_llm, get_embedding
from app.services.vector_store import query_vectors


async def generate_playbook(db: AsyncSession, org_id: str, topic: str) -> dict:
    embedding = await get_embedding(topic)
    matches = await query_vectors(embedding, top_k=8, org_id=org_id)

    context_parts = []
    source_ids: list[str] = []
    for m in matches:
        item_id = (m.get("metadata") or {}).get("itemId")
        if not item_id or item_id in source_ids:
            continue
        result = await db.execute(
            select(KnowledgeItem).where(
                KnowledgeItem.id == item_id,
                KnowledgeItem.org_id == org_id,
            )
        )
        item = result.scalar_one_or_none()
        if item:
            source_ids.append(item_id)
            context_parts.append(f"- {item.title}: {item.content[:1500]}")

    context = "\n".join(context_parts) or "No specific knowledge found."
    system = (
        "You are an SOP writer. Return JSON only: "
        '{"title": "...", "steps": [{"text": "...", "sourceItemId": "optional-id-or-null"}]}'
    )
    prompt = f"Topic: {topic}\n\nCompany knowledge:\n{context}\n\nGenerate a runnable playbook with 5-10 steps."
    raw = await call_llm(prompt, system)

    title = topic.title()
    steps_data: list[dict] = []
    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            title = parsed.get("title", title)
            steps_data = parsed.get("steps", [])
    except json.JSONDecodeError:
        steps_data = [
            {"text": line.strip(), "sourceItemId": None}
            for line in raw.split("\n")
            if line.strip()
        ][:10]

    playbook = Playbook(
        id=generate_cuid(),
        org_id=org_id,
        topic=topic,
        title=title,
    )
    db.add(playbook)
    await db.flush()

    steps_out = []
    for i, step in enumerate(steps_data):
        text = step.get("text", str(step)) if isinstance(step, dict) else str(step)
        sid = step.get("sourceItemId") if isinstance(step, dict) else None
        if sid and sid not in source_ids:
            sid = source_ids[0] if source_ids else None
        step_obj = PlaybookStep(
            id=generate_cuid(),
            playbook_id=playbook.id,
            order=i + 1,
            text=text,
            source_item_id=sid,
        )
        db.add(step_obj)
        steps_out.append(step_obj)

    await db.flush()
    return {"playbook": playbook, "steps": steps_out}
