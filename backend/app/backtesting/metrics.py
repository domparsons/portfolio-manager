import statistics
from datetime import date
from decimal import Decimal
from typing import Protocol

from app.schemas.backtest import MaxDrawdownResponse


class HistoryEntry(Protocol):
    """Protocol defining what a history entry needs for metrics."""

    date: date
    value: Decimal
    daily_return_pct: Decimal
    cash_flow: Decimal


def calculate_sharpe(
    returns: list[Decimal], risk_free_rate: Decimal = Decimal("0.04") / Decimal("252")
) -> Decimal:
    """Calculate annualised Sharpe ratio."""
    if len(returns) < 2:
        return Decimal("0")

    mean_return = Decimal(statistics.mean(returns))
    std_dev = Decimal(statistics.stdev(returns))

    if std_dev == 0:
        return Decimal("0")

    return (mean_return - Decimal(risk_free_rate)) / std_dev * Decimal(252**0.5)


def calculate_max_drawdown(history: list[HistoryEntry]) -> MaxDrawdownResponse:
    """Calculate maximum drawdown from actual portfolio values.

    Uses actual portfolio values rather than compounded returns to show
    the drawdown a user would actually experience looking at their portfolio.
    """
    if not history:
        return MaxDrawdownResponse(max_drawdown=Decimal("0"), max_drawdown_duration=0)

    max_drawdown = Decimal("0")
    max_drawdown_duration = 0
    running_max = Decimal("0")
    running_max_date = None

    for day in history:
        value = day.value

        if value > running_max:
            running_max = value
            running_max_date = day.date

        if running_max > 0 and running_max_date is not None:
            current_drawdown = (value - running_max) / running_max
            if current_drawdown < max_drawdown:
                max_drawdown = current_drawdown
                max_drawdown_duration = (day.date - running_max_date).days

    return MaxDrawdownResponse(
        max_drawdown=Decimal(max_drawdown), max_drawdown_duration=max_drawdown_duration
    )


def calculate_volatility(returns: list[Decimal]) -> Decimal:
    """Calculate annualized volatility."""
    if len(returns) < 2:
        return Decimal("0")

    return Decimal(statistics.stdev(returns)) * (252 ** Decimal("0.5"))
