from app.models.watchlistitem import WatchlistItem
from sqlalchemy.orm import Session


def create_watchlist_item(asset_id: int, user_id: str, db: Session) -> WatchlistItem:
    db_watchlist_item = WatchlistItem(asset_id=asset_id, user_id=user_id)
    db.add(db_watchlist_item)
    db.commit()
    db.refresh(db_watchlist_item)
    return db_watchlist_item


def get_watchlist_items(user_id: str, db: Session) -> list[type[WatchlistItem]]:
    return db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()
