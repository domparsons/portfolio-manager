from sqlalchemy.orm import Session
from app.models.watchlist import Watchlist
from app.schemas.watchlist import WatchlistCreate

def get_watchlist(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Watchlist).offset(skip).limit(limit).all()

def get_watchlist_item(db: Session, watchlist_id: int):
    return db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()

def create_watchlist_item(db: Session, watchlist: WatchlistCreate):
    db_item = Watchlist(ticker=watchlist.ticker)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_watchlist_item(db: Session, watchlist_id: int):
    db_item = db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item