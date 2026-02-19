import time

import numpy as np
import polars as pl
from scipy import stats

from app.models.monte_carlo import (
    MonteCarloConfig,
    MonteCarloSimulationMethods,
    SimulationResults,
)


class MonteCarloEngine:
    def __init__(self, timeseries_df: pl.DataFrame):
        self.df = timeseries_df
        self.returns_stats = None
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

        returns = monthly_data.select("monthly_return").to_numpy().flatten()

        self.returns_stats = {
            "mean": np.mean(returns),
            "std": np.std(returns),
            "skew": stats.skew(returns),
            "kurtosis": stats.kurtosis(returns),
            "min": np.min(returns),
            "max": np.max(returns),
            "count": len(returns),
        }

        print("Historical Return Statistics:")
        print(
            f"Mean Monthly Return: {self.returns_stats['mean']:.4f} ({self.returns_stats['mean'] * 12:.2%} annualized)"
        )
        print(
            f"Monthly Volatility: {self.returns_stats['std']:.4f} ({self.returns_stats['std'] * np.sqrt(12):.2%} annualized)"
        )
        print(f"Skewness: {self.returns_stats['skew']:.4f}")
        print(f"Kurtosis: {self.returns_stats['kurtosis']:.4f}")
        print(f"Sample Size: {self.returns_stats['count']} months")

    def generate_returns(self, config: MonteCarloConfig) -> np.ndarray:
        np.random.seed(config.seed)
        returns = None
        historical_returns = (
            self.df.group_by([pl.col("year"), pl.col("month")])
            .agg(pl.col("close").last())
            .sort([pl.col("year"), pl.col("month")])
            .with_columns(pl.col("close").pct_change().alias("monthly_return"))
            .drop_nulls()
            .select("monthly_return")
            .to_numpy()
            .flatten()
        )

        if config.simulation_method == MonteCarloSimulationMethods.NORMAL_DISTRIBUTION:
            returns = np.random.normal(
                self.returns_stats["mean"],
                self.returns_stats["std"],
                (config.num_simulations, config.investment_months),
            )
        elif config.simulation_method == MonteCarloSimulationMethods.BOOTSTRAP:
            bootstrap_indices = np.random.choice(
                len(historical_returns),
                (config.num_simulations, config.investment_months),
                replace=True,
            )
            returns = historical_returns[bootstrap_indices]
        elif config.simulation_method == MonteCarloSimulationMethods.T_STUDENT:
            df_param, loc_param, scale_param = stats.t.fit(historical_returns)
            returns = stats.t.rvs(
                df=df_param,
                loc=loc_param,
                scale=scale_param,
                size=(config.num_simulations, config.investment_months),
            )

        return returns

    def simulate_dca_strategy(self, config: MonteCarloConfig) -> SimulationResults:
        print(f"Running {config.num_simulations:,} Monte Carlo simulations...")
        start_time = time.time()

        # Get initial price
        if config.initial_price is None:
            config.initial_price = self.df.select("close").row(0)[0]

        # Generate return scenarios
        return_scenarios = self.generate_returns(config)

        # Initialize arrays for results
        final_values = np.zeros(config.num_simulations)
        portfolio_paths = np.zeros(
            (config.num_simulations, config.investment_months + 1)
        )
        shares_accumulated = np.zeros(
            (config.num_simulations, config.investment_months + 1)
        )

        # Set initial conditions
        portfolio_paths[:, 0] = 0  # No initial investment
        shares_accumulated[:, 0] = 0

        # Run simulations
        for sim in range(config.num_simulations):
            current_price = config.initial_price
            total_shares = 0.0

            for month in range(config.investment_months):
                # Apply return to get new price
                monthly_return = return_scenarios[sim, month]
                current_price *= 1 + monthly_return

                # Make monthly investment
                shares_bought = config.monthly_investment / current_price
                total_shares += shares_bought

                # Record portfolio value and shares
                portfolio_value = total_shares * current_price
                portfolio_paths[sim, month + 1] = portfolio_value
                shares_accumulated[sim, month + 1] = total_shares

            final_values[sim] = portfolio_paths[sim, -1]

        # Calculate metrics
        total_invested = config.monthly_investment * config.investment_months

        percentiles = {
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
        risk_metrics = {
            "probability_of_loss": np.mean(final_values < total_invested),
            "mean_return": np.mean(returns),
            "std_return": np.std(returns),
            "sharpe_ratio": np.mean(returns)
            / np.std(returns)
            * np.sqrt(12 / config.investment_months),
            "max_drawdown": self._calculate_max_drawdown(
                portfolio_paths, config.monthly_investment
            ),
            "var_95": np.percentile(returns, 5),  # Value at Risk (95% confidence)
            "cvar_95": np.mean(
                returns[returns <= np.percentile(returns, 5)]
            ),  # Conditional VaR
        }

        elapsed_time = time.time() - start_time
        print(f"Simulation completed in {elapsed_time:.2f} seconds")

        return SimulationResults(
            final_values=final_values,
            portfolio_paths=portfolio_paths,
            shares_accumulated=shares_accumulated,
            total_invested=total_invested,
            percentiles=percentiles,
            risk_metrics=risk_metrics,
        )

    @staticmethod
    def _calculate_max_drawdown(
        portfolio_paths: np.ndarray, monthly_investment: float
    ) -> float:
        max_drawdowns = []

        for sim in range(portfolio_paths.shape[0]):
            # Calculate invested amount at each point
            invested_amounts = np.arange(portfolio_paths.shape[1]) * monthly_investment

            # Calculate running maximum of portfolio value
            portfolio_values = portfolio_paths[sim, :]
            running_max = np.maximum.accumulate(portfolio_values)

            # Calculate drawdown (as percentage of running max)
            drawdowns = (portfolio_values - running_max) / np.maximum(running_max, 1)
            max_drawdown = np.min(drawdowns)
            max_drawdowns.append(max_drawdown)

        return np.mean(max_drawdowns)

    def _calculate_historical_dca(self, config: MonteCarloConfig) -> float:
        # Get monthly prices for the most recent period
        monthly_prices = (
            self.df.group_by([pl.col("year"), pl.col("month")])
            .agg(pl.col("close").last().alias("price"))
            .sort([pl.col("year"), pl.col("month")])
            .tail(
                min(config.investment_months, len(self.df) // 20)
            )  # Approximate monthly data
        )

        if len(monthly_prices) < config.investment_months:
            # Use available data and extrapolate
            # available_months = len(monthly_prices)
            prices = monthly_prices.select("price").to_numpy().flatten()
        else:
            prices = (
                monthly_prices.select("price")
                .tail(config.investment_months)
                .to_numpy()
                .flatten()
            )

        total_shares = 0.0
        for i, price in enumerate(prices):
            shares_bought = config.monthly_investment / price
            total_shares += shares_bought

        final_price = prices[-1]
        return total_shares * final_price
