from app.database import Base
from sqlalchemy import BigInteger, Column, DateTime, Index, Integer, String, Text
from sqlalchemy.orm import relationship


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True)
    asset_name = Column(String, nullable=False)
    ticker = Column(String, nullable=False, unique=True)
    last_updated = Column(DateTime, nullable=True)
    asset_type = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    country = Column(String, nullable=True)
    market_cap = Column(BigInteger, nullable=True)
    asset_class = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    watchlist_items = relationship("WatchlistItem", back_populates="asset")

    __table_args__ = (
        Index("ix_assets_ticker", "ticker"),  # Index on ticker for fast lookups
        Index(
            "ix_assets_asset_name", "asset_name"
        ),  # Index on asset_name for fast lookups
    )

    def __repr__(self):
        return (
            f"<Asset(id={self.id}, ticker={self.ticker}, asset_name={self.asset_name})>"
        )
