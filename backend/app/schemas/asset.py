from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AssetSchema(BaseModel):
    id: int
    asset_name: str
    ticker: str
    last_updated: Optional[datetime] = None
    asset_type: Optional[str] = None
    currency: Optional[str] = None
    sector: Optional[str] = None
    country: Optional[str] = None
    market_cap: Optional[int] = None
    asset_class: Optional[str] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AssetListSchema(AssetSchema):
    latest_price: Optional[float] = None
    price_change: Optional[float] = None
    percentage_change: Optional[float] = None
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AssetInWatchlist(BaseModel):
    asset_in_watchlist: bool
    alert_percentage: Optional[float]

    model_config = ConfigDict(from_attributes=True)


class AssetDataAvailability(BaseModel):
    asset_id: int
    asset_name: str
    ticker: str
    first_available_date: datetime
    last_available_date: datetime

    model_config = ConfigDict(from_attributes=True)
