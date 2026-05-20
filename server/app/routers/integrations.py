"""Integrations router — OAuth flows, sync triggers, channel listing, disconnect."""

from __future__ import annotations

import base64
import logging
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_db
from app.middleware.auth_middleware import CurrentUser, get_current_user
from app.models import Integration, IntegrationType, SyncStatus
from app.models.base import generate_cuid
from app.services.slack_sync import list_channels, sync_slack
from app.services.notion_sync import sync_notion

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/integrations", tags=["integrations"])


# ────────────────────────── Schemas ──────────────────────────

from pydantic import BaseModel


class IntegrationOut(BaseModel):
    id: str
    type: str
    teamName: str | None
    syncStatus: str
    lastSyncedAt: str | None
    errorMessage: str | None
    config: dict | None


class ChannelOut(BaseModel):
    id: str
    name: str
    topic: str


def integration_out(i: Integration) -> IntegrationOut:
    return IntegrationOut(
        id=i.id,
        type=i.type.value,
        teamName=i.team_name,
        syncStatus=i.sync_status.value,
        lastSyncedAt=i.last_synced_at.isoformat() if i.last_synced_at else None,
        errorMessage=i.error_message,
        config=i.config,
    )


# ────────────────────────── List ──────────────────────────

@router.get("", response_model=list[IntegrationOut])
async def list_integrations(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Integration).where(Integration.org_id == current_user.org_id)
    )
    return [integration_out(i) for i in result.scalars().all()]


# ────────────────────────── SLACK ──────────────────────────

SLACK_SCOPES = "channels:history,channels:read,users:read,chat:write"

@router.get("/slack/connect")
async def slack_connect(current_user: CurrentUser = Depends(get_current_user)):
    if not settings.SLACK_CLIENT_ID:
        raise HTTPException(400, "Slack integration not configured. Set SLACK_CLIENT_ID in .env")

    params = urlencode({
        "client_id": settings.SLACK_CLIENT_ID,
        "scope": SLACK_SCOPES,
        "redirect_uri": f"{settings.BACKEND_URL}/integrations/slack/callback",
        "state": current_user.org_id,
    })
    return RedirectResponse(f"https://slack.com/oauth/v2/authorize?{params}")


@router.get("/slack/callback")
async def slack_callback(
    code: str = Query(...),
    state: str = Query(""),
    db: AsyncSession = Depends(get_db),
):
    org_id = state
    if not org_id:
        raise HTTPException(400, "Invalid state")

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://slack.com/api/oauth.v2.access",
            data={
                "client_id": settings.SLACK_CLIENT_ID,
                "client_secret": settings.SLACK_CLIENT_SECRET,
                "code": code,
                "redirect_uri": f"{settings.BACKEND_URL}/integrations/slack/callback",
            },
            timeout=30.0,
        )
        data = res.json()

    if not data.get("ok"):
        raise HTTPException(400, f"Slack OAuth failed: {data.get('error', 'unknown')}")

    # Upsert integration
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == org_id,
            Integration.type == IntegrationType.SLACK,
        )
    )
    integration = result.scalar_one_or_none()

    bot_token = data.get("access_token", "")
    user_token = data.get("authed_user", {}).get("access_token", "")
    team_id = data.get("team", {}).get("id", "")
    team_name = data.get("team", {}).get("name", "Slack Workspace")

    if integration:
        integration.access_token = user_token or bot_token
        integration.bot_token = bot_token
        integration.team_id = team_id
        integration.team_name = team_name
        integration.scopes = SLACK_SCOPES
        integration.sync_status = SyncStatus.IDLE
        integration.error_message = None
    else:
        integration = Integration(
            id=generate_cuid(),
            org_id=org_id,
            type=IntegrationType.SLACK,
            access_token=user_token or bot_token,
            bot_token=bot_token,
            team_id=team_id,
            team_name=team_name,
            scopes=SLACK_SCOPES,
            sync_status=SyncStatus.IDLE,
            config={"channels": []},
        )
        db.add(integration)

    await db.commit()
    return RedirectResponse(f"{settings.FRONTEND_URL}/settings?connected=slack")


