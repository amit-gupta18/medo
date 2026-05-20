from app.config import settings
from app.db.neo4j import get_neo4j_driver

# In-memory fallback
_dev_nodes: dict[str, dict] = {}
_dev_edges: list[dict] = []


async def upsert_node(org_id: str, node_id: str, title: str, tags: list[str]) -> None:
    try:
        driver = get_neo4j_driver()
        async with driver.session() as session:
            await session.run(
                """
                MERGE (n:KnowledgeNode {id: $id, orgId: $orgId})
                SET n.title = $title, n.tags = $tags
                """,
                id=node_id,
                orgId=org_id,
                title=title,
                tags=tags,
            )
            return
    except Exception:
        pass

    _dev_nodes[node_id] = {"id": node_id, "orgId": org_id, "title": title, "tags": tags}


async def create_edge(
    org_id: str,
    source_id: str,
    target_id: str,
    similarity: float,
) -> None:
    try:
        driver = get_neo4j_driver()
        async with driver.session() as session:
            await session.run(
                """
                MATCH (a:KnowledgeNode {id: $source, orgId: $orgId})
                MATCH (b:KnowledgeNode {id: $target, orgId: $orgId})
                MERGE (a)-[r:RELATED_TO]->(b)
                SET r.similarity = $similarity
                """,
                source=source_id,
                target=target_id,
                orgId=org_id,
                similarity=similarity,
            )
            return
    except Exception:
        pass

    _dev_edges.append(
        {
            "source": source_id,
            "target": target_id,
            "similarity": similarity,
            "orgId": org_id,
        }
    )


async def get_graph(org_id: str) -> dict:
    try:
        driver = get_neo4j_driver()
        async with driver.session() as session:
            nodes_res = await session.run(
                """
                MATCH (n:KnowledgeNode {orgId: $orgId})
                RETURN n.id AS id, n.title AS label, n.tags AS tags
                """,
                orgId=org_id,
            )
            nodes = []
            async for record in nodes_res:
                tags = record["tags"] or []
                nodes.append(
                    {
                        "id": record["id"],
                        "label": record["label"],
                        "tags": list(tags),
                        "val": 1 + len(tags),
                    }
                )

            edges_res = await session.run(
                """
                MATCH (a:KnowledgeNode {orgId: $orgId})-[r:RELATED_TO]->(b:KnowledgeNode {orgId: $orgId})
                RETURN a.id AS source, b.id AS target, r.similarity AS similarity
                """,
                orgId=org_id,
            )
            links = []
            async for record in edges_res:
                links.append(
                    {
                        "source": record["source"],
                        "target": record["target"],
                        "similarity": record["similarity"] or 0.0,
                    }
                )
            if nodes or links:
                return {"nodes": nodes, "links": links}
    except Exception:
        pass

    nodes = [
        {"id": n["id"], "label": n["title"], "tags": n["tags"], "val": 1 + len(n["tags"])}
        for n in _dev_nodes.values()
        if n["orgId"] == org_id
    ]
    links = [
        {"source": e["source"], "target": e["target"], "similarity": e["similarity"]}
        for e in _dev_edges
        if e["orgId"] == org_id
    ]
    return {"nodes": nodes, "links": links}
