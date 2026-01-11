from datetime import datetime, timezone

from app.database import Base
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, DECIMAL, JSON, ARRAY, Date
from sqlalchemy.orm import relationship


class BacktestHistory(Base):
    __tablename__ = "backtest_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    # Request parameters
    strategy = Column(String, nullable=False)
    asset_ids = Column(ARRAY(Integer), nullable=False)
    tickers = Column(ARRAY(String), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    initial_cash = Column(DECIMAL(precision=15, scale=2), nullable=False)
    parameters = Column(JSON, nullable=False)

    # Computed results
    total_invested = Column(DECIMAL(precision=15, scale=2), nullable=False)
    final_value = Column(DECIMAL(precision=15, scale=2), nullable=False)
    total_return_abs = Column(DECIMAL(precision=15, scale=2), nullable=False)
    total_return_pct = Column(DECIMAL(precision=10, scale=6), nullable=False)
    avg_daily_return = Column(DECIMAL(precision=10, scale=6), nullable=False)
    sharpe_ratio = Column(DECIMAL(precision=10, scale=6), nullable=False)
    max_drawdown = Column(DECIMAL(precision=10, scale=6), nullable=False)
    max_drawdown_duration = Column(Integer, nullable=False)
    volatility = Column(DECIMAL(precision=10, scale=6), nullable=False)
    investments_made = Column(Integer, nullable=False)
    peak_value = Column(DECIMAL(precision=15, scale=2), nullable=False)
    trough_value = Column(DECIMAL(precision=15, scale=2), nullable=False)
    trading_days = Column(Integer, nullable=False)

    owner = relationship("User", back_populates="backtest_history")


