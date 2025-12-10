from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import WatchlistItem


def create_watchlist_item(asset_id: int, user_id: str, db: Session) -> WatchlistItem:
    db_watchlist_item = WatchlistItem(asset_id=asset_id, user_id=user_id)
    db.add(db_watchlist_item)
    db.commit()
    db.refresh(db_watchlist_item)
    return db_watchlist_item


def get_watchlist_items(user_id: str, db: Session) -> list[type[WatchlistItem]]:
    return db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()


def update_watchlist_item_alert_percentage(
    asset_id: int,
    user_id: str,
    enable_price_alerts: bool,
    alert_percentage: int,
    db: Session,
) -> WatchlistItem | None:
    watchlist_item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.asset_id == asset_id, WatchlistItem.user_id == user_id)
        .first()
    )

    if not watchlist_item:
        return None

    if not enable_price_alerts:
        watchlist_item.alert_percentage_change = None
    else:
        watchlist_item.alert_percentage_change = Decimal(alert_percentage) / 100

    db.commit()
    db.refresh(watchlist_item)

    return watchlist_item
