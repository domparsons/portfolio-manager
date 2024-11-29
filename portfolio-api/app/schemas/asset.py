from pydantic import BaseModel
from typing import Optional


class AssetBase(BaseModel):
    ticker_symbol: str
    name: str
    current_price: Optional[float]
    asset_type: str


class AssetCreate(AssetBase):
    watchlist_id: int


class Asset(AssetBase):
    id: int
    watchlist_id: int

    class Config:
        orm_mode = True
