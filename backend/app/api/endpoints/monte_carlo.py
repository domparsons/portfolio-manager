import polars as pl
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud import get_latest_timeseries_for_asset
from app.database import get_db
from app.models.monte_carlo import (
    MonteCarloConfig,
    MonteCarloSimulationMethods,
)
from app.monte_carlo.monte_carlo_engine import MonteCarloEngine

router = APIRouter(prefix="/monte_carlo", tags=["monte_carlo"])


def run_monte_carlo_analysis(
    timeseries_df: pl.DataFrame, simulation_method: MonteCarloSimulationMethods
):
    engine = MonteCarloEngine(timeseries_df)

    config = MonteCarloConfig(
        monthly_investment=1000.0,
        investment_months=60,
        num_simulations=10_000,
        seed=42,
        simulation_method=simulation_method,
    )

    results = engine.simulate_dca_strategy(config)

    return results


@router.get("/")
def monte_carlo(
    db: Session = Depends(get_db),
    monte_carlo_simulation_method: MonteCarloSimulationMethods = Query(
        MonteCarloSimulationMethods.BOOTSTRAP
    ),
):
    timeseries_df = get_latest_timeseries_for_asset(1, db)
    results = run_monte_carlo_analysis(timeseries_df, monte_carlo_simulation_method)
    return results
