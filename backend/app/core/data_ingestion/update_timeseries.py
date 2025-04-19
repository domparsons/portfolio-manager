from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf

from app.database import SessionLocal
from app.models import Asset, Timeseries

db = SessionLocal()

assets = db.query(Asset).all()


def get_timeseries_data(ticker, last_timestamp=None):
    asset = yf.Ticker(ticker)

    start_date = (datetime.now() - timedelta(days=365 * 10)).strftime("%Y-%m-%d")
    if last_timestamp:
        start_date = last_timestamp.strftime("%Y-%m-%d")

    data = asset.history(start=start_date, interval="1d")
    return data


for asset in assets:
    latest_timeseries = (
        db.query(Timeseries)
        .filter(Timeseries.asset_id == asset.id)
        .order_by(Timeseries.timestamp.desc())
        .first()
    )

    last_timestamp = latest_timeseries.timestamp if latest_timeseries else None
    timeseries_data = get_timeseries_data(asset.ticker, last_timestamp)

    new_entries = []

    for index, row in timeseries_data.iterrows():
        timestamp = pd.to_datetime(index).to_pydatetime()

        exists = (
            db.query(Timeseries)
            .filter(Timeseries.asset_id == asset.id, Timeseries.timestamp == timestamp)
            .first()
        )

        if not exists:
            new_entries.append(
                Timeseries(
                    asset_id=asset.id,
                    close=float(row["Close"]),
                    volume=int(row["Volume"]) if not pd.isna(row["Volume"]) else None,
                    timestamp=timestamp,
                )
            )

    if new_entries:
        db.bulk_save_objects(new_entries)
        db.commit()
        print(f"Inserted {len(new_entries)} entries for {asset.ticker}")
    else:
        print(f"No new entries for {asset.ticker}")

db.close()
print("Timeseries data update completed!")
