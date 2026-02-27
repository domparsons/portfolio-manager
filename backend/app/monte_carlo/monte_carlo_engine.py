import time

import numpy as np
import polars as pl
from scipy import stats

from app.logger import logger
from app.schemas.monte_carlo import (
    MonteCarloConfig,
    MonteCarloSimulationMethods,
    SimulationResults,
)


class MonteCarloEngine:
    def __init__(self, timeseries_df: pl.DataFrame):
        self.df = timeseries_df
        self.returns_stats = None
        self.historical_returns: np.ndarray | None = None
        self.setup_data()

    def setup_data(self):
        self.df = self.df.sort("timestamp")
        self.df = self.df.with_columns(
            [
                pl.col("close").pct_change().alias("daily_return"),
                pl.col("timestamp").dt.month().alias("month"),
                pl.col("timestamp").dt.year().alias("year"),
            ]
        )
        monthly_data = (
            self.df.group_by(["year", "month"])
            .agg(
                [
                    pl.col("close").last().alias("month_end_price"),
                    pl.col("timestamp").last().alias("month_end_date"),
                ]
            )
            .sort(["year", "month"])
            .with_columns(
                [pl.col("month_end_price").pct_change().alias("monthly_return")]
            )
            .drop_nulls()
        )

        self.historical_returns = monthly_data.select("monthly_return").to_numpy().flatten()

        self.returns_stats = {
            "mean": np.mean(self.historical_returns),
            "std": np.std(self.historical_returns),
            "skew": stats.skew(self.historical_returns),
            "kurtosis": stats.kurtosis(self.historical_returns),
            "min": np.min(self.historical_returns),
            "max": np.max(self.historical_returns),
            "count": len(self.historical_returns),
        }

        logger.info("Historical Return Statistics:")
        logger.info(
            f"Mean Monthly Return: {self.returns_stats['mean']:.4f} ({self.returns_stats['mean'] * 12:.2%} annualized)"
        )
        logger.info(
            f"Monthly Volatility: {self.returns_stats['std']:.4f} ({self.returns_stats['std'] * np.sqrt(12):.2%} annualized)"
        )
        logger.info(f"Skewness: {self.returns_stats['skew']:.4f}")
        logger.info(f"Kurtosis: {self.returns_stats['kurtosis']:.4f}")
        logger.info(f"Sample Size: {self.returns_stats['count']} months")

    def generate_returns(self, config: MonteCarloConfig) -> np.ndarray:
        returns = None

        if config.simulation_method == MonteCarloSimulationMethods.NORMAL_DISTRIBUTION:
            returns = np.random.normal(
                self.returns_stats["mean"],
                self.returns_stats["std"],
                (config.num_simulations, config.investment_months),
            )
        elif config.simulation_method == MonteCarloSimulationMethods.BOOTSTRAP:
            bootstrap_indices = np.random.choice(
                len(self.historical_returns),
                (config.num_simulations, config.investment_months),
                replace=True,
            )
            returns = self.historical_returns[bootstrap_indices]
        elif config.simulation_method == MonteCarloSimulationMethods.T_STUDENT:
            df_param, loc_param, scale_param = stats.t.fit(self.historical_returns)
            returns = stats.t.rvs(
                df=df_param,
                loc=loc_param,
                scale=scale_param,
                size=(config.num_simulations, config.investment_months),
            )

        return returns

    def simulate_dca_strategy(self, config: MonteCarloConfig) -> SimulationResults:
        logger.info(f"Running {config.num_simulations:,} Monte Carlo simulations...")
        start_time = time.time()

        if config.initial_price is None:
            config.initial_price = self.df.select("close").row(-1)[0]

        return_scenarios = self.generate_returns(config)

        portfolio_paths = np.zeros(
            (config.num_simulations, config.investment_months + 1)
        )
        shares_accumulated = np.zeros(
            (config.num_simulations, config.investment_months + 1)
        )

        # Vectorised DCA: compute all paths without Python loops
        price_paths = config.initial_price * np.cumprod(
            1 + return_scenarios, axis=1
        )  # (n_sims, n_months)
        cumulative_shares = np.cumsum(
            config.monthly_investment / price_paths, axis=1
        )  # (n_sims, n_months)
        portfolio_paths[:, 1:] = cumulative_shares * price_paths
        shares_accumulated[:, 1:] = cumulative_shares
        final_values = portfolio_paths[:, -1]

        total_invested = config.monthly_investment * config.investment_months

        final_percentiles = {
            5: np.percentile(final_values, 5),
            10: np.percentile(final_values, 10),
            25: np.percentile(final_values, 25),
            50: np.percentile(final_values, 50),
            75: np.percentile(final_values, 75),
            90: np.percentile(final_values, 90),
            95: np.percentile(final_values, 95),
        }

        # Risk metrics
        returns = (final_values - total_invested) / total_invested
        # Sharpe: annualised mean/std of the simulated monthly returns (periodic, not total)
        _monthly_means = np.mean(return_scenarios, axis=1)
        _monthly_stds = np.std(return_scenarios, axis=1)
        sharpe_ratio = float(
            np.mean(_monthly_means / np.maximum(_monthly_stds, 1e-10) * np.sqrt(12))
        )
        risk_metrics = {
            "probability_of_loss": np.mean(final_values < total_invested),
            "mean_return": np.mean(returns),
            "std_return": np.std(returns),
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": self._calculate_max_drawdown(
                portfolio_paths, config.monthly_investment
            ),
            "var_95": np.percentile(returns, 5),  # Value at Risk (95% confidence)
            "cvar_95": np.mean(
                returns[returns <= np.percentile(returns, 5)]
            ),  # Conditional VaR
        }

        percentile_levels = [5, 10, 25, 50, 75, 90, 95]
        percentile_paths = np.percentile(portfolio_paths, percentile_levels, axis=0)

        invested_per_month = (
            np.arange(config.investment_months + 1) * config.monthly_investment
        )

        chart_data = [
            {
                "month": month,
                "invested": round(float(invested_per_month[month]), 2),
                "p5": round(float(percentile_paths[0, month]), 2),
                "p10": round(float(percentile_paths[1, month]), 2),
                "p25": round(float(percentile_paths[2, month]), 2),
                "p50": round(float(percentile_paths[3, month]), 2),
                "p75": round(float(percentile_paths[4, month]), 2),
                "p90": round(float(percentile_paths[5, month]), 2),
                "p95": round(float(percentile_paths[6, month]), 2),
            }
            for month in range(config.investment_months + 1)
        ]

        sample_count = min(20, config.num_simulations)
        sample_indices = np.random.choice(
            config.num_simulations, sample_count, replace=False
        )
        sample_paths = [
            [round(float(v), 2) for v in portfolio_paths[i]] for i in sample_indices
        ]

        hist_counts, bin_edges = np.histogram(final_values, bins=50)
        histogram = [
            {
                "min": round(float(bin_edges[i]), 2),
                "max": round(float(bin_edges[i + 1]), 2),
                "count": int(hist_counts[i]),
            }
            for i in range(len(hist_counts))
        ]

        elapsed_time = time.time() - start_time
        logger.info(f"Simulation completed in {elapsed_time:.2f} seconds")

        return SimulationResults(
            chart_data=chart_data,
            sample_paths=sample_paths,
            histogram=histogram,
            total_invested=total_invested,
            final_percentiles=final_percentiles,
            risk_metrics=risk_metrics,
        )

    @staticmethod
    def _calculate_max_drawdown(
        portfolio_paths: np.ndarray, monthly_investment: float
    ) -> float:
        max_drawdowns = []

        for sim in range(portfolio_paths.shape[0]):
            # Calculate running maximum of portfolio value
            portfolio_values = portfolio_paths[sim, :]
            running_max = np.maximum.accumulate(portfolio_values)

            # Calculate drawdown (as percentage of running max)
            drawdowns = (portfolio_values - running_max) / np.maximum(running_max, 1)
            max_drawdown = np.min(drawdowns)
            max_drawdowns.append(max_drawdown)

        return np.mean(max_drawdowns)
