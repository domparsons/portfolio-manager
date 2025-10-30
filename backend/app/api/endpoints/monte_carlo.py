import time
from dataclasses import dataclass
from enum import Enum
from typing import Dict

import matplotlib.pyplot as plt
import numpy as np
import polars as pl
from app.crud import get_latest_timeseries_for_asset
from app.database import get_db
from fastapi import APIRouter, Depends, Query
from scipy import stats
from sqlalchemy.orm import Session

router = APIRouter(prefix="/monte_carlo", tags=["monte_carlo"])


class MonteCarloSimulationMethods(Enum):
    NORMAL_DISTRIBUTION = "Normal Distribution"
    BOOTSTRAP = "Bootstrap"
    T_STUDENT = "T-Student"


@dataclass
class MonteCarloConfig:
    """Configuration for Monte Carlo simulation"""

    monthly_investment: float = 1000.0
    investment_months: int = 60
    num_simulations: int = 10000
    initial_price: float = None
    seed: int = 42
    simulation_method: MonteCarloSimulationMethods = (
        MonteCarloSimulationMethods.BOOTSTRAP
    )


@dataclass
class SimulationResults:
    """Results from Monte Carlo simulation"""

    final_values: np.ndarray
    portfolio_paths: np.ndarray
    shares_accumulated: np.ndarray
    total_invested: float
    percentiles: Dict[int, float]
    risk_metrics: Dict[str, float]

    def to_dict(self):
        return {
            "final_values": self.final_values.tolist(),
            "portfolio_paths": self.portfolio_paths.tolist(),
            "shares_accumulated": self.shares_accumulated.tolist(),
            "total_invested": self.total_invested,
            "percentiles": self.percentiles,
            "risk_metrics": self.risk_metrics,
        }


