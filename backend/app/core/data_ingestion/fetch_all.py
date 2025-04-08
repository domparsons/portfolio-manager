import polars as pl

from app.database import SessionLocal
from app.models import Asset, Timeseries

# Create a session to interact with the database
db = SessionLocal()

# Perform the join between Asset and Timeseries tables
results = (
    db.query(
        Asset.asset_name,
        Asset.ticker,
        Timeseries.timestamp,
        Timeseries.high,
        Timeseries.low,
        Timeseries.close,
        Timeseries.open,
        Timeseries.volume,
    )
    .join(Timeseries, Timeseries.asset_id == Asset.id)
    .all()
)

# Convert the query results into a list of dictionaries
data = [
    {
        "asset_name": asset_name,
        "ticker": ticker,
        "timestamp": timestamp,
        "high": high,
        "low": low,
        "close": close,
        "open": open_price,
        "volume": volume,
    }
    for asset_name, ticker, timestamp, high, low, close, open_price, volume in results
]

# Create a Polars DataFrame from the list of dictionaries
df = pl.DataFrame(data)
db.close()
