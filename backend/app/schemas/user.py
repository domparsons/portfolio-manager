from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    id: str
    name: Optional[str]


class User(UserBase):
    created_at: datetime
