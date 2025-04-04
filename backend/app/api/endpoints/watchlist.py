from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import get_db
from app.crud import watchlist

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.post("/", response_model=schemas.WatchlistItem)
def add_to_watchlist(
    user_id: str,
    asset_id: int,
    db: Session = Depends(get_db),
):
    user = crud.user.get_user_by_id(db, id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return watchlist.create_watchlist_item(
        user_id=user_id,
        asset_id=asset_id,
        db=db,
    )


@router.get("/", response_model=list[schemas.WatchlistItemBase])
def get_watchlist(
    user_id: str,
    db: Session = Depends(get_db),
):
    user = crud.user.get_user_by_id(db, id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    watchlist_items = watchlist.get_watchlist_items(
        user_id=user_id,
        db=db,
    )

    return watchlist_items
