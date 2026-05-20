from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.middleware.auth_middleware import CurrentUser, get_current_user
from app.models import Org
from app.schemas.chat import ChatRequest, ChatResponse, CitationOut
from app.services.rag import answer_question

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Org).where(Org.id == current_user.org_id))
    org = result.scalar_one_or_none()
    org_name = org.name if org else "your organization"
    result = await answer_question(db, current_user.org_id, org_name, body.question)
    return ChatResponse(
        answer=result["answer"],
        citations=[CitationOut(**c) for c in result["citations"]],
    )
