from sqlalchemy import Column, Integer, String
from app.database import Base


class Watchlist(Base):
    __tablename__ = 'watchlist'

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, nullable=False)
