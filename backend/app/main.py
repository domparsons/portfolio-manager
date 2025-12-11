import re
import time

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import (
    admin,
    asset,
    backtest,
    monte_carlo,
    portfolio,
    timeseries,
    transaction,
    user,
    watchlist,
)
from app.logger import logger

app = FastAPI(title="Portfolio Manager")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    pattern = r"(auth0(?:\||%7C)[a-zA-Z0-9]+)"

    def redact_to_last_8(match):
        user_id = match.group(1)
        return f"...{user_id[-8:]}"

    path = re.sub(pattern, redact_to_last_8, path, flags=re.IGNORECASE)
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {path} - {response.status_code} ({duration:.3f}s)")

    return response


api_router = APIRouter()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://portfolio.domparsons.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {"message": "API is running"}


app.openapi_schema = None
app.include_router(api_router)
app.include_router(backtest.router)
app.include_router(watchlist.router)
app.include_router(transaction.router)
app.include_router(portfolio.router)
app.include_router(asset.router)
app.include_router(timeseries.router)
app.include_router(user.router)
app.include_router(monte_carlo.router)
app.include_router(admin.router)
