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


def create_trading_days(year: int, month: int, days: list[int]) -> list[date]:
    """
    Create a list of trading days for a given month.

    Args:
        year: Year (e.g., 2024)
        month: Month (1-12)
        days: List of day numbers that are trading days (e.g., [1, 2, 3, 8, 9])

    Returns:
        List of date objects representing trading days

    Example:
        # Jan 2024: Trading days on 1st, 2nd, 3rd, 8th, 9th
        create_trading_days(2024, 1, [1, 2, 3, 8, 9])
    """
    return [date(year, month, day) for day in days]


def create_multi_month_trading_days(
    year: int, month_to_days: dict[int, list[int]]
) -> list[date]:
    """
    Create trading days across multiple months.

    Args:
        year: Year
        month_to_days: Dict mapping month number to list of trading day numbers

    Returns:
        Sorted list of all trading days

    Example:
        create_multi_month_trading_days(2024, {
            1: [2, 3, 4, 5],  # Jan: first trading day is 2nd
            2: [1, 2, 5, 6],  # Feb: first trading day is 1st
            3: [1, 4, 5, 6],  # Mar: first trading day is 1st
        })
    """
    all_days = []
    for month, days in month_to_days.items():
        all_days.extend(create_trading_days(year, month, days))
    return sorted(all_days)


def create_mock_history_with_value(value: Decimal) -> list[DailySnapshot]:
    """
    Create mock portfolio history with a specific value.

    Args:
        value: The portfolio value to use

    Returns:
        List with single DailySnapshot at the given value
    """
    from app.schemas.backtest import DailySnapshot

    return [
        DailySnapshot(
            date=date(2024, 1, 1),
            value=value,
            cash_flow=Decimal("0"),
            holdings={},
            daily_return_abs=Decimal("0"),
            daily_return_pct=Decimal("0"),
        )
    ]
