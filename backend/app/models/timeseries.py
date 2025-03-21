from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, BigInteger
from app.database import Base


class Timeseries(Base):
    __tablename__ = "timeseries"

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    high = Column(Float, nullable=True)
    low = Column(Float, nullable=True)
    close = Column(Float, nullable=True)
    open = Column(Float, nullable=True)
    volume = Column(BigInteger, nullable=True)
    timestamp = Column(DateTime, nullable=False)
