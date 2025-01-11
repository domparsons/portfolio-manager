from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.watchlist import Watchlist, WatchlistCreate
from app.config.database import get_db
from app.crud.watchlist import (
    get_watchlist,
    get_watchlist_item,
    create_watchlist_item,
    delete_watchlist_item,
)

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("/", response_model=list[Watchlist])
def read_watchlist(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_watchlist(db, skip=skip, limit=limit)


@router.get("/{watchlist_id}", response_model=Watchlist)
def read_watchlist_item(watchlist_id: int, db: Session = Depends(get_db)):
    db_item = get_watchlist_item(db, watchlist_id=watchlist_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Dashboard item not found")
    return db_item


@router.post("/", response_model=Watchlist)
def create_watchlist(watchlist: WatchlistCreate, db: Session = Depends(get_db)):
    return create_watchlist_item(db, watchlist=watchlist)


@router.delete("/{watchlist_id}", response_model=Watchlist)
def delete_watchlist(watchlist_id: int, db: Session = Depends(get_db)):
    db_item = delete_watchlist_item(db, watchlist_id=watchlist_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Dashboard item not found")
    return db_item
