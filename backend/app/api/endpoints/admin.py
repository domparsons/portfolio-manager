from fastapi import APIRouter, Depends, HTTPException

from app.core.auth.dependencies import require_admin
from app.logger import logger

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/update-assets")
def trigger_asset_update(
    new_tickers: list[str],
    current_user: str = Depends(require_admin),
):
    """Manually trigger asset list update"""
    logger.info(
        f"Admin endpoint triggered: asset up triggered with {new_tickers} by {current_user}"
    )
    try:
        from app.core.data_ingestion.update_assets import main

        result = main(new_tickers)
        if result == 0:
            return {"status": "success", "message": "Assets updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Asset update failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/update-timeseries")
def trigger_timeseries_update(
    current_user: str = Depends(require_admin),
):
    """Manually trigger timeseries data update"""
    logger.info(
        f"Admin endpoint triggered: timeseries updated triggered by {current_user}"
    )
    try:
        from app.core.data_ingestion.update_timeseries import main

        result = main()
        if result == 0:
            return {"status": "success", "message": "Timeseries updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Timeseries update failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
