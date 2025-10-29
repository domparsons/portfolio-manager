import enum
from datetime import datetime

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
    net_quantity: float

    class Config:
        from_attributes = True


class PortfolioValueHistory(BaseModel):
    date: datetime
    value: float
    daily_return: float

    class Config:
        from_attributes = True
