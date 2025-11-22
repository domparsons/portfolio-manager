from datetime import date

from app import models
from sqlalchemy.orm import Session


class PriceService:
    """
    Service for fetching and managing price data.
    Handles trading days, price lookups, and caching.
    """

    def __init__(self, db: Session):
        self.db = db
        self._price_cache: dict[tuple[int, date], float] = {}

    def get_trading_days(self, start_date: date, end_date: date) -> list[date]:
        """
        Get all trading days (days with market data) between start and end dates.

        Args:
            start_date: Start of date range
            end_date: End of date range

        Returns:
            list of date objects in chronological order
        """
        trading_days_raw = (
            self.db.query(models.Timeseries.timestamp)
            .filter(
                models.Timeseries.timestamp >= start_date,
                models.Timeseries.timestamp <= end_date,
            )
            .distinct()
            .order_by(models.Timeseries.timestamp)
            .all()
        )

        trading_days = [
            row[0].date() if isinstance(row[0], date) else row[0]
            for row in trading_days_raw
        ]

        return trading_days

    def get_price_lookup(
        self, asset_ids: list[int], start_date: date, end_date: date
    ) -> dict[tuple[int, date], float]:
        """
        Fetch all price data for given assets in date range.
        Returns a dictionary for O(1) lookups.

        Args:
            asset_ids: list of asset IDs to fetch prices for
            start_date: Start of date range
            end_date: End of date range

        Returns:
            dictionary with (asset_id, date) -> price mapping
        """
        timeseries_data = (
            self.db.query(
                models.Timeseries.asset_id,
                models.Timeseries.timestamp,
                models.Timeseries.adj_close,
            )
            .filter(
                models.Timeseries.asset_id.in_(asset_ids),
                models.Timeseries.timestamp >= start_date,
                models.Timeseries.timestamp <= end_date,
            )
            .all()
        )

        price_lookup = {
            (row.asset_id, row.timestamp.date()): float(row.adj_close)
            for row in timeseries_data
        }

        return price_lookup

    def get_price(self, asset_id: int, date: date) -> float | None:
        """
        Get price for a specific asset on a specific date.
        Uses cache to avoid repeated lookups.

        Args:
            asset_id: Asset ID
            date: Date to get price for

        Returns:
            Price as float, or None if not found
        """
        cache_key = (asset_id, date)

        if cache_key in self._price_cache:
            return self._price_cache[cache_key]

        price_data = (
            self.db.query(models.Timeseries.adj_close)
            .filter(
                models.Timeseries.asset_id == asset_id,
                models.Timeseries.timestamp == date,
            )
            .first()
        )

        if price_data:
            price = float(price_data[0])
            self._price_cache[cache_key] = price
            return price

        return None

    def get_latest_price(self, asset_id: int) -> float | None:
        """
        Get the most recent price for an asset.

        Args:
            asset_id: Asset ID

        Returns:
            Latest price as float, or None if not found
        """
        price_data = (
            self.db.query(models.Timeseries.adj_close)
            .filter(models.Timeseries.asset_id == asset_id)
            .order_by(models.Timeseries.timestamp.desc())
            .first()
        )

        if price_data:
            return float(price_data[0])

        return None

    @staticmethod
    def is_trading_day(day: date) -> bool:
        return day.weekday() < 5
