from app.database import Base
from sqlalchemy import Column, ForeignKey, Index, Integer, String, Double
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import UniqueConstraint


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    alert_percentage_change = Column(Double, nullable=True)
    asset = relationship("Asset", back_populates="watchlist_items")
    owner = relationship("User", back_populates="watchlists")

    def __repr__(self):
        asset_symbol = self.asset.ticker if self.asset else "Unknown"
        return f"<WatchlistItem(id={self.id}, symbol={asset_symbol}, user_id={self.user_id})>"

    __table_args__ = (
        Index("ix_watchlist_user_id", "user_id"),
        Index("ix_watchlist_asset_id", "asset_id"),
        Index("ix_watchlist_user_asset", "user_id", "asset_id"),
        UniqueConstraint("user_id", "asset_id", name="uq_user_asset"),
    )
