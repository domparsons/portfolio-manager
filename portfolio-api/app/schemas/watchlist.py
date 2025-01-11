from pydantic import BaseModel


class WatchlistBase(BaseModel):
    ticker: str


class WatchlistCreate(WatchlistBase):
    pass


class Watchlist(WatchlistBase):
    id: int

    class Config:
        orm_mode = True
