from datetime import datetime

from pydantic import BaseModel


class TimeseriesSchema(BaseModel):
    close: float
    timestamp: datetime
    volume: int

    class Config:
        from_attributes = True
