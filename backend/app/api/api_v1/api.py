# app/api/api_v1/api.py
from fastapi import APIRouter
from app.api.api_v1.endpoints import personal_best

api_router = APIRouter()
api_router.include_router(personal_best.router, prefix="/personal_bests", tags=["personal_bests"])
