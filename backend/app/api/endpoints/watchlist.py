from datetime import date, timedelta

import polars as pl
from app import core, crud, models, schemas
from app.crud import get_latest_timeseries_for_asset, watchlist
from app.database import get_db
from app.schemas import WatchlistAssetAlert
from app.services.price_service import PriceService
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.post("/add_to_watchlist", response_model=schemas.WatchlistItem)
def add_to_watchlist(
    user_id: str,
    asset_id: int,
    db: Session = Depends(get_db),
):
    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return watchlist.create_watchlist_item(
        user_id=user_id,
        asset_id=asset_id,
        db=db,
    )


@router.delete(
    "/remove_from_watchlist",
    response_model=schemas.WatchlistItem,
)
def remove_from_watchlist(
    user_id: str,
    asset_id: int,
    db: Session = Depends(get_db),
):
    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    watchlist_item = (
        db.query(models.WatchlistItem)
        .filter(
            models.WatchlistItem.asset_id == asset_id,
            models.WatchlistItem.user_id == user_id,
        )
        .first()
    )

    if not watchlist_item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    db.delete(watchlist_item)
    db.commit()

    return watchlist_item


@router.get("/{user_id}", response_model=list[schemas.AssetListSchema])
def get_watchlist(
    user_id: str,
    db: Session = Depends(get_db),
):
    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    watchlist_items = watchlist.get_watchlist_items(
        user_id=user_id,
        db=db,
    )

    if not watchlist_items:
        return []

    asset_ids = [item.asset_id for item in watchlist_items]

    assets = crud.asset.get_all_assets(db)
    latest_timeseries = crud.timeseries.get_latest_price_and_changes(db)
    assets = [asset for asset in assets if asset.id in asset_ids]
    asset_list = core.asset.generate_asset_list(assets, latest_timeseries)

    return asset_list


@router.get("/alerts/{user_id}", response_model=list[schemas.WatchlistAssetAlert])
def get_watchlist_alerts(user_id: str, db: Session = Depends(get_db)):
    yesterday = date.today() - timedelta(days=1)

    yesterday_trading_day = PriceService(db).is_trading_day(yesterday)

    if not yesterday_trading_day:
        return []

    watchlist_items = watchlist.get_watchlist_items(
        user_id=user_id,
        db=db,
    )

    asset_data = []

    for item in watchlist_items:
        asset_id: int = item.asset_id  # type: ignore
        timeseries_df = get_latest_timeseries_for_asset(asset_id=asset_id, db=db)

        if timeseries_df.is_empty():
            continue

        closes = (
            timeseries_df.sort(pl.col("timestamp"), descending=True)
            .select(pl.col("adj_close"))
            .head(2)
            .to_series()
            .to_list()
        )

        if len(closes) < 2:
            continue

        latest_price = closes[0]
        previous_price = closes[1]

        change_pct = (latest_price - previous_price) / previous_price

        if abs(change_pct) < 0.05:
            continue

        recent_asset_data = WatchlistAssetAlert(
            id=asset_id,
            ticker=item.asset.ticker,
            change_pct=change_pct,
            current_price=latest_price,
            previous_close=previous_price,
        )

        asset_data.append(recent_asset_data)

    return asset_data
