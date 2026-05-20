from pydantic import BaseModel


class GenerateRequest(BaseModel):
    topic: str


class StepOut(BaseModel):
    id: str
    order: int
    text: str
    completed: bool
    sourceItemId: str | None = None
    sourceItem: dict | None = None


class PlaybookOut(BaseModel):
    id: str
    topic: str
    title: str
    createdAt: str
    steps: list[StepOut] = []


class StepPatch(BaseModel):
    completed: bool
