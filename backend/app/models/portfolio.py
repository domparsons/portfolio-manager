from sqlalchemy import (
    Column,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    String,
    CheckConstraint,
    PrimaryKeyConstraint,
    Index,
)
from app.database import Base


class Portfolio(Base):
    __tablename__ = "portfolio"

    # User and asset associations (foreign keys)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    portfolio_name = Column(String, nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)

    # Quantity and price of the asset in the portfolio
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=True)
    purchase_date = Column(DateTime, nullable=True)

    # Composite primary key
    __table_args__ = (
        PrimaryKeyConstraint(
            "user_id", "portfolio_name", "asset_id"
        ),  # Composite primary key
        CheckConstraint(
            "quantity >= 0", name="check_quantity_nonnegative"
        ),  # Prevent negative quantities
        Index(
            "ix_portfolio_user_id", "user_id"
        ),  # Index to optimize queries for user_id
        Index(
            "ix_portfolio_portfolio_name", "portfolio_name"
        ),  # Index to optimize queries for portfolio_name
        Index(
            "ix_portfolio_asset_id", "asset_id"
        ),  # Index to optimize queries for asset_id
    )

    def __repr__(self):
        return f"<Portfolio(user_id={self.user_id}, portfolio_name={self.portfolio_name}, asset_id={self.asset_id})>"
