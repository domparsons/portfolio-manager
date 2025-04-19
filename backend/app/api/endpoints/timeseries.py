from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud.timeseries import get_latest_timeseries_for_asset
from app.database import get_db
from app.schemas.timeseries import TimeseriesSchema
import polars as pl
from enum import Enum
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/timeseries", tags=["timeseries"])


class TimeSeriesRange(str, Enum):
    one_week = "1W"
    one_month = "1M"
    three_months = "3M"
    one_year = "1Y"
    five_year = "5Y"
    all = "ALL"


def get_start_date_from_range(timeseries_range: TimeSeriesRange) -> datetime:
    now = datetime.now(timezone.utc)
    if timeseries_range == TimeSeriesRange.one_week:
        return now - timedelta(weeks=1)
    elif timeseries_range == TimeSeriesRange.one_month:
        return now - timedelta(days=30)
    elif timeseries_range == TimeSeriesRange.three_months:
        return now - timedelta(days=90)
    elif timeseries_range == TimeSeriesRange.one_year:
        return now - timedelta(days=365)
    elif timeseries_range == TimeSeriesRange.all:
        return datetime.min
    return now


@router.get("/timeseries_for_asset", response_model=list[TimeseriesSchema])
def get_latest_timeseries(
    asset_id: int,
    timeseries_range: TimeSeriesRange = Query(),
    db: Session = Depends(get_db),
):
    timeseries_df = get_latest_timeseries_for_asset(asset_id, db)

    start_date = get_start_date_from_range(timeseries_range).replace(tzinfo=None)
    if timeseries_range != TimeSeriesRange.all:
        timeseries_df = timeseries_df.filter(pl.col("timestamp") >= pl.lit(start_date))
    timeseries_df_sorted = timeseries_df.sort(by="timestamp")
    timeseries_df_rounded = timeseries_df_sorted.with_columns(
        pl.col("close").round(2).alias("close"),
        # pl.col("timestamp").dt.strftime("%d %b %Y").alias("timestamp"),
    )
    timeseries_list = timeseries_df_rounded.to_dicts()
    return timeseries_list
