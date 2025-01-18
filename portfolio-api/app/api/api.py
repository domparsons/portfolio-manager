from fastapi import APIRouter
from app.api.endpoints import user, watchlist

api_router = APIRouter()
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])
