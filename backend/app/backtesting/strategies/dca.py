from app.backtesting.actions import Action
from app.backtesting.context import BacktestContext
from app.backtesting.strategies.base import BacktestStrategy


class DCAStrategy(BacktestStrategy):
    def __init__(self):
        pass

    def on_day(self, context: BacktestContext) -> list[Action]:
        pass

    def get_parameters(self) -> dict:
        pass

    def get_asset_ids(self) -> list[int]:
        pass
