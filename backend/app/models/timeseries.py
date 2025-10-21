from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    PrimaryKeyConstraint,
)

from app.database import Base


class Timeseries(Base):
    __tablename__ = "timeseries"

    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    open = Column(Float, nullable=True)
    close = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    adj_close = Column(Float, nullable=False)

    volume = Column(BigInteger, nullable=True)
    timestamp = Column(DateTime, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("asset_id", "timestamp"),  # Composite primary key
        Index("ix_timeseries_asset_id", "asset_id"),
        Index("ix_timeseries_timestamp", "timestamp"),
    )

    def __repr__(self):
        return f"<Timeseries(asset_id={self.asset_id}, timestamp={self.timestamp}, close={self.close})>"
