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

    # Foreign key to Asset table
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)

    # Close price, marked as non-nullable if necessary
    close = Column(
        Float, nullable=False
    )  # Set to False if close should always be available

    # Volume, can be nullable depending on your requirements
    volume = Column(BigInteger, nullable=True)

    # Timestamp for the time-series data
    timestamp = Column(DateTime, nullable=False)

    # Composite primary key (unique combination of asset_id and timestamp)
    __table_args__ = (
        PrimaryKeyConstraint("asset_id", "timestamp"),  # Composite primary key
        Index(
            "ix_timeseries_asset_id", "asset_id"
        ),  # Index on asset_id for faster lookups
        Index(
            "ix_timeseries_timestamp", "timestamp"
        ),  # Index on timestamp for range queries
    )

    def __repr__(self):
        return f"<Timeseries(asset_id={self.asset_id}, timestamp={self.timestamp}, close={self.close})>"
