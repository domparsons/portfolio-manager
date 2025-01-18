from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, security
from app.database import get_db
from app.crud import watchlist

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

@router.post("/", response_model=schemas.WatchlistItem)
def create_watchlist_item(watchlist_item: schemas.WatchlistItemCreate, db: Session = Depends(get_db), current_user: security.User = Depends(security.get_current_user)):
    return watchlist.create_watchlist_item(db=db, watchlist_item=watchlist_item, user_id=current_user.id)

@router.get("/", response_model=list[schemas.WatchlistItem])
def get_watchlist_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: security.User = Depends(
    security.get_current_user)):
    return watchlist.get_watchlist_items(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{watchlist_item_id}", response_model=schemas.WatchlistItem)
def get_watchlist_item(watchlist_item_id: int, db: Session = Depends(get_db)):
    db_watchlist_item = watchlist.get_watchlist_item(db, watchlist_item_id=watchlist_item_id)
    if db_watchlist_item is None:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    return db_watchlist_item

@router.delete("/{watchlist_item_id}", response_model=schemas.WatchlistItem)
def delete_watchlist_item(watchlist_item_id: int, db: Session = Depends(get_db)):
    db_watchlist_item = watchlist.delete_watchlist_item(db, watchlist_item_id=watchlist_item_id)
    if db_watchlist_item is None:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    return db_watchlist_item

@router.get("/user/{user_id}", response_model=list[schemas.WatchlistItem])
def get_watchlist_items_by_user_id(user_id: int, db: Session = Depends(get_db)):
    return watchlist.get_watchlist_items_by_user_id(db=db, user_id=user_id)