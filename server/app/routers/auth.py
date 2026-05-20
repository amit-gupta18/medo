from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.middleware.auth_middleware import CurrentUser, get_current_user
from app.models import Org, User, Role
from app.models.base import generate_cuid
from app.schemas.auth import LoginRequest, RegisterRequest, UserOut
from app.services.auth_service import (
    clear_auth_cookie,
    create_jwt,
    hash_password,
    set_auth_cookie,
    slugify,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        orgId=user.org_id,
    )


@router.post("/register", response_model=UserOut)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    base_slug = slugify(body.orgName)
    slug = base_slug
    n = 1
    while True:
        result = await db.execute(select(Org).where(Org.slug == slug))
        if not result.scalar_one_or_none():
            break
        slug = f"{base_slug}-{n}"
        n += 1

    org = Org(id=generate_cuid(), name=body.orgName, slug=slug)
    db.add(org)
    await db.flush()

    user = User(
        id=generate_cuid(),
        org_id=org.id,
        email=body.email,
        name=body.name,
        password_hash=hash_password(body.password),
        role=Role.ADMIN,
    )
    db.add(user)
    await db.flush()

    token = create_jwt(user.id, org.id, user.role.value)
    set_auth_cookie(response, token)
    return user_out(user)


@router.post("/login", response_model=UserOut)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    token = create_jwt(user.id, user.org_id, user.role.value)
    set_auth_cookie(response, token)
    return user_out(user)


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"success": True}


@router.get("/me", response_model=UserOut)
async def me(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user_out(user)
