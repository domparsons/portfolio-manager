from app import core, crud, models, schemas
from app.crud import watchlist
from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.post("/", response_model=schemas.WatchlistItem)
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


@router.delete("/remove_from_watchlist", response_model=schemas.WatchlistItem)
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
        .filter(models.WatchlistItem.asset_id == asset_id)
        .first()
    )

    if not watchlist_item:
        return None

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

    asset_ids = [item.asset_id for item in watchlist_items]

    assets = crud.asset.get_all_assets(db)
    latest_timeseries = crud.timeseries.get_latest_price_and_changes(db)
    assets = [asset for asset in assets if asset.id in asset_ids]
    asset_list = core.asset.generate_asset_list(assets, latest_timeseries)

    return asset_list
