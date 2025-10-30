from app.api.endpoints import (
    admin,
    asset,
    monte_carlo,
    portfolio,
    timeseries,
    transaction,
    user,
    watchlist,
)
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Portfolio Manager")

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
app.include_router(watchlist.router)
app.include_router(transaction.router)
app.include_router(portfolio.router)
app.include_router(asset.router)
app.include_router(timeseries.router)
app.include_router(user.router)
app.include_router(monte_carlo.router)
app.include_router(admin.router)
