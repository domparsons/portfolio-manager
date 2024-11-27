# app/schemas.py
from pydantic import BaseModel
from typing import Optional


# ----- User Schemas -----

class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        orm_mode = True


# ----- Watchlist Schemas -----

class Watchlist(BaseModel):
    id: int
    user_id: int


# ----- Asset Schemas -----

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
