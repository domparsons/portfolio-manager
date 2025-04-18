from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.timeseries import get_latest_timeseries_for_asset
from app.database import get_db
from app.schemas.timeseries import TimeseriesSchema
import polars as pl

router = APIRouter(prefix="/timeseries", tags=["timeseries"])


@router.get("/timeseries_for_asset", response_model=list[TimeseriesSchema])
def get_latest_timeseries(asset_id, db: Session = Depends(get_db)):
    timeseries_df = get_latest_timeseries_for_asset(asset_id, db)
    timeseries_df_sorted = timeseries_df.sort(by="timestamp")
    timeseries_df_rounded = timeseries_df_sorted.with_columns(
        pl.col("close").round(2).alias("close"),
        # pl.col("timestamp").dt.strftime("%d %b %Y").alias("timestamp"),
    )
    timeseries_list = timeseries_df_rounded.to_dicts()
    return timeseries_list
