from sqlalchemy import Column, Integer, String
from app.config.database import Base

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True)