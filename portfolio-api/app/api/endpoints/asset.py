from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app import schemas, crud
from app.config.database import get_db

router = APIRouter()
