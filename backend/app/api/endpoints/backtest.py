from app.database import get_db
from app.schemas import BacktestRequest, BacktestResponse
from app.services.backtest_service import BacktestService
from fastapi import APIRouter, Depends
from sqlalchemy.orm.session import Session

router = APIRouter(prefix="/backtest", tags=["backtest"])


@router.post("/", response_model=BacktestResponse)
def run_backtest(
    request: BacktestRequest,
    db: Session = Depends(get_db),
):
    import time

    start_time = time.time()
    backtest_service = BacktestService(db)
    backtest_result = backtest_service.run_backtest(request)

    parameters = {
        "asset_ids": request.asset_ids,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "initial_cash": request.initial_cash,
        "parameters": request.parameters,
    }

    backtest_response = BacktestResponse(
        backtest_id="backtestid",
        strategy=request.strategy,
        parameters=parameters,
        results=backtest_result,
    )

    print(time.time() - start_time)

    return backtest_response
