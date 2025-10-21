from sqlalchemy import Column, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationship to Asset: each watchlist item corresponds to one asset
    asset = relationship("Asset", back_populates="watchlist_items")

    # Relationship to User: each watchlist item belongs to one user
    owner = relationship("User", back_populates="watchlists")

    def __repr__(self):
        asset_symbol = self.asset.ticker if self.asset else "Unknown"
        return f"<WatchlistItem(id={self.id}, symbol={asset_symbol}, user_id={self.user_id})>"

    # Optional: Composite Index for user_id and asset_id together for optimized queries
    __table_args__ = (
        Index("ix_watchlist_user_id", "user_id"),
        Index("ix_watchlist_asset_id", "asset_id"),
        Index("ix_watchlist_user_asset", "user_id", "asset_id"),  # Composite index
    )
