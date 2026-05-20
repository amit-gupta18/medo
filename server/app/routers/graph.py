from fastapi import APIRouter, Depends

from app.middleware.auth_middleware import CurrentUser, get_current_user
from app.services.graph_store import get_graph

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("")
async def graph(current_user: CurrentUser = Depends(get_current_user)):
    return await get_graph(current_user.org_id)
