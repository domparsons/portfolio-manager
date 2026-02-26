from dataclasses import dataclass
from enum import Enum


class MonteCarloSimulationMethods(str, Enum):
    NORMAL_DISTRIBUTION = "Normal Distribution"
    BOOTSTRAP = "Bootstrap"
    T_STUDENT = "T-Student"


@dataclass
class MonteCarloConfig:
    monthly_investment: float = 1000.0
    investment_months: int = 60
    num_simulations: int = 10_000
    initial_price: float = None
    seed: int = 42
    simulation_method: MonteCarloSimulationMethods = (
        MonteCarloSimulationMethods.BOOTSTRAP
    )


@dataclass
class SimulationResults:
    chart_data: list[dict]
    sample_paths: list[list[float]]
    histogram: list[dict]
    total_invested: float
    final_percentiles: dict[int, float]
    risk_metrics: dict[str, float]

    def to_dict(self):
        return {
            "chart_data": self.chart_data,
            "sample_paths": self.sample_paths,
            "histogram": self.histogram,
            "total_invested": self.total_invested,
            "final_percentiles": self.final_percentiles,
            "risk_metrics": self.risk_metrics,
        }
