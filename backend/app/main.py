from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.config.settings import settings

# Create a single FastAPI instance
app = FastAPI(title="Personal Best Tracker")

# CORS settings
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers after middleware is set up
app.include_router(api_router, prefix=settings.API_V1_STR)
