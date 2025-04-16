from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, core
from app.database import get_db
from app.schemas.asset import AssetListSchema, AssetSchema

router = APIRouter(prefix="/asset", tags=["asset"])


@router.get("/", response_model=list[AssetSchema])
def get_all_assets(db: Session = Depends(get_db)):
    assets_df = crud.asset.get_all_assets(db)

    return assets_df.to_dicts()


@router.get("/asset_list", response_model=list[AssetListSchema])
def get_asset_list(db: Session = Depends(get_db)):
    assets = crud.asset.get_all_assets(db)
    latest_timeseries = crud.timeseries.get_latest_price_and_changes(db)
    asset_list = core.asset.generate_asset_list(assets, latest_timeseries)

    return asset_list
