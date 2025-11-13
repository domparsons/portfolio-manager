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
    backtest_service = BacktestService(db)

    backtest_service.validate_request(request)
    backtest_result = backtest_service.run_backtest(request)

    parameters = request.model_dump(exclude={"strategy"})

    backtest_response = BacktestResponse(
        backtest_id="backtestid",
        strategy=request.strategy,
        parameters=parameters,
        data=backtest_result,
    )

    return backtest_response
