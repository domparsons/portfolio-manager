from sqlalchemy.orm import Session
from app import models, schemas
from typing import Optional


def get_watchlist_by_user(db: Session, user_id: int) -> Optional[models.Watchlist]:
    """Get a single watchlist for a given user ID"""
    return db.query(models.Watchlist).filter(models.Watchlist.user_id == user_id).first()


def add_to_watchlist(db: Session, watchlist: schemas.Watchlist) -> models.Watchlist:
    """Add a stock symbol to an existing user's watchlist or create a new watchlist if none exists."""

    db_watchlist = db.query(models.Watchlist).filter(models.Watchlist.user_id == watchlist.user_id).first()

    if not db_watchlist:
        db_watchlist = models.Watchlist(user_id=watchlist.user_id)
        db.add(db_watchlist)
        db.commit()
        db.refresh(db_watchlist)

    asset = models.Asset(symbol=watchlist.symbol, watchlist_id=db_watchlist.id)
    db.add(asset)
    db.commit()

    return db_watchlist


def delete_watchlist(db: Session, watchlist_id: int) -> models.Watchlist:
    """Delete a watchlist by ID"""
    watchlist = db.query(models.Watchlist).filter(models.Watchlist.id == watchlist_id).first()
    db.delete(watchlist)
    db.commit()
    return watchlist
