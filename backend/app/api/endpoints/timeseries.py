from datetime import datetime, timedelta, timezone
from enum import Enum

import polars as pl
from app.crud.timeseries import get_latest_timeseries_for_asset
from app.database import get_db
from app.schemas.timeseries import TimeseriesSchema
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/timeseries", tags=["timeseries"])


class TimeSeriesRange(str, Enum):
    one_month = "1M"
    three_months = "3M"
    one_year = "1Y"
    five_year = "5Y"
    all = "ALL"


def get_start_date_from_range(timeseries_range: TimeSeriesRange) -> datetime:
    now = datetime.now(timezone.utc)
    if timeseries_range == TimeSeriesRange.one_month:
        return now - timedelta(days=35)
    elif timeseries_range == TimeSeriesRange.three_months:
        return now - timedelta(days=95)
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


@router.get("/sharpe")
def get_sharpe(
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
    periods_per_year = 252
    risk_free_rate = 0.2
    import numpy as np

    result = (
        timeseries_df_rounded.with_columns(
            [
                # Calculate percentage returns
                (pl.col("close").pct_change().alias("returns"))
            ]
        )
        .select(
            [
                # Calculate key statistics
                pl.col("returns").mean().alias("mean_return"),
                pl.col("returns").std().alias("std_return"),
                pl.col("returns").count().alias("n_periods"),
            ]
        )
        .with_columns(
            [
                # Annualize metrics
                (pl.col("mean_return") * periods_per_year).alias("annual_return"),
                (pl.col("std_return") * np.sqrt(periods_per_year)).alias(
                    "annual_volatility"
                ),
            ]
        )
        .with_columns(
            [
                (
                    (pl.col("annual_return") - risk_free_rate)
                    / pl.col("annual_volatility")
                ).alias("sharpe_ratio")
            ]
        )
        .select(["annual_return", "annual_volatility", "sharpe_ratio", "n_periods"])
        .select(["sharpe_ratio"])
    ).item()

    print(result)
