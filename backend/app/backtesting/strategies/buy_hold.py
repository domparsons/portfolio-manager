from app.backtesting.actions import Action, BuyAction
from app.backtesting.context import BacktestContext
from app.backtesting.strategies.base import BacktestStrategy


class BuyAndHoldStrategy(BacktestStrategy):
    def __init__(self, allocation: dict, initial_investment: float):
        self.allocation = allocation
        self.initial_investment = initial_investment
        self.already_invested = False

    def on_day(self, context: BacktestContext) -> list[Action]:
        if self.already_invested:
            return []

        self.already_invested = True

        actions = []
        for asset_id, weight in self.allocation.items():
            amount = self.initial_investment * weight
            actions.append(BuyAction(asset_id, amount))

        return actions

    def get_parameters(self) -> dict:
        return {
            "strategy": "buy_and_hold",
            "allocation": self.allocation,
            "initial_investment": self.initial_investment,
        }

    def get_asset_ids(self) -> list[int]:
        return list(self.allocation.keys())
