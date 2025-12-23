from app.database import Base
from sqlalchemy import UUID, Column, DateTime, Text


class PriceUpdate(Base):
    __tablename__ = "price_update"

    id = Column(UUID, primary_key=True)
    last_updated = Column(DateTime)
    description = Column(Text)
