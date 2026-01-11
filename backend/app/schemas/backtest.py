from datetime import date
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Json, field_serializer


class BacktestRequest(BaseModel):
    strategy: str
    asset_ids: list[int]
    tickers: list[str]
    start_date: date
    end_date: date
    initial_cash: Decimal
    parameters: dict[str, Any]

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("initial_cash", when_used="json")
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class LLMBacktestParams(BaseModel):
    strategy: str
    asset_ids: list[int]
    tickers: list[str]
    start_date: date
    end_date: date
    initial_cash: Decimal
    parameters: Json
    comment: str
    reasoning: str

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("initial_cash", when_used="json")
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class DailySnapshot(BaseModel):
    date: date
    value: Decimal
    holdings: dict[int, Decimal]
    cash_flow: Decimal
    daily_return_pct: Decimal
    daily_return_abs: Decimal

    @field_serializer(
        "value", "cash_flow", "daily_return_pct", "daily_return_abs", when_used="json"
    )
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)

    @field_serializer("holdings", when_used="json")
    def serialize_holdings(self, value: dict[int, Decimal]) -> dict[int, float]:
        return {k: float(v) for k, v in value.items()}


class BacktestMetrics(BaseModel):
    sharpe: Decimal
    max_drawdown: Decimal
    max_drawdown_duration: int
    volatility: Decimal
    days_analysed: int
    investments_made: int
    peak_value: Decimal
    trough_value: Decimal

    @field_serializer("sharpe", "max_drawdown", "volatility", when_used="json")
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class BacktestResult(BaseModel):
    start_date: date
    end_date: date
    total_invested: Decimal
    final_value: Decimal
    total_return_pct: Decimal
    total_return_abs: Decimal
    avg_daily_return: Decimal
    metrics: BacktestMetrics
    history: list[DailySnapshot]

    @field_serializer(
        "total_invested",
        "final_value",
        "total_return_pct",
        "total_return_abs",
        when_used="json",
    )
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class BacktestResponse(BaseModel):
    backtest_id: UUID
    strategy: str
    parameters: dict
    data: BacktestResult


class MaxDrawdownResponse(BaseModel):
    max_drawdown: Decimal
    max_drawdown_duration: int


class BacktestAnalysis(BaseModel):
    strategy: str
    parameters: dict
    tickers: list[str]
    data: BacktestResult
