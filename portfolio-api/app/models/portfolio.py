from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from app.database import Base


class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=True)
    purchase_date = Column(DateTime, nullable=True)
