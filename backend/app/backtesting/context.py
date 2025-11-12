from dataclasses import dataclass
from datetime import date

from app.schemas.backtest import DailySnapshot


@dataclass
class BacktestContext:
    current_date: date
    cash: float
    holdings: dict[int, float]
    price_lookup: dict[tuple[int, date], float]
    history: list[DailySnapshot]
