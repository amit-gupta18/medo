from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeItem
from app.services.embeddings import call_llm, get_embedding
from app.services.vector_store import query_vectors


async def answer_question(
    db: AsyncSession, org_id: str, org_name: str, question: str
) -> dict:
    embedding = await get_embedding(question)
    matches = await query_vectors(embedding, top_k=5, org_id=org_id)

    item_ids: list[str] = []
    for m in matches:
        meta = m.get("metadata") or {}
        item_id = meta.get("itemId")
        if item_id and item_id not in item_ids:
            item_ids.append(item_id)

    chunks_text = []
    citations = []
    for item_id in item_ids:
        result = await db.execute(
            select(KnowledgeItem).where(
                KnowledgeItem.id == item_id,
                KnowledgeItem.org_id == org_id,
            )
        )
        item = result.scalar_one_or_none()
        if item:
            excerpt = item.content[:300] + ("..." if len(item.content) > 300 else "")
            chunks_text.append(f"[{item.title}]\n{item.content[:2000]}")
            citations.append({"id": item.id, "title": item.title, "excerpt": excerpt})

    if not chunks_text:
        return {
            "answer": "I don't have enough knowledge in your org brain to answer that yet. Try uploading more documents.",
            "citations": [],
        }

    system = (
        f"You are Brainyfy, the company brain for {org_name}. "
        "Answer only from the provided knowledge. If you don't know, say so. "
        "Reference source titles when making claims."
    )
    user_prompt = "Context:\n\n" + "\n\n---\n\n".join(chunks_text) + f"\n\nQuestion: {question}"
    answer = await call_llm(user_prompt, system)

    return {"answer": answer, "citations": citations}