class MonteCarloEngine:
    """Monte Carlo simulation engine for DCA strategy"""

    def __init__(self, timeseries_df: pl.DataFrame):
        self.df = timeseries_df
        self.returns_stats = None
        self.setup_data()

    def setup_data(self):
        """Prepare and analyze historical data"""
        # Ensure data is sorted by date
        self.df = self.df.sort("timestamp")

        # Calculate daily returns
        self.df = self.df.with_columns(
            [
                pl.col("close").pct_change().alias("daily_return"),
                pl.col("timestamp").dt.month().alias("month"),
                pl.col("timestamp").dt.year().alias("year"),
            ]
        )

        # Calculate monthly returns for more realistic DCA modeling
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

        # Extract return statistics
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
        """Generate synthetic monthly returns using multiple approaches"""
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
        """Run Monte Carlo simulation for DCA strategy"""
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

    def _calculate_max_drawdown(
        self, portfolio_paths: np.ndarray, monthly_investment: float
    ) -> float:
        """Calculate maximum drawdown across all simulations"""
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

    def print_results(self, results: SimulationResults, config: MonteCarloConfig):
        """Print comprehensive results analysis"""
        print("\n" + "=" * 60)
        print("MONTE CARLO SIMULATION RESULTS")
        print("=" * 60)

        print("\nStrategy: Dollar-Cost Averaging")
        print(f"Monthly Investment: ${config.monthly_investment:,.0f}")
        print(f"Investment Period: {config.investment_months} months")
        print(f"Total Invested: ${results.total_invested:,.0f}")
        print(f"Simulations: {config.num_simulations:,}")

        print("\nOUTCOME DISTRIBUTION:")
        print(
            f"{'Percentile':<12} {'Portfolio Value':<15} {'Total Return':<12} {'Annual Return':<12}"
        )
        print("-" * 55)

        for pct, value in results.percentiles.items():
            total_return = (value - results.total_invested) / results.total_invested
            annual_return = (value / results.total_invested) ** (
                12 / config.investment_months
            ) - 1
            print(
                f"{pct}th{'':<10} ${value:,.0f}{'':<6} {total_return:>8.1%}{'':<4} {annual_return:>8.1%}"
            )

        print("\nRISK METRICS:")
        print(f"Probability of Loss: {results.risk_metrics['probability_of_loss']:.1%}")
        print(f"Mean Return: {results.risk_metrics['mean_return']:.1%}")
        print(f"Return Volatility: {results.risk_metrics['std_return']:.1%}")
        print(f"Sharpe Ratio: {results.risk_metrics['sharpe_ratio']:.2f}")
        print(f"Average Max Drawdown: {results.risk_metrics['max_drawdown']:.1%}")
        print(f"Value at Risk (95%): {results.risk_metrics['var_95']:.1%}")
        print(f"Conditional VaR (95%): {results.risk_metrics['cvar_95']:.1%}")

        # Historical comparison (if we had actual historical DCA data)
        historical_final_value = self._calculate_historical_dca(config)
        historical_return = (
            historical_final_value - results.total_invested
        ) / results.total_invested
        historical_percentile = (
            np.sum(results.final_values <= historical_final_value)
            / len(results.final_values)
        ) * 100

        print("\nHISTORICAL COMPARISON:")
        print(
            f"Actual Historical Outcome: ${historical_final_value:,.0f} ({historical_return:.1%})"
        )
        print(f"Historical Performance Percentile: {historical_percentile:.0f}th")

    def _calculate_historical_dca(self, config: MonteCarloConfig) -> float:
        """Calculate what DCA would have returned using actual historical data"""
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
            available_months = len(monthly_prices)
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

    def plot_results(
        self,
        results: SimulationResults,
        config: MonteCarloConfig,
        show_paths: int = 100,
    ):
        """Create visualization of Monte Carlo results"""

        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))

        # Plot 1: Sample portfolio paths
        months = np.arange(config.investment_months + 1)
        for i in range(min(show_paths, config.num_simulations)):
            ax1.plot(
                months,
                results.portfolio_paths[i],
                alpha=0.1,
                color="blue",
                linewidth=0.5,
            )

        # Add percentile bands
        p10 = np.percentile(results.portfolio_paths, 10, axis=0)
        p50 = np.percentile(results.portfolio_paths, 50, axis=0)
        p90 = np.percentile(results.portfolio_paths, 90, axis=0)

        ax1.fill_between(
            months, p10, p90, alpha=0.3, color="lightblue", label="10th-90th percentile"
        )
        ax1.plot(months, p50, "r-", linewidth=2, label="Median outcome")
        ax1.set_xlabel("Months")
        ax1.set_ylabel("Portfolio Value ($)")
        ax1.set_title(f"Portfolio Value Evolution ({show_paths:,} sample paths shown)")
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Plot 2: Distribution of final outcomes
        ax2.hist(
            results.final_values,
            bins=50,
            alpha=0.7,
            density=True,
            color="skyblue",
            edgecolor="black",
        )
        ax2.axvline(
            results.total_invested,
            color="red",
            linestyle="--",
            linewidth=2,
            label="Break-even",
        )
        ax2.axvline(
            results.percentiles[50],
            color="orange",
            linestyle="-",
            linewidth=2,
            label="Median outcome",
        )
        ax2.set_xlabel("Final Portfolio Value ($)")
        ax2.set_ylabel("Probability Density")
        ax2.set_title("Distribution of Final Outcomes")
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        # Plot 3: Return distribution
        returns = (
            results.final_values - results.total_invested
        ) / results.total_invested
        ax3.hist(
            returns,
            bins=50,
            alpha=0.7,
            density=True,
            color="lightgreen",
            edgecolor="black",
        )
        ax3.axvline(0, color="red", linestyle="--", linewidth=2, label="Break-even")
        ax3.axvline(
            np.median(returns),
            color="orange",
            linestyle="-",
            linewidth=2,
            label="Median return",
        )
        ax3.set_xlabel("Total Return (%)")
        ax3.set_ylabel("Probability Density")
        ax3.set_title("Distribution of Total Returns")
        ax3.legend()
        ax3.grid(True, alpha=0.3)

        # Plot 4: Risk metrics over time
        months = np.arange(1, config.investment_months + 1)
        invested_over_time = months * config.monthly_investment

        # Calculate rolling risk metrics
        portfolio_values_over_time = results.portfolio_paths[:, 1:]  # Exclude month 0
        prob_loss_over_time = []

        for month in range(config.investment_months):
            month_values = portfolio_values_over_time[:, month]
            month_invested = invested_over_time[month]
            prob_loss = np.mean(month_values < month_invested)
            prob_loss_over_time.append(prob_loss)

        ax4.plot(
            months, prob_loss_over_time, "b-", linewidth=2, label="Probability of Loss"
        )
        ax4.set_xlabel("Months")
        ax4.set_ylabel("Probability of Loss")
        ax4.set_title("Risk Evolution Over Time")
        ax4.legend()
        ax4.grid(True, alpha=0.3)
        ax4.set_ylim(0, 1)

        plt.tight_layout()
        plt.show()


# Example usage with your AAPL data
def run_monte_carlo_analysis(
    timeseries_df: pl.DataFrame, simulation_method: MonteCarloSimulationMethods
):
    """Main function to run Monte Carlo analysis"""

    # Create engine
    engine = MonteCarloEngine(timeseries_df)

    # Configure simulation
    config = MonteCarloConfig(
        monthly_investment=1000.0,
        investment_months=60,
        num_simulations=10000,
        seed=42,
        simulation_method=simulation_method,
    )
    print(MonteCarloConfig.__annotations__)

    # Run simulation
    results = engine.simulate_dca_strategy(config)

    # Print results
    engine.print_results(results, config)

    # Create plots
    engine.plot_results(results, config)

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
    return results.to_dict()
