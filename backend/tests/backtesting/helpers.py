"""Test helpers for backtesting tests"""

from datetime import date
from decimal import Decimal
from app.backtesting.context import BacktestContext
from app.schemas.backtest import DailySnapshot


def create_mock_context(
    current_date: date,
    holdings: dict[int, Decimal] | None = None,
    price_data: dict[tuple[int, date], float] | None = None,
    history: list[DailySnapshot] | None = None,
) -> BacktestContext:
    """
    Factory for creating BacktestContext instances for testing.

    Args:
        current_date: The date for this context
        holdings: Dict mapping asset_id to share count (defaults to empty)
        price_data: Dict mapping (asset_id, date) to price (defaults to $100)
        history: List of DailySnapshot (defaults to empty)

    Returns:
        BacktestContext ready for testing
    """
    if holdings is None:
        holdings = {}

    if price_data is None:
        # Default: asset 1 always costs $100
        price_data = {(1, current_date): 100.0}

    if history is None:
        history = []

    return BacktestContext(
        current_date=current_date,
        holdings=holdings,
        price_lookup=price_data,
        history=history,
    )


def create_price_lookup(
    asset_id: int,
    start_date: date,
    num_days: int,
    price: float | list[float],
) -> dict[tuple[int, date], float]:
    """
    Generate synthetic price data for testing.

    Args:
        asset_id: The asset ID
        start_date: Starting date
        num_days: Number of consecutive days
        price: Either a single price (flat) or list of prices per day

    Returns:
        Price lookup dict: {(asset_id, date): price}
    """
    from datetime import timedelta

    price_lookup = {}

    for day_offset in range(num_days):
        current_date = start_date + timedelta(days=day_offset)

        if isinstance(price, list):
            current_price = price[day_offset]
        else:
            current_price = price

        price_lookup[(asset_id, current_date)] = current_price

    return price_lookup


def create_multi_asset_price_lookup(
    asset_prices: dict[int, float],
    start_date: date,
    num_days: int,
) -> dict[tuple[int, date], float]:
    """
    Generate price data for multiple assets with flat prices.

    Args:
        asset_prices: Dict mapping asset_id to flat price
        start_date: Starting date
        num_days: Number of consecutive days

    Returns:
        Price lookup dict for all assets
    """
    price_lookup = {}

    for asset_id, price in asset_prices.items():
        asset_lookup = create_price_lookup(asset_id, start_date, num_days, price)
        price_lookup.update(asset_lookup)

    return price_lookup
