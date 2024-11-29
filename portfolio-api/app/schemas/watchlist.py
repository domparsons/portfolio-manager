from pydantic import BaseModel


class Watchlist(BaseModel):
    id: int
    user_id: int
