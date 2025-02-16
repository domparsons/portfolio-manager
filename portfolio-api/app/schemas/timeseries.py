from pydantic import BaseModel
from datetime import datetime


class TimeseriesSchema(BaseModel):
    id: int
    close: float
    timestamp: datetime

    class Config:
        from_attributes = True