@router.get("/slack/channels", response_model=list[ChannelOut])
async def slack_channels(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List available Slack channels for selection."""
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == current_user.org_id,
            Integration.type == IntegrationType.SLACK,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Slack not connected")

    token = integration.bot_token or integration.access_token
    channels = await list_channels(token)
    return [ChannelOut(**c) for c in channels]


@router.post("/slack/channels")
async def set_slack_channels(
    channel_ids: list[str],
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Set which channels to sync."""
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == current_user.org_id,
            Integration.type == IntegrationType.SLACK,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Slack not connected")

    config = integration.config or {}
    config["channels"] = channel_ids
    integration.config = config
    await db.commit()
    return {"success": True, "channels": channel_ids}


@router.post("/slack/sync")
async def trigger_slack_sync(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == current_user.org_id,
            Integration.type == IntegrationType.SLACK,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Slack not connected")

    count = await sync_slack(db, integration)
    return {"success": True, "itemsSynced": count}


@router.delete("/slack")
async def disconnect_slack(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == current_user.org_id,
            Integration.type == IntegrationType.SLACK,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Slack not connected")

    await db.delete(integration)
    await db.commit()
    return {"success": True}


# ────────────────────────── NOTION ──────────────────────────

@router.get("/notion/connect")
async def notion_connect(current_user: CurrentUser = Depends(get_current_user)):
    if not settings.NOTION_CLIENT_ID:
        raise HTTPException(400, "Notion integration not configured. Set NOTION_CLIENT_ID in .env")

    params = urlencode({
        "client_id": settings.NOTION_CLIENT_ID,
        "redirect_uri": f"{settings.BACKEND_URL}/integrations/notion/callback",
        "response_type": "code",
        "owner": "user",
        "state": current_user.org_id,
    })
    return RedirectResponse(f"https://api.notion.com/v1/oauth/authorize?{params}")


@router.get("/notion/callback")
async def notion_callback(
    code: str = Query(...),
    state: str = Query(""),
    db: AsyncSession = Depends(get_db),
):
    org_id = state
    if not org_id:
        raise HTTPException(400, "Invalid state")

    # Exchange code for token (Notion uses Basic auth)
    credentials = base64.b64encode(
        f"{settings.NOTION_CLIENT_ID}:{settings.NOTION_CLIENT_SECRET}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.notion.com/v1/oauth/token",
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/json",
            },
            json={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": f"{settings.BACKEND_URL}/integrations/notion/callback",
            },
            timeout=30.0,
        )
        data = res.json()

    if "error" in data:
        raise HTTPException(400, f"Notion OAuth failed: {data.get('error', 'unknown')}")

    access_token = data.get("access_token", "")
    workspace_name = data.get("workspace_name", "Notion Workspace")
    workspace_id = data.get("workspace_id", "")

    # Upsert integration
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == org_id,
            Integration.type == IntegrationType.NOTION,
        )
    )
    integration = result.scalar_one_or_none()

    if integration:
        integration.access_token = access_token
        integration.team_id = workspace_id
        integration.team_name = workspace_name
        integration.sync_status = SyncStatus.IDLE
        integration.error_message = None
    else:
        integration = Integration(
            id=generate_cuid(),
            org_id=org_id,
            type=IntegrationType.NOTION,
            access_token=access_token,
            team_id=workspace_id,
            team_name=workspace_name,
            sync_status=SyncStatus.IDLE,
            config={"include_private": False},
        )
        db.add(integration)

    await db.commit()
    return RedirectResponse(f"{settings.FRONTEND_URL}/settings?connected=notion")


@router.post("/notion/sync")
async def trigger_notion_sync(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == current_user.org_id,
            Integration.type == IntegrationType.NOTION,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Notion not connected")

    count = await sync_notion(db, integration)
    return {"success": True, "itemsSynced": count}


@router.delete("/notion")
async def disconnect_notion(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Integration).where(
            Integration.org_id == current_user.org_id,
            Integration.type == IntegrationType.NOTION,
        )
    )
    integration = result.scalar_one_or_none()
    if not integration:
        raise HTTPException(404, "Notion not connected")

    await db.delete(integration)
    await db.commit()
    return {"success": True}
