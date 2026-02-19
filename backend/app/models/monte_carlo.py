from dataclasses import dataclass
from enum import Enum

import numpy as np


class MonteCarloSimulationMethods(Enum):
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
    final_values: np.ndarray
    portfolio_paths: np.ndarray
    shares_accumulated: np.ndarray
    total_invested: float
    percentiles: dict[int, float]
    risk_metrics: dict[str, float]

    def to_dict(self):
        return {
            "final_values": self.final_values.tolist(),
            "portfolio_paths": self.portfolio_paths.tolist(),
            "shares_accumulated": self.shares_accumulated.tolist(),
            "total_invested": self.total_invested,
            "percentiles": self.percentiles,
            "risk_metrics": self.risk_metrics,
        }
