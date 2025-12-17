from datetime import date

from app.models import Asset, Timeseries
from app.schemas.asset import AssetDataAvailability
from sqlalchemy import func
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


def get_price_on_date(asset_id: int, date: date, db: Session) -> float | None:
    # Get price for date, or if not a trading day, get previous close
    return (
        db.query(Timeseries.close)
        .filter(Timeseries.asset_id == asset_id, Timeseries.timestamp <= date)
        .order_by(Timeseries.timestamp.desc())
        .limit(1)
        .scalar()
    )


def get_assets_with_data_availability(db: Session) -> list[AssetDataAvailability]:
    results = (
        db.query(
            Asset.id,
            Asset.asset_name,
            Asset.ticker,
            func.min(Timeseries.timestamp).label("first_available_date"),
            func.max(Timeseries.timestamp).label("last_available_date"),
        )
        .join(Timeseries, Timeseries.asset_id == Asset.id)
        .group_by(Asset.id, Asset.asset_name, Asset.ticker)
        .order_by(Asset.id)
        .all()
    )

    return [
        AssetDataAvailability(
            asset_id=row.id,
            asset_name=row.asset_name,
            ticker=row.ticker,
            first_available_date=row.first_available_date,
            last_available_date=row.last_available_date,
        )
        for row in results
    ]


def get_data_availability_for_asset(asset_id: int, db: Session):
    return (
        db.query(
            func.min(Timeseries.timestamp).label("first_date"),
            func.max(Timeseries.timestamp).label("last_date"),
            func.count(Timeseries.timestamp).label("total_days"),
        )
        .filter(Timeseries.asset_id == asset_id)
        .first()
    )
