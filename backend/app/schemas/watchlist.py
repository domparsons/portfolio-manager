from pydantic import BaseModel


class WatchlistItemBase(BaseModel):
    id: int
    asset_id: int

    class Config:
        from_attributes = True


class WatchlistAssets(WatchlistItemBase):
    asset_name: str
    asset_symbol: str
    asset_price: float
    asset_change: float
    asset_market_cap: float
    asset_volume: float


class WatchlistItem(WatchlistItemBase):
    user_id: str


class WatchlistAssetAlert(BaseModel):
    id: int
    ticker: str
    change_pct: float
    current_price: float
    previous_close: float

    class Config:
        from_attributes = True
