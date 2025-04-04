from pydantic import BaseModel


class WatchlistItemBase(BaseModel):
    id: int
    asset_id: int

    class Config:
        from_attributes = True


class WatchlistItem(WatchlistItemBase):
    user_id: str
