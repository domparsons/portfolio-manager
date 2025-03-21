from sqlalchemy import Column, Integer, String, Text, DateTime, BigInteger
from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True)
    asset_name = Column(String, nullable=False)
    ticker = Column(String, nullable=False)
    last_updated = Column(DateTime, nullable=True)
    asset_type = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    country = Column(String, nullable=True)
    market_cap = Column(BigInteger, nullable=True)
    asset_class = Column(String, nullable=True)
    description = Column(Text, nullable=True)
