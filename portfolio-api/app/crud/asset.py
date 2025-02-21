from app.models.asset import Asset
from sqlalchemy.orm import Session
import polars as pl


def get_all_assets(db: Session, skip: int = 0, limit: int = 100):
    assets = db.query(Asset).offset(skip).limit(limit).all()
    assets_data = [asset.__dict__ for asset in assets]
    assets_df = pl.DataFrame(assets_data)
    assets_df = assets_df.drop("_sa_instance_state")

    return assets_df
