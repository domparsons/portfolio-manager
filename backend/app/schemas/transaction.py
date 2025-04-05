from pydantic import BaseModel
from datetime import datetime
import enum


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
    pass


class Portfolio(BaseModel):
    portfolio_name: str
    transactions: list[TransactionBase]

    class Config:
        orm_mode = True
