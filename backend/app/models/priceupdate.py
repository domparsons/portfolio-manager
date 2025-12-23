from sqlalchemy import UUID, Column, DateTime, Integer, Text

from app.database import Base


class PriceUpdate(Base):
    __tablename__ = "price_update"

    id = Column(UUID, primary_key=True)
    singleton = Column(Integer, unique=True, nullable=False, default=1)
    last_updated = Column(DateTime)
    description = Column(Text)
