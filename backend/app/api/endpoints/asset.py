import polars as pl
from app import core, crud
from app.database import get_db
from app.schemas.asset import AssetListSchema, AssetSchema
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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


@router.get("/get_asset_by_ticker", response_model=AssetListSchema)
def get_asset_by_ticker(ticker: str, db: Session = Depends(get_db)):
    asset = crud.asset.get_asset_by_ticker(db, ticker)
    latest_timeseries = crud.timeseries.get_latest_price_and_changes(db)
    filtered = latest_timeseries.filter(pl.col("asset_id") == asset["id"])
    ts_data = filtered.to_dicts()[0]
    asset.update(ts_data)
    if asset is None:
        return None

    return asset


@router.get("/check_asset_in_watchlist/")
def check_asset_in_watchlist(ticker: str, user_id: str, db: Session = Depends(get_db)):
    asset = crud.asset.get_asset_by_ticker(db, ticker)
    user_watchlist_items = crud.get_watchlist_items(user_id, db)
    watchlist_ids = [item.asset_id for item in user_watchlist_items]
    return asset["id"] in watchlist_ids
