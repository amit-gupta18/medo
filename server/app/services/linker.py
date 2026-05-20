from app.services.graph_store import create_edge, upsert_node
from app.services.vector_store import query_vectors

SIMILARITY_THRESHOLD = 0.75


async def link_new_item(
    org_id: str,
    item_id: str,
    title: str,
    tags: list[str],
    embedding: list[float],
) -> None:
    await upsert_node(org_id, item_id, title, tags)

    results = await query_vectors(embedding, top_k=10, org_id=org_id)
    for result in results:
        other_id = (result.get("metadata") or {}).get("itemId")
        score = result.get("score", 0)
        if not other_id or other_id == item_id:
            continue
        if score >= SIMILARITY_THRESHOLD:
            await create_edge(org_id, item_id, other_id, score)
