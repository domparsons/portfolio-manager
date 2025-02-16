from fastapi import APIRouter, Depends
from app.schemas.timeseries import TimeseriesSchema
from app.crud.timeseries import get_latest_timeseries_for_asset
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/timeseries", tags=["timeseries"])

@router.get("/timeseries_for_asset", response_model=list[TimeseriesSchema])
def get_latest_timeseries(asset_id, db: Session = Depends(get_db)):
    timeseries_df = get_latest_timeseries_for_asset(asset_id, db)
    timeseries_list = timeseries_df.to_dicts()
    return timeseries_list
