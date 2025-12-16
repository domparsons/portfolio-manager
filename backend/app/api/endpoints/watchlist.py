from datetime import date, timedelta

import polars as pl
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.auth.dependencies import get_current_user
from app.crud import get_latest_timeseries_for_asset, watchlist
from app.database import get_db
from app.logger import logger
from app.schemas import WatchlistAssetAlert
from app.services.asset_service import generate_asset_list
from app.services.price_service import PriceService

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.post("/add_to_watchlist", response_model=schemas.WatchlistItem)
def add_to_watchlist(
    asset_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user
    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        logger.error(f"User {user_id[-8:]} not found")
        raise HTTPException(status_code=404, detail="User not found")

    return watchlist.create_watchlist_item(
        user_id=user_id,
        asset_id=asset_id,
        db=db,
    )


@router.delete("/remove_from_watchlist", response_model=schemas.WatchlistItem)
def remove_from_watchlist(
    asset_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user
    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        logger.error(f"User {user_id[-8:]} not found")
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
        logger.error(
            f"Watchlist item not found for user {user_id} and asset {asset_id}"
        )
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    db.delete(watchlist_item)
    db.commit()
    logger.info(f"Asset {asset_id} removed from user {user_id[-8:]} watchlist")
    return watchlist_item


@router.get("/", response_model=list[schemas.AssetListSchema])
def get_watchlist(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user
    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        logger.error(f"User {user_id[-8:]} not found")
        raise HTTPException(status_code=404, detail="User not found")

    watchlist_items = watchlist.get_watchlist_items(
        user_id=user_id,
        db=db,
    )

    if not watchlist_items:
        logger.info(f"No watchlist items fund for user {user_id[-8:]}")
        return []

    asset_ids = [item.asset_id for item in watchlist_items]

    assets = crud.asset.get_all_assets(db)
    latest_timeseries = crud.timeseries.get_latest_price_and_changes(db)
    assets = [asset for asset in assets if asset.id in asset_ids]
    asset_list = generate_asset_list(assets, latest_timeseries)

    logger.info(f"Fetched watchlist for user {user_id[-8:]}")

    return asset_list


@router.get("/alerts", response_model=list[schemas.WatchlistAssetAlert])
def get_watchlist_alerts(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user
    yesterday = date.today() - timedelta(days=1)

    yesterday_trading_day = PriceService(db).is_trading_day(yesterday)

    # If prev day (latest data) is not a trading day, there will be no price change dod
    if not yesterday_trading_day:
        logger.info(f"No new trading data since {yesterday_trading_day}")
        return []

    watchlist_items = watchlist.get_watchlist_items(
        user_id=user_id,
        db=db,
    )

    asset_data = []

    for item in watchlist_items:
        if item.alert_percentage_change is None:
            continue

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

        if abs(change_pct) < item.alert_percentage_change:
            continue

        recent_asset_data = WatchlistAssetAlert(
            id=asset_id,
            ticker=item.asset.ticker,
            change_pct=change_pct,
            current_price=latest_price,
            previous_close=previous_price,
        )

        asset_data.append(recent_asset_data)

    logger.info(
        f"Checked {len(watchlist_items)} watchlist items for user {user_id[-8:]}, "
        f"triggered {len(asset_data)} alerts"
    )

    return asset_data
