from sqlalchemy.orm import Session
from app.models.watchlistitem import WatchlistItem
from app.schemas.watchlist import WatchlistCreate


def get_watchlist(db: Session, skip: int = 0, limit: int = 10):
    return db.query(WatchlistItem).offset(skip).limit(limit).all()


def get_watchlist_item(db: Session, watchlist_id: int):
    return db.query(WatchlistItem).filter(WatchlistItem.id == watchlist_id).first()


def create_watchlist_item(db: Session, watchlist: WatchlistCreate):
    db_item = WatchlistItem(ticker=watchlist.ticker)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_watchlist_item(db: Session, watchlist_id: int):
    db_item = db.query(WatchlistItem).filter(WatchlistItem.id == watchlist_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item
