from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


class CitationOut(BaseModel):
    id: str
    title: str
    excerpt: str


class ChatResponse(BaseModel):
    answer: str
    citations: list[CitationOut]
