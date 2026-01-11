from typing import Optional

from app import crud
from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.logger import logger
from app.schemas.backtest import (
    BacktestAnalysis,
    BacktestRequest,
    BacktestResponse,
    LLMBacktestParams,
)
from app.services.backtest_service import BacktestService
from app.services.llm import backtest_analysis, backtest_parameterisation
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post("/parse_strategy", response_model=LLMBacktestParams)
def parse_strategy(
    user_input: str,
    db: Session = Depends(get_db),
) -> LLMBacktestParams:
    return backtest_parameterisation.strategise_natural_language(user_input, db)


@router.post("/analyse_backtest", response_model=Optional[str])
def analyse_backtest(
    backtest: BacktestResponse,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> str | None:
    backtest_result = backtest.data

    user_parameters = backtest.model_dump(exclude={"strategy"})

    user_result = BacktestAnalysis(
        strategy=backtest.strategy,
        parameters=user_parameters,
        tickers=backtest.parameters.get("tickers"),
        data=backtest_result,
    )

    spy_asset = crud.get_asset_by_ticker(
        db,
        "SPY",
    )

    if not spy_asset:
        logger.warning("SPY not found, skipping benchmark")
        return None

    benchmark_request = BacktestRequest(
        strategy="buy_and_hold",
        asset_ids=[spy_asset.get("id")],
        tickers=["SPY"],
        start_date=backtest_result.start_date,
        end_date=backtest_result.end_date,
        initial_cash=backtest_result.total_invested,
        parameters={},
    )

    backtest_service = BacktestService(db)

    backtest_result = backtest_service.run_backtest(benchmark_request, current_user, save_backtest=False)

    benchmark_parameters = benchmark_request.model_dump(exclude={"strategy"})
    benchmark_result = BacktestAnalysis(
        strategy="buy_and_hold",
        parameters=benchmark_parameters,
        tickers=["SPY"],
        data=backtest_result,
    )

    analysis = backtest_analysis.analyse_backtest(user_result, benchmark_result)

    return analysis
