from datetime import date, timedelta

import numpy as np
import polars as pl
import pytest

from app.monte_carlo.monte_carlo_engine import MonteCarloEngine
from app.schemas.monte_carlo import MonteCarloConfig, MonteCarloSimulationMethods

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _business_days(start: date, n: int) -> list[date]:
    """Return the first *n* business days (Mon–Fri) starting from *start*."""
    days: list[date] = []
    d = start
    while len(days) < n:
        if d.weekday() < 5:
            days.append(d)
        d += timedelta(days=1)
    return days


def _make_config(
    method: MonteCarloSimulationMethods,
    monthly_investment: float = 500.0,
    investment_months: int = 24,
    num_simulations: int = 2_000,
) -> MonteCarloConfig:
    return MonteCarloConfig(
        monthly_investment=monthly_investment,
        investment_months=investment_months,
        num_simulations=num_simulations,
        simulation_method=method,
    )


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def engine_normal_growth():
    """
    Engine backed by 5 years of synthetic daily prices with steady ~1% monthly
    growth.  All monthly returns are positive (roughly +1 %), making this series
    ideal for probability-of-loss and percentile-ordering assertions.
    """
    n = 1_260
    dates = _business_days(date(2018, 1, 1), n)
    daily_rate = (1.01 ** (1 / 21)) - 1
    prices = [100.0 * ((1 + daily_rate) ** i) for i in range(n)]
    df = pl.DataFrame({"timestamp": dates, "close": prices})
    return MonteCarloEngine(df)


@pytest.fixture(scope="module")
def engine_fat_tails():
    """
    Engine whose historical monthly returns are drawn directly from a
    t-distribution with df=5 (excess kurtosis = 6).  One price per calendar
    month is used so the engine's month-end aggregation picks up the exact
    t-distributed returns without CLT dilution.  This guarantees scipy fits a
    low-df t-distribution, making the T-Student simulation measurably
    fatter-tailed than Normal Distribution.
    """
    import calendar

    from scipy import stats

    n_months = 120  # 10 years of monthly observations
    monthly_returns = stats.t.rvs(
        df=5, loc=0.008, scale=0.05, size=n_months, random_state=7
    )

    start_year, start_month = 2014, 1
    dates: list[date] = []
    for i in range(n_months):
        year = start_year + (start_month + i - 1) // 12
        month = (start_month + i - 1) % 12 + 1
        last_day = calendar.monthrange(year, month)[1]
        dates.append(date(year, month, last_day))

    prices = [100.0]
    for r in monthly_returns[:-1]:
        prices.append(prices[-1] * (1 + r))

    df_pl = pl.DataFrame({"timestamp": dates, "close": prices})
    return MonteCarloEngine(df_pl)


# ---------------------------------------------------------------------------
# Test 1 — percentile ordering in chart_data
# ---------------------------------------------------------------------------


def test_chart_data_percentiles_monotonically_ordered(engine_normal_growth):
    """
    For every month in chart_data, percentiles must satisfy p5 < p10 < p25 <
    p50 < p75 < p90 < p95.  A violation would indicate the simulation is
    internally inconsistent — higher-confidence bands crossing lower ones.
    """
    results = engine_normal_growth.simulate_dca_strategy(
        _make_config(MonteCarloSimulationMethods.NORMAL_DISTRIBUTION)
    )

    for entry in results.chart_data:
        # Month 0 is always zero for all percentiles; skip to avoid trivial equality
        if entry["month"] == 0:
            continue
        assert entry["p5"] <= entry["p10"], f"month {entry['month']}: p5 > p10"
        assert entry["p10"] <= entry["p25"], f"month {entry['month']}: p10 > p25"
        assert entry["p25"] <= entry["p50"], f"month {entry['month']}: p25 > p50"
        assert entry["p50"] <= entry["p75"], f"month {entry['month']}: p50 > p75"
        assert entry["p75"] <= entry["p90"], f"month {entry['month']}: p75 > p90"
        assert entry["p90"] <= entry["p95"], f"month {entry['month']}: p90 > p95"


# ---------------------------------------------------------------------------
# Test 2 — final percentiles monotonically ordered
# ---------------------------------------------------------------------------


