from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.middleware.auth_middleware import CurrentUser, get_current_user
from app.models import KnowledgeItem
from app.schemas.knowledge import KnowledgeOut
from app.services.ingestion import ingest_knowledge, parse_file, parse_paste, parse_url
from app.services.vector_store import delete_vector

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


def knowledge_out(item: KnowledgeItem) -> KnowledgeOut:
    return KnowledgeOut(
        id=item.id,
        orgId=item.org_id,
        title=item.title,
        content=item.content,
        source=item.source.value,
        tags=item.tags or [],
        createdBy=item.created_by,
        createdAt=item.created_at.isoformat(),
    )


@router.post("", response_model=KnowledgeOut)
async def create_knowledge(
    current_user: CurrentUser = Depends(get_current_user),
    content: str | None = Form(default=None),
    url: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    db: AsyncSession = Depends(get_db),
):
    source = "PASTE"
    text = ""

    if file and file.filename:
        data = await file.read()
        text = await parse_file(file.filename, data)
        source = "UPLOAD"
    elif url:
        text = await parse_url(url)
        source = "URL"
    elif content:
        text = await parse_paste(content)
        source = "PASTE"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No content provided"
        )

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Empty content"
        )

    item = await ingest_knowledge(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        content=text,
        source=source,
    )
    return knowledge_out(item)


@router.get("", response_model=list[KnowledgeOut])
async def list_knowledge(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeItem)
        .where(KnowledgeItem.org_id == current_user.org_id)
        .order_by(KnowledgeItem.created_at.desc())
    )
    items = result.scalars().all()
    return [knowledge_out(i) for i in items]


@router.get("/{item_id}", response_model=KnowledgeOut)
async def get_knowledge(
    item_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeItem).where(
            KnowledgeItem.id == item_id,
            KnowledgeItem.org_id == current_user.org_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )
    return knowledge_out(item)


@router.delete("/{item_id}")
async def delete_knowledge(
    item_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeItem).where(
            KnowledgeItem.id == item_id,
            KnowledgeItem.org_id == current_user.org_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
        )

    if item.pinecone_id:
        await delete_vector(item.pinecone_id)

    await db.delete(item)
    await db.flush()
    return {"success": True}
