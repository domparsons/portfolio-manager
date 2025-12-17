import uuid

from app.database import get_db
from app.logger import logger
from app.schemas import BacktestRequest, BacktestResponse
from app.services.backtest_service import BacktestService
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm.session import Session

router = APIRouter(prefix="/backtest", tags=["backtest"])


@router.post("/", response_model=BacktestResponse)
def run_backtest(
    request: BacktestRequest,
    db: Session = Depends(get_db),
):
    backtest_service = BacktestService(db)

    try:
        backtest_service.validate_request(request, db)
    except HTTPException as e:
        logger.warning(f"Backtest validation failed: {e.detail}")
        raise

    backtest_result = backtest_service.run_backtest(request)

    parameters = request.model_dump(exclude={"strategy"})

    backtest_response = BacktestResponse(
        backtest_id=uuid.uuid4(),
        strategy=request.strategy,
        parameters=parameters,
        data=backtest_result,
    )

    return backtest_response
