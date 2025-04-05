from fastapi import APIRouter, Depends
from app.schemas.asset import AssetListSchema, AssetSchema
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud.asset import get_all_assets
from app.crud.timeseries import get_latest_price_and_changes
from app.core.asset import generate_asset_list

router = APIRouter(prefix="/asset", tags=["asset"])


@router.get("/assets", response_model=list[AssetSchema])
def get_assets(db: Session = Depends(get_db)):
    assets_df = get_all_assets(db)

    return assets_df.to_dicts()


@router.get("/asset_list", response_model=list[AssetListSchema])
def get_asset_list(db: Session = Depends(get_db)):
    assets = get_all_assets(db)
    latest_timeseries = get_latest_price_and_changes(db)
    asset_list = generate_asset_list(assets, latest_timeseries)

    return asset_list
