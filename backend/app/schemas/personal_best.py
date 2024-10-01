# app/schemas/personal_best.py
from pydantic import BaseModel


class PersonalBestBase(BaseModel):
    time: float
    distance: float
    pace: float
    description: str | None = None


class PersonalBestCreate(PersonalBestBase):
    pass


class PersonalBestUpdate(PersonalBestBase):
    id: int


class PersonalBest(PersonalBestBase):
    id: int

    class Config:
        orm_mode = True  # This enables compatibility with SQLAlchemy models
