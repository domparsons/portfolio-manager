import logging
import sys
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import yfinance as yf
from sqlalchemy.orm import Session

from app import crud
from app.database import SessionLocal
from app.models import Asset, Timeseries

project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

log_dir = project_root / "logs"
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_dir / "timeseries_update.log"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)


def get_timeseries_data(ticker, last_timestamp=None):
    asset = yf.download(ticker, auto_adjust=False)

    start_date = (datetime.now() - timedelta(days=365 * 10)).strftime("%Y-%m-%d")
    if last_timestamp:
        start_date = last_timestamp.strftime("%Y-%m-%d")

    asset.columns = [col[0] for col in asset.columns]
    asset = asset.reset_index()
    asset.columns = asset.columns.str.lower().str.replace(" ", "_")
    asset = asset[asset["date"] >= start_date]
    return asset


def update_all_assets(db: Session):
    assets = db.query(Asset).all()
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
            timestamp = row.date.to_pydatetime()

            exists = (
                db.query(Timeseries)
                .filter(
                    Timeseries.asset_id == asset.id, Timeseries.timestamp == timestamp
                )
                .first()
            )

            if not exists:
                new_entries.append(
                    Timeseries(
                        asset_id=asset.id,
                        close=float(row.close),
                        volume=int(row.volume) if not pd.isna(row.volume) else None,
                        timestamp=timestamp,
                        adj_close=float(row.adj_close),
                        high=float(row.high),
                        low=float(row.low),
                        open=float(row.open),
                    )
                )

        if new_entries:
            db.bulk_save_objects(new_entries)
            db.commit()
            logger.info(f"Inserted {len(new_entries)} entries for {asset.ticker}")
        else:
            logger.info(f"No new entries for {asset.ticker}")
    try:
        crud.mark_prices_as_refreshed(db)
    except Exception as e:
        logger.error(f"Failed to update last refresh date: {e}")

    logger.info("Timeseries data update completed!")


def main():
    logger.info("Starting daily timeseries update")

    db = None
    try:
        db = SessionLocal()
        update_all_assets(db)
        logger.info("Update completed successfully!")
        return 0
    except Exception as e:
        logger.error(f"Update failed: {e}", exc_info=True)
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
