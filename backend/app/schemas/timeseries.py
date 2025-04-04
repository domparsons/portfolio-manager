from pydantic import BaseModel
from datetime import datetime


class TimeseriesSchema(BaseModel):
    close: float
    timestamp: datetime
    volume: int

    class Config:
        from_attributes = True
