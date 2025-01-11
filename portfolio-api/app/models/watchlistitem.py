from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="watchlists")

    def __repr__(self):
        return f"<WatchlistItem(id={self.id}, symbol={self.symbol}, user_id={self.user_id})>"
