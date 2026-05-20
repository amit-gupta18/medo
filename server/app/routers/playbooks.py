from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.middleware.auth_middleware import CurrentUser, get_current_user
from app.models import KnowledgeItem, Playbook, PlaybookStep
from app.schemas.playbook import GenerateRequest, PlaybookOut, StepOut, StepPatch
from app.services.playbook_gen import generate_playbook

router = APIRouter(prefix="/playbooks", tags=["playbooks"])


def step_out(step: PlaybookStep) -> StepOut:
    source_item_dict = {"title": step.source_item.title} if step.source_item else None
    return StepOut(
        id=step.id,
        order=step.order,
        text=step.text,
        completed=step.completed,
        sourceItemId=step.source_item_id,
        sourceItem=source_item_dict,
    )


def playbook_out(playbook: Playbook) -> PlaybookOut:
    return PlaybookOut(
        id=playbook.id,
        topic=playbook.topic,
        title=playbook.title,
        createdAt=playbook.created_at.isoformat(),
        steps=[step_out(s) for s in playbook.steps],
    )


@router.post("/generate", response_model=PlaybookOut)
async def generate(
    body: GenerateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await generate_playbook(db, current_user.org_id, body.topic)
    playbook = result["playbook"]
    # Refresh to load relationships
    await db.refresh(playbook, ["steps"])
    for s in playbook.steps:
        if s.source_item_id:
            await db.refresh(s, ["source_item"])
    return playbook_out(playbook)


@router.get("", response_model=list[PlaybookOut])
async def list_playbooks(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Playbook)
        .where(Playbook.org_id == current_user.org_id)
        .order_by(Playbook.created_at.desc())
    )
    playbooks = result.scalars().unique().all()
    return [playbook_out(p) for p in playbooks]


@router.get("/{playbook_id}", response_model=PlaybookOut)
async def get_playbook(
    playbook_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Playbook).where(
            Playbook.id == playbook_id,
            Playbook.org_id == current_user.org_id,
        )
    )
    playbook = result.scalar_one_or_none()
    if not playbook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )
    return playbook_out(playbook)


@router.patch("/{playbook_id}/steps/{step_id}", response_model=StepOut)
async def patch_step(
    playbook_id: str,
    step_id: str,
    body: StepPatch,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Playbook).where(
            Playbook.id == playbook_id,
            Playbook.org_id == current_user.org_id,
        )
    )
    playbook = result.scalar_one_or_none()
    if not playbook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Playbook not found"
        )

    result = await db.execute(
        select(PlaybookStep).where(
            PlaybookStep.id == step_id,
            PlaybookStep.playbook_id == playbook_id,
        )
    )
    step = result.scalar_one_or_none()
    if not step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Step not found"
        )

    step.completed = body.completed
    await db.flush()
    await db.refresh(step, ["source_item"])
    return step_out(step)