def test_final_percentiles_monotonically_ordered(engine_normal_growth):
    """
    The summary final_percentiles dict must have strictly increasing values from
    the 5th to the 95th percentile.  This is a separate assertion from the
    chart_data check — it validates the summary statistics independently.
    """
    results = engine_normal_growth.simulate_dca_strategy(
        _make_config(MonteCarloSimulationMethods.BOOTSTRAP)
    )

    fp = results.final_percentiles
    ordered_keys = [5, 10, 25, 50, 75, 90, 95]
    for lo, hi in zip(ordered_keys, ordered_keys[1:]):
        assert fp[lo] <= fp[hi], (
            f"final_percentiles[{lo}]={fp[lo]:.2f} > final_percentiles[{hi}]={fp[hi]:.2f}"
        )


# ---------------------------------------------------------------------------
# Test 3 — Bootstrap return containment
# ---------------------------------------------------------------------------


def test_bootstrap_returns_drawn_from_historical_data(engine_normal_growth):
    """
    Every value in the Bootstrap-generated return matrix must be an exact member
    of engine.historical_returns.  This proves Bootstrap resamples real
    historical observations rather than synthesising values from a distribution.
    """
    config = _make_config(MonteCarloSimulationMethods.BOOTSTRAP, num_simulations=500)
    returns = engine_normal_growth.generate_returns(config)

    assert returns.shape == (config.num_simulations, config.investment_months)
    assert np.all(np.isin(returns, engine_normal_growth.historical_returns)), (
        "Bootstrap return matrix contains values not found in historical_returns"
    )


# ---------------------------------------------------------------------------
# Test 4 — T-Student heavier tails than Normal Distribution
# ---------------------------------------------------------------------------


def test_t_student_generates_fatter_return_tails_than_normal(engine_fat_tails):
    """
    The 1st–99th percentile range of raw monthly returns generated by T-Student
    must exceed that of Normal Distribution on the same engine.  T-Student is
    fitted to the historical returns via MLE; when those returns are leptokurtic
    (excess kurtosis > 0, as in engine_fat_tails), scipy finds a low df,
    producing measurably heavier tails than the Normal.

    Raw returns are compared rather than portfolio values because DCA compounding
    over many months can obscure tail differences; comparing 240,000 return
    samples (10,000 sims × 24 months) makes the assertion statistically robust.
    """
    config_normal = _make_config(
        MonteCarloSimulationMethods.NORMAL_DISTRIBUTION,
        investment_months=24,
        num_simulations=10_000,
    )
    config_t = _make_config(
        MonteCarloSimulationMethods.T_STUDENT,
        investment_months=24,
        num_simulations=10_000,
    )

    returns_normal = engine_fat_tails.generate_returns(config_normal).flatten()
    returns_t = engine_fat_tails.generate_returns(config_t).flatten()

    range_normal = np.percentile(returns_normal, 99) - np.percentile(returns_normal, 1)
    range_t = np.percentile(returns_t, 99) - np.percentile(returns_t, 1)

    assert range_t > range_normal, (
        f"Expected T-Student 1st–99th range ({range_t:.4f}) > "
        f"Normal range ({range_normal:.4f})"
    )


# ---------------------------------------------------------------------------
# Test 5 — probability of loss is zero for an all-positive return series
# ---------------------------------------------------------------------------


def test_probability_of_loss_is_zero_for_positive_returns(engine_normal_growth):
    """
    When every historical monthly return is positive (as in the monotonically
    growing synthetic series), a DCA strategy can never lose money regardless of
    the simulation path.  risk_metrics["probability_of_loss"] must therefore
    equal 0.0.
    """
    results = engine_normal_growth.simulate_dca_strategy(
        _make_config(
            MonteCarloSimulationMethods.NORMAL_DISTRIBUTION,
            num_simulations=1_000,
        )
    )
    assert results.risk_metrics["probability_of_loss"] == 0.0, (
        f"Expected 0.0 probability of loss, got {results.risk_metrics['probability_of_loss']}"
    )


# ---------------------------------------------------------------------------
# Test 6 — total invested is deterministic and exact
# ---------------------------------------------------------------------------


def test_total_invested_is_exact(engine_normal_growth):
    """
    total_invested must equal monthly_investment × investment_months exactly.
    This calculation is deterministic and unaffected by the stochastic
    simulation; any floating-point drift would indicate a logic error.
    """
    monthly_investment = 250.0
    investment_months = 36

    results = engine_normal_growth.simulate_dca_strategy(
        MonteCarloConfig(
            monthly_investment=monthly_investment,
            investment_months=investment_months,
            num_simulations=500,
            simulation_method=MonteCarloSimulationMethods.BOOTSTRAP,
        )
    )

    expected = monthly_investment * investment_months
    assert results.total_invested == expected, (
        f"total_invested={results.total_invested} != {expected}"
    )
