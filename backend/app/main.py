from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.config.settings import settings
from app.api.endpoints import user, watchlist, asset, timeseries

app = FastAPI(title="Portfolio Manager")

# CORS settings
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.openapi_schema = None
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(user.router)
app.include_router(watchlist.router)
app.include_router(asset.router)
app.include_router(timeseries.router)
