import enum
from datetime import datetime, timezone

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.database import Base


class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    portfolio_name = Column(String, nullable=False)  # multiple portfolios per user
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)

    type = Column(Enum(TransactionType), nullable=False)  # buy or sell
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
        CheckConstraint("price >= 0", name="check_price_nonnegative"),
        Index("ix_transaction_user_portfolio", "user_id", "portfolio_name"),
    )

    user = relationship("User", back_populates="transactions")
    asset = relationship("Asset")
