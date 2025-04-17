import polars as pl
from sqlalchemy.orm import Session

from app.models.asset import Asset


def get_all_assets(db: Session, skip: int = 0, limit: int = 100) -> pl.DataFrame:
    assets = db.query(Asset).offset(skip).limit(limit).all()
    assets_data = [asset.__dict__ for asset in assets]
    assets_df = pl.DataFrame(assets_data)
    assets_df = assets_df.drop("_sa_instance_state")

    return assets_df


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
