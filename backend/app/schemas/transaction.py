import enum
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"


class TransactionBase(BaseModel):
    id: int
    user_id: str
    portfolio_name: str
    asset_id: int
    type: TransactionType
    quantity: float
    price: float
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


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
    net_quantity_shares: float
    average_cost_basis: float
    total_cost: float
    current_price: float
    net_value: float
    unrealised_gain_loss: float
    unrealised_gain_loss_pct: float

    model_config = ConfigDict(from_attributes=True)


class PortfolioValueHistory(BaseModel):
    date: date
    value: float
    daily_return_pct: float
    daily_return_val: float
    cash_flow: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class PortfolioMetrics(BaseModel):
    total_invested: float
    current_value: float
    total_return_abs: float
    total_return_pct: float
    start_date: date
    end_date: date
    days_analysed: int
    sharpe: float
    max_drawdown: float
    max_drawdown_duration: int
    volatility: float
