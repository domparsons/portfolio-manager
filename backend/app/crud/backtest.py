from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import schemas, models
from app.logger import logger
from app.schemas.backtest import PreviousBacktest


def save_backtest(
    request: schemas.BacktestRequest,
    result: schemas.BacktestResult,
    user_id: str,
    db: Session,
):
    logger.info("Attempting to save backtest.")
    try:
        backtest = models.BacktestHistory(
            user_id=user_id,
            created_at=datetime.now(),
            strategy=request.strategy,
            asset_ids=request.asset_ids,
            tickers=request.tickers,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_cash=request.initial_cash,
            parameters=request.parameters,
            total_invested=result.total_invested,
            final_value=result.final_value,
            total_return_abs=result.total_return_abs,
            total_return_pct=result.total_return_pct,
            avg_daily_return=result.avg_daily_return,
            sharpe_ratio=result.metrics.sharpe,
            max_drawdown=result.metrics.max_drawdown,
            max_drawdown_duration=result.metrics.max_drawdown_duration,
            volatility=result.metrics.volatility,
            investments_made=result.metrics.investments_made,
            trading_days=result.metrics.days_analysed,
            peak_value=result.metrics.peak_value,
            trough_value=result.metrics.trough_value,
        )
        db.add(backtest)
        db.commit()
        db.refresh(backtest)
        logger.info("Backtest saved.")
    except SQLAlchemyError as e:
        logger.error(f"An error occurred while saving backtest: {e}")


def get_previous_backtests(user_id: str, db: Session) -> list[PreviousBacktest]:
    logger.info("Fetching previous user backtests")
    try:
        previous_user_backtests = (
            db.query(models.BacktestHistory)
            .filter(models.BacktestHistory.user_id == user_id)
            .order_by(models.BacktestHistory.created_at.desc())
            .all()
        )
        logger.info(f"Fetched {len(previous_user_backtests)} backtests for user")

        return [
            PreviousBacktest.model_validate(backtest.__dict__)
            for backtest in previous_user_backtests
        ]

    except SQLAlchemyError as e:
        logger.error(f"Failed to fetch backtests for user: {e}")
        return []
