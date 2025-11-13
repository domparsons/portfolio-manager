from pydantic import BaseModel
from datetime import date


class BacktestRequest(BaseModel):
    strategy: str
    asset_ids: list[int]
    start_date: date
    end_date: date
    initial_cash: float
    parameters: dict

    class Config:
        from_attributes = True


class DailySnapshot(BaseModel):
    date: date
    value: float
    cash: float
    holdings: dict[int, float]
    cash_flow: float
    daily_return_pct: float
    daily_return_abs: float


class BacktestMetrics(BaseModel):
    sharpe: float
    max_drawdown: float
    volatility: float
    days_analysed: int


class BacktestResult(BaseModel):
    start_date: date
    end_date: date
    initial_value: float
    final_value: float
    total_return_pct: float
    total_return_abs: float
    metrics: BacktestMetrics
    history: list[DailySnapshot]


class BacktestResponse(BaseModel):
    backtest_id: str
    strategy: str
    parameters: dict
    data: BacktestResult
