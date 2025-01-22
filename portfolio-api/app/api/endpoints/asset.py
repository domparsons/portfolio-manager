from fastapi import APIRouter, Depends
from app.schemas.asset import AssetSchema
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud.asset import get_all_assets


router = APIRouter()

@router.get("/asset", response_model=list[AssetSchema])
def get_assets(db: Session = Depends(get_db)):
    print("get_assets")
    return get_all_assets(db)