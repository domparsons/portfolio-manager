import polars as pl
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud import get_asset_by_ticker, get_latest_timeseries_for_asset
from app.database import get_db
from app.monte_carlo.monte_carlo_engine import MonteCarloEngine
from app.schemas.monte_carlo import (
    MonteCarloConfig,
    MonteCarloSimulationMethods,
)

router = APIRouter(prefix="/monte_carlo", tags=["monte_carlo"])


def run_monte_carlo_analysis(
    timeseries_df: pl.DataFrame,
    monthly_investment: float,
    investment_months: int,
    simulation_method: MonteCarloSimulationMethods,
):
    engine = MonteCarloEngine(timeseries_df)

    config = MonteCarloConfig(
        monthly_investment=monthly_investment,
        investment_months=investment_months,
        num_simulations=10_000,
        simulation_method=simulation_method,
    )

    results = engine.simulate_dca_strategy(config)

    return results.to_dict()


@router.get("/")
def monte_carlo(
    ticker_id: int,
    monthly_investment: float,
    investment_months: int,
    simulation_method: MonteCarloSimulationMethods = Query(
        MonteCarloSimulationMethods.BOOTSTRAP
    ),
    db: Session = Depends(get_db),
):
    timeseries_df = get_latest_timeseries_for_asset(ticker_id, db)
    results = run_monte_carlo_analysis(
        timeseries_df,
        monthly_investment,
        investment_months,
        simulation_method,
    )
    return results
