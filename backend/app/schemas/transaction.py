import enum
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_serializer


class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"


class TransactionBase(BaseModel):
    id: int
    user_id: str
    portfolio_name: str
    asset_id: int
    type: TransactionType
    quantity: Decimal
    price: Decimal
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('quantity', 'price', when_used='json')
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    asset_name: str
    ticker: str

    model_config = ConfigDict(from_attributes=True)


class Portfolio(BaseModel):
    portfolio_name: str
    transactions: list[TransactionBase]

    model_config = ConfigDict(from_attributes=True)


class PortfolioHoldings(BaseModel):
    asset_id: str
    asset_name: str
    net_quantity_shares: Decimal
    average_cost_basis: Decimal
    total_cost: Decimal
    current_price: Decimal
    net_value: Decimal
    unrealised_gain_loss: Decimal
    unrealised_gain_loss_pct: Decimal

    model_config = ConfigDict(from_attributes=True)

    @field_serializer(
        'net_quantity_shares', 'average_cost_basis', 'total_cost',
        'current_price', 'net_value', 'unrealised_gain_loss',
        'unrealised_gain_loss_pct', when_used='json'
    )
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class PortfolioValueHistory(BaseModel):
    date: date
    value: Decimal
    daily_return_pct: Decimal
    daily_return_val: Decimal
    cash_flow: Decimal = Decimal("0.0")

    model_config = ConfigDict(from_attributes=True)

    @field_serializer(
        'value', 'daily_return_pct', 'daily_return_val', 'cash_flow',
        when_used='json'
    )
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class PortfolioMetrics(BaseModel):
    total_invested: Decimal
    current_value: Decimal
    total_return_abs: Decimal
    total_return_pct: Decimal
    start_date: date
    end_date: date
    days_analysed: int
    sharpe: Decimal
    max_drawdown: Decimal
    max_drawdown_duration: int
    volatility: Decimal

    model_config = ConfigDict(from_attributes=True)

    @field_serializer(
        'total_invested', 'current_value', 'total_return_abs',
        'total_return_pct', 'sharpe', 'max_drawdown', 'volatility',
        when_used='json'
    )
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)
