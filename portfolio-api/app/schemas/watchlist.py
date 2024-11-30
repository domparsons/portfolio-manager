from pydantic import BaseModel


class Watchlist(BaseModel):
    id: int
    ticker: str
