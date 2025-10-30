import polars as pl
from app.models.timeseries import Timeseries
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased


def get_latest_price_and_changes(db: Session) -> pl.DataFrame:
    subquery = db.query(
        Timeseries.asset_id,
        Timeseries.timestamp,
        Timeseries.close.label("price"),
        func.row_number()
        .over(partition_by=Timeseries.asset_id, order_by=Timeseries.timestamp.desc())
        .label("rank"),
    ).subquery()

    ranked_timeseries = aliased(subquery)

    latest_and_second_latest = (
        db.query(
            ranked_timeseries.c.asset_id,
            ranked_timeseries.c.timestamp,
            ranked_timeseries.c.price,
            ranked_timeseries.c.rank,
        )
        .filter(ranked_timeseries.c.rank.in_([1, 2]))
        .all()
    )

    timeseries_data = [
        {
            "asset_id": row.asset_id,
            "timestamp": row.timestamp,
            "price": row.price,
            "rank": row.rank,
        }
        for row in latest_and_second_latest
    ]

    timeseries_df = pl.DataFrame(timeseries_data)

    latest_df = timeseries_df.filter(timeseries_df["rank"] == 1).rename(
        {"price": "latest_price"}
    )
    second_latest_df = timeseries_df.filter(timeseries_df["rank"] == 2).rename(
        {"price": "second_latest_price"}
    )

    combined_df = latest_df.join(second_latest_df, on="asset_id", how="inner")

    combined_df = combined_df.with_columns(
        [
            (combined_df["latest_price"] - combined_df["second_latest_price"]).alias(
                "price_change"
            ),
            (
                (
                    (combined_df["latest_price"] - combined_df["second_latest_price"])
                    / combined_df["second_latest_price"]
                )
                * 100
            ).alias("percentage_change"),
        ]
    )

    result_df = combined_df.select(
        ["asset_id", "latest_price", "price_change", "percentage_change", "timestamp"]
    )

    return result_df


def get_latest_timeseries_for_asset(asset_id: int, db: Session) -> pl.DataFrame:
    from datetime import datetime, timedelta

    one_month_ago = datetime.now() - timedelta(days=365 * 8)
    timeseries = (
        db.query(Timeseries)
        .filter(Timeseries.asset_id == asset_id, Timeseries.timestamp >= one_month_ago)
        .all()
    )
    timeseries_data = [ts.__dict__ for ts in timeseries]
    timeseries_df = pl.DataFrame(timeseries_data)
    timeseries_df = timeseries_df.drop("_sa_instance_state")

    return timeseries_df
