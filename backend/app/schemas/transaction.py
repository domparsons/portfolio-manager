import enum
from datetime import date, datetime

from pydantic import BaseModel


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

    class Config:
        from_attributes = True


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    asset_name: str
    ticker: str

    class Config:
        from_attributes = True


class Portfolio(BaseModel):
    portfolio_name: str
    transactions: list[TransactionBase]

    class Config:
        from_attributes = True


class PortfolioHoldings(BaseModel):
    asset_id: str
    asset_name: str
    net_quantity_shares: float
    net_value: float

    class Config:
        from_attributes = True


class PortfolioValueHistory(BaseModel):
    date: date
    value: float
    daily_return_pct: float
    daily_return_val: float
    cash_flow: float = 0.0

    class Config:
        from_attributes = True


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
