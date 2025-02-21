from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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

    class Config:
        from_attributes = True


class AssetListSchema(AssetSchema):
    latest_price: Optional[float] = None
    price_change: Optional[float] = None
    percentage_change: Optional[float] = None
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True
