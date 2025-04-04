from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi import APIRouter

from app.api.endpoints import watchlist, asset, timeseries, user

app = FastAPI(title="Portfolio Manager")

api_router = APIRouter()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.openapi_schema = None
app.include_router(api_router)
app.include_router(watchlist.router)
app.include_router(asset.router)
app.include_router(timeseries.router)
app.include_router(user.router)
