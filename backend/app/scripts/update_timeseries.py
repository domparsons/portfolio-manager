import yfinance as yf
from app.database import SessionLocal
from app.models import Asset, Timeseries

db = SessionLocal()

assets = db.query(Asset).all()


def get_timeseries_data(ticker, last_timestamp=None):
    asset = yf.Ticker(ticker)
    if last_timestamp:
        data = asset.history(start=last_timestamp.strftime("%Y-%m-%d"), interval="1d")
    else:
        data = asset.history(period="max", interval="1d")

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

    for index, row in timeseries_data.iterrows():
        timestamp = row.name
        existing_timeseries = (
            db.query(Timeseries)
            .filter(Timeseries.asset_id == asset.id, Timeseries.timestamp == timestamp)
            .first()
        )

        if not existing_timeseries:
            new_timeseries = Timeseries(
                asset_id=asset.id,
                high=row["High"],
                low=row["Low"],
                close=row["Close"],
                open=row["Open"],
                volume=row["Volume"],
                timestamp=timestamp,
            )
            db.add(new_timeseries)
            db.commit()
            print(f"Added new timeseries data for {asset.ticker} on {timestamp}")
        else:
            print(f"Timeseries data for {asset.ticker} on {timestamp} already exists. Skipping.")

db.close()

print("Timeseries data update completed!")
