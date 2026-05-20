from pydantic import BaseModel


class KnowledgeOut(BaseModel):
    id: str
    orgId: str
    title: str
    content: str
    source: str
    tags: list[str]
    createdBy: str
    createdAt: str
