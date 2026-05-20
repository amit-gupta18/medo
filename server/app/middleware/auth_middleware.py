from dataclasses import dataclass

from fastapi import Cookie, HTTPException, status

from app.services.auth_service import COOKIE_NAME, decode_jwt


@dataclass
class CurrentUser:
    id: str
    org_id: str
    role: str


async def get_current_user(
    access_token: str | None = Cookie(default=None, alias=COOKIE_NAME),
) -> CurrentUser:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_jwt(access_token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return CurrentUser(
        id=payload["sub"],
        org_id=payload.get("orgId", ""),
        role=payload.get("role", "MEMBER"),
    )
