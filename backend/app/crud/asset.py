from app.models import Asset
from sqlalchemy.orm import Session


def get_all_assets(db: Session, skip: int = 0, limit: int = 100) -> list[Asset]:
    return db.query(Asset).offset(skip).limit(limit).all()


def get_asset_by_id(asset_id: int, db: Session) -> dict | None:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset:
        return asset.__dict__
    else:
        return None


def get_asset_by_ticker(db: Session, ticker: str) -> dict | None:
    asset = db.query(Asset).filter(Asset.ticker == ticker.upper()).first()
    if asset:
        return asset.__dict__
    else:
        return None
