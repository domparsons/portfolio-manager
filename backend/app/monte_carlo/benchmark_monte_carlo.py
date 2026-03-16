"""
Monte Carlo benchmark: loop-based vs vectorised implementation.
Run from the backend directory: uv run python benchmark_monte_carlo.py
"""

import time

import numpy as np
import polars as pl

# ---------------------------------------------------------------------------
# Shared config
# ---------------------------------------------------------------------------

INVESTMENT_MONTHS = 60
MONTHLY_INVESTMENT = 500.0
INITIAL_PRICE = 150.0
SEED = 42
SIM_COUNTS = [1_000, 5_000, 10_000, 50_000]


def make_synthetic_timeseries(n_days: int = 2520) -> pl.DataFrame:
    """~10 years of fake daily closes, roughly resembling an equity."""
    rng = np.random.default_rng(0)
    returns = rng.normal(0.0004, 0.012, n_days)
    prices = 100.0 * np.cumprod(1 + returns)
    import datetime

    base = datetime.date(2015, 1, 2)
    dates = [base + datetime.timedelta(days=i) for i in range(n_days)]
    return pl.DataFrame({"timestamp": dates, "close": prices}).with_columns(
        pl.col("timestamp").cast(pl.Datetime)
    )


def generate_returns_normal(
    mean: float, std: float, num_simulations: int, investment_months: int
) -> np.ndarray:
    np.random.seed(SEED)
    return np.random.normal(mean, std, (num_simulations, investment_months))


# ---------------------------------------------------------------------------
# Loop-based implementation (original)
# ---------------------------------------------------------------------------


def simulate_loop(
    return_scenarios: np.ndarray,
    num_simulations: int,
    investment_months: int,
) -> np.ndarray:
    portfolio_paths = np.zeros((num_simulations, investment_months + 1))

    for sim in range(num_simulations):
        current_price = INITIAL_PRICE
        total_shares = 0.0

        for month in range(investment_months):
            current_price *= 1 + return_scenarios[sim, month]
            shares_bought = MONTHLY_INVESTMENT / current_price
            total_shares += shares_bought
            portfolio_paths[sim, month + 1] = total_shares * current_price

    return portfolio_paths


# ---------------------------------------------------------------------------
# Vectorised implementation (current)
# ---------------------------------------------------------------------------


def simulate_vectorised(
    return_scenarios: np.ndarray,
    investment_months: int,
) -> np.ndarray:
    portfolio_paths = np.zeros((return_scenarios.shape[0], investment_months + 1))
    price_paths = INITIAL_PRICE * np.cumprod(1 + return_scenarios, axis=1)
    cumulative_shares = np.cumsum(MONTHLY_INVESTMENT / price_paths, axis=1)
    portfolio_paths[:, 1:] = cumulative_shares * price_paths
    return portfolio_paths


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


def run_benchmark():
    df = make_synthetic_timeseries()

    # Pre-compute return stats (same as engine.setup_data)
    df = df.sort("timestamp").with_columns(
        [
            pl.col("timestamp").dt.month().alias("month"),
            pl.col("timestamp").dt.year().alias("year"),
        ]
    )
    monthly_data = (
        df.group_by(["year", "month"])
        .agg(pl.col("close").last().alias("month_end_price"))
        .sort(["year", "month"])
        .with_columns(pl.col("month_end_price").pct_change().alias("monthly_return"))
        .drop_nulls()
    )
    historical_returns = monthly_data.select("monthly_return").to_numpy().flatten()
    mean = float(np.mean(historical_returns))
    std = float(np.std(historical_returns))

    print(
        f"\n{'Simulations':>12}  {'Loop (s)':>10}  {'Vectorised (s)':>16}  {'Speedup':>8}"
    )
    print("-" * 54)

    results = []

    for n_sims in SIM_COUNTS:
        return_scenarios = generate_returns_normal(mean, std, n_sims, INVESTMENT_MONTHS)

        # Loop
        t0 = time.perf_counter()
        paths_loop = simulate_loop(return_scenarios, n_sims, INVESTMENT_MONTHS)
        loop_time = time.perf_counter() - t0

        # Vectorised
        t0 = time.perf_counter()
        paths_vec = simulate_vectorised(return_scenarios, INVESTMENT_MONTHS)
        vec_time = time.perf_counter() - t0

        speedup = loop_time / vec_time if vec_time > 0 else float("inf")

        # Sanity check — final values should be identical
        assert np.allclose(paths_loop[:, -1], paths_vec[:, -1], rtol=1e-6), (
            "Results differ between implementations!"
        )

        print(f"{n_sims:>12,}  {loop_time:>10.3f}  {vec_time:>16.4f}  {speedup:>7.1f}x")
        results.append((n_sims, loop_time, vec_time, speedup))

    print()
    print("Memory footprint (50k sims, 60 months):")
    n = 50_000
    matrix_bytes = n * INVESTMENT_MONTHS * 8  # float64
    print(f"  Return scenarios matrix : {matrix_bytes / 1e6:.1f} MB")
    print(f"  Portfolio paths matrix  : {n * (INVESTMENT_MONTHS + 1) * 8 / 1e6:.1f} MB")
    print(f"  Total (approx)          : {2 * matrix_bytes / 1e6:.0f} MB")


if __name__ == "__main__":
    run_benchmark()
