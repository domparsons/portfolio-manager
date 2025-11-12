import statistics
from datetime import date
from typing import Protocol


class HistoryEntry(Protocol):
    """Protocol defining what a history entry needs for metrics."""

    date: date
    value: float
    daily_return_pct: float
    cash_flow: float


def calculate_sharpe(returns: list[float], risk_free_rate: float = 0.04 / 252) -> float:
    """Calculate annualised Sharpe ratio."""
    if len(returns) < 2:
        return 0.0

    mean_return = statistics.mean(returns)
    std_dev = statistics.stdev(returns)

    if std_dev == 0:
        return 0.0

    return (mean_return - risk_free_rate) / std_dev * (252**0.5)


def calculate_max_drawdown(history: list[HistoryEntry]) -> float:
    """Calculate maximum drawdown from history."""
    max_drawdown = 0.0
    value = 1.0
    running_max = 0.0

    for day in history:
        value = value * (1 + day.daily_return_pct)
        if value > running_max:
            running_max = value

        if running_max > 0:
            current_drawdown = (value - running_max) / running_max
            max_drawdown = min(current_drawdown, max_drawdown)

    return max_drawdown


def calculate_volatility(returns: list[float]) -> float:
    """Calculate annualized volatility."""
    if len(returns) < 2:
        return 0.0

    return statistics.stdev(returns) * (252**0.5)
