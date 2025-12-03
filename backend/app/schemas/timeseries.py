from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TimeseriesSchema(BaseModel):
    close: float
    timestamp: datetime
    volume: int

    model_config = ConfigDict(from_attributes=True)
