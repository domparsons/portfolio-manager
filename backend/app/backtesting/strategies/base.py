from abc import ABC, abstractmethod

from app.backtesting.actions import Action
from app.backtesting.context import BacktestContext


class BacktestStrategy(ABC):
    @abstractmethod
    def on_day(self, context: BacktestContext) -> list[Action]:
        """Called each trading day. Returns list of actions to execute."""
        pass

    @abstractmethod
    def get_parameters(self) -> dict:
        """Return strategy configuration for validation/logging."""
        pass

    @abstractmethod
    def get_asset_ids(self) -> list[int]:
        pass
