from zoneinfo import ZoneInfo
from datetime import datetime


def convert_to_utc(purchase_date: datetime, user_timezone: str) -> datetime:
    local_dt = purchase_date.replace(tzinfo=ZoneInfo(user_timezone))
    return local_dt.astimezone(ZoneInfo("UTC"))
