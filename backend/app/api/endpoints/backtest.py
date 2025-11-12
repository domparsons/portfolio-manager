from fastapi import APIRouter
from sqlalchemy.orm.session import Session
from fastapi import Depends
from app.database import get_db

from app import schemas
from app.services.backtest_service import BacktestService

router = APIRouter(prefix="/backtest", tags=["backtest"])


@router.post("/", response_model=schemas.BacktestResponse)
def run_backtest(
    request: schemas.BacktestRequest,
    db: Session = Depends(get_db),
):
    backtest_service = BacktestService(db)
    backtest_result = backtest_service.run_backtest(request)

    parameters = {
        "asset_ids": request.asset_ids,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "initial_cash": request.initial_cash,
        "parameters": request.parameters,
    }

    backtest_response = schemas.BacktestResponse(
        backtest_id="backtestid",
        strategy=request.strategy,
        parameters=parameters,
        results=backtest_result,
    )

    return backtest_response
