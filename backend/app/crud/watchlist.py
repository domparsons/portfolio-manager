from sqlalchemy.orm import Session
from app.models.watchlistitem import WatchlistItem
from app.schemas.watchlist import WatchlistItemCreate


def create_watchlist_item(db: Session, watchlist_item: WatchlistItemCreate, user_id: int):
    db_watchlist_item = WatchlistItem(symbol=watchlist_item.symbol, user_id=user_id)
    db.add(db_watchlist_item)
    db.commit()
    db.refresh(db_watchlist_item)
    return db_watchlist_item


def get_watchlist_items(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_watchlist_item(db: Session, watchlist_item_id: int):
    return db.query(WatchlistItem).filter(WatchlistItem.id == watchlist_item_id).first()


def delete_watchlist_item(db: Session, watchlist_item_id: int):
    db_watchlist_item = (
        db.query(WatchlistItem).filter(WatchlistItem.id == watchlist_item_id).first()
    )
    if db_watchlist_item:
        db.delete(db_watchlist_item)
        db.commit()
    return db_watchlist_item


def get_watchlist_items_by_user_id(db: Session, user_id: int):
    return db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()
