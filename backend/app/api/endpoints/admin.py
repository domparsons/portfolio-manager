from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/update-assets")
def trigger_asset_update(db: Session = Depends(get_db)):
    """Manually trigger asset list update"""
    try:
        # Import and run the update function
        from app.core.data_ingestion.update_assets import main

        result = main()
        if result == 0:
            return {"status": "success", "message": "Assets updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Asset update failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/update-timeseries")
def trigger_timeseries_update(db: Session = Depends(get_db)):
    """Manually trigger timeseries data update"""
    try:
        from app.core.data_ingestion.update_timeseries import main

        result = main()
        if result == 0:
            return {"status": "success", "message": "Timeseries updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Timeseries update failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
