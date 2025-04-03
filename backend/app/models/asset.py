from sqlalchemy import Column, Integer, String, Text, DateTime, BigInteger
from sqlalchemy import Index
from app.database import Base
from sqlalchemy.orm import relationship


class Asset(Base):
    __tablename__ = "assets"

    # Primary key, automatically handled by PostgreSQL for autoincrement
    id = Column(Integer, primary_key=True)

    # Asset name, cannot be null
    asset_name = Column(String, nullable=False)

    # Ticker symbol for the asset, must be unique
    ticker = Column(String, nullable=False, unique=True)

    # Timestamp for last update, optional
    last_updated = Column(DateTime, nullable=True)

    # Additional attributes describing the asset
    asset_type = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    country = Column(String, nullable=True)
    market_cap = Column(BigInteger, nullable=True)  # BigInteger for large market caps
    asset_class = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    watchlist_items = relationship("WatchlistItem", back_populates="asset")

    # Indexes for performance optimization (useful for searching by ticker or asset name)
    __table_args__ = (
        Index("ix_assets_ticker", "ticker"),  # Index on ticker for fast lookups
        Index(
            "ix_assets_asset_name", "asset_name"
        ),  # Index on asset_name for fast lookups
    )

    # String representation for debugging and logging
    def __repr__(self):
        return (
            f"<Asset(id={self.id}, ticker={self.ticker}, asset_name={self.asset_name})>"
        )
