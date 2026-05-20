from __future__ import annotations

from app.config import settings

# In-memory fallback when Pinecone is not configured
_dev_vectors: dict[str, dict] = {}
_pinecone_index = None


def _get_index():
    global _pinecone_index
    if _pinecone_index is not None:
        return _pinecone_index
    if not settings.PINECONE_API_KEY:
        return None
    from pinecone import Pinecone

    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    _pinecone_index = pc.Index(settings.PINECONE_INDEX_NAME)
    return _pinecone_index


async def upsert_vector(
    vector_id: str,
    vector: list[float],
    metadata: dict,
) -> None:
    index = _get_index()
    if index is None:
        _dev_vectors[vector_id] = {"vector": vector, "metadata": metadata}
        return
    index.upsert(vectors=[{"id": vector_id, "values": vector, "metadata": metadata}])


async def query_vectors(
    vector: list[float],
    top_k: int = 5,
    org_id: str | None = None,
) -> list[dict]:
    index = _get_index()
    filter_meta = {"orgId": org_id} if org_id else None

    if index is None:
        results = []
        for vid, data in _dev_vectors.items():
            meta = data["metadata"]
            if org_id and meta.get("orgId") != org_id:
                continue
            score = _cosine_similarity(vector, data["vector"])
            results.append({"id": vid, "score": score, "metadata": meta})
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    res = index.query(
        vector=vector,
        top_k=top_k,
        include_metadata=True,
        filter=filter_meta,
    )
    return [
        {
            "id": m["id"],
            "score": m["score"],
            "metadata": m.get("metadata") or {},
        }
        for m in res.get("matches", [])
    ]


async def delete_vector(vector_id: str) -> None:
    index = _get_index()
    if index is None:
        _dev_vectors.pop(vector_id, None)
        return
    index.delete(ids=[vector_id])


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        n = min(len(a), len(b))
        a, b = a[:n], b[:n]
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(x * x for x in b) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)
