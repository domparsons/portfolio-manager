import polars as pl
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.crud import update_watchlist_item_alert_percentage
from app.database import get_db
from app.schemas.asset import AssetInWatchlist, AssetListSchema, AssetSchema
from app.services.asset_service import generate_asset_list

router = APIRouter(prefix="/asset", tags=["asset"])


@router.get("/", response_model=list[AssetSchema])
def get_all_assets(db: Session = Depends(get_db)):
    return crud.asset.get_all_assets(db)


@router.get("/asset_list", response_model=list[AssetListSchema])
def get_asset_list(db: Session = Depends(get_db)):
    assets = crud.asset.get_all_assets(db)
    latest_timeseries = crud.timeseries.get_latest_price_and_changes(db)
    asset_list = generate_asset_list(assets, latest_timeseries)

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


@router.get("/check_asset_in_watchlist", response_model=AssetInWatchlist)
def check_asset_in_watchlist(
    ticker: str, user_id: str, db: Session = Depends(get_db)
) -> AssetInWatchlist:
    asset = crud.asset.get_asset_by_ticker(db, ticker)
    user_watchlist_items = crud.get_watchlist_items(user_id, db)
    watchlist_ids = [item.asset_id for item in user_watchlist_items]
    percentage_map = {
        item.asset_id: item.alert_percentage_change for item in user_watchlist_items
    }
    alert_percentage = percentage_map.get(asset["id"], None)

    return AssetInWatchlist(
        asset_in_watchlist=asset["id"] in watchlist_ids,
        alert_percentage=alert_percentage,
    )


from fastapi import HTTPException, status


@router.post("/watchlist_alerts")
def watchlist_alerts(
    asset_id: int,
    user_id: str,
    enable_price_alerts: bool,
    asset_alert_percentage: int,
    db: Session = Depends(get_db),
):
    user_watchlist_items = crud.get_watchlist_items(user_id, db)
    watchlist_ids = [item.asset_id for item in user_watchlist_items]

    if asset_id not in watchlist_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found in watchlist"
        )

    result = update_watchlist_item_alert_percentage(
        asset_id, user_id, enable_price_alerts, asset_alert_percentage, db
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist item not found"
        )

    return {
        "message": "Alert settings updated successfully",
        "alert_percentage": result.alert_percentage_change,
    }
