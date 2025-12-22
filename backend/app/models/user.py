from app.database import Base
from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    watchlists = relationship("WatchlistItem", back_populates="owner")
    transactions = relationship("Transaction", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, created_at={self.created_at})>"
