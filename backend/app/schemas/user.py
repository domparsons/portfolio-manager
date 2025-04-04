from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    id: str
    email: str


class User(UserBase):
    created_at: datetime
