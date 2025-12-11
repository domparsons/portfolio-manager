from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BacktestRequest(BaseModel):
    strategy: str
    asset_ids: list[int]
    start_date: date
    end_date: date
    initial_cash: float
    parameters: dict

    model_config = ConfigDict(from_attributes=True)


class DailySnapshot(BaseModel):
    date: date
    value: float
    holdings: dict[int, float]
    cash_flow: float
    daily_return_pct: float
    daily_return_abs: float


class BacktestMetrics(BaseModel):
    sharpe: float
    max_drawdown: float
    max_drawdown_duration: int
    volatility: float
    days_analysed: int
    investments_made: int


class BacktestResult(BaseModel):
    start_date: date
    end_date: date
    total_invested: float
    final_value: float
    total_return_pct: float
    total_return_abs: float
    metrics: BacktestMetrics
    history: list[DailySnapshot]


class BacktestResponse(BaseModel):
    backtest_id: UUID
    strategy: str
    parameters: dict
    data: BacktestResult


class MaxDrawdownResponse(BaseModel):
    max_drawdown: float
    max_drawdown_duration: int
