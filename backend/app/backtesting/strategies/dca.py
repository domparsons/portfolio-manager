from datetime import date

from polars import Decimal

from app.backtesting.actions import Action, BuyAction
from app.backtesting.context import BacktestContext
from app.backtesting.strategies.base import BacktestStrategy


class DCAStrategy(BacktestStrategy):
    def __init__(
        self,
        asset_id: int,
        initial_investment: Decimal,
        amount_per_period: Decimal,
        frequency: str,
    ):
        self.asset_id = asset_id
        self.initial_investment = initial_investment
        self.amount_per_period = amount_per_period
        self.frequency = frequency
        self.already_invested_initial = False
        self.last_investment_date = None

    def on_day(self, context: BacktestContext) -> list[Action]:
        should_invest = self._should_invest_today(context.current_date)
        if should_invest and not self.already_invested_initial:
            self.already_invested_initial = True
            return [
                BuyAction(asset_id=self.asset_id, dollar_amount=self.initial_investment)
            ]

        if should_invest:
            return [
                BuyAction(asset_id=self.asset_id, dollar_amount=self.amount_per_period)
            ]

        return []

    def _should_invest_today(self, current_date: date) -> bool:
        if self.last_investment_date is None:
            self.last_investment_date = current_date
            return True

        if self.frequency == "daily":
            should_invest = True
        elif self.frequency == "weekly":
            days_passed = (current_date - self.last_investment_date).days
            should_invest = days_passed >= 7
        elif self.frequency == "monthly":
            should_invest = (
                current_date.month != self.last_investment_date.month
                or current_date.year != self.last_investment_date.year
            )
        else:
            should_invest = False

        if should_invest:
            self.last_investment_date = current_date

        return should_invest

    def get_parameters(self) -> dict:
        return {
            "strategy": "dollar_cost_averaging",
            "asset_id": self.asset_id,
            "initial_investment": self.initial_investment,
            "amount_per_period": self.amount_per_period,
            "frequency": self.frequency,
        }

    def get_asset_ids(self) -> list[int]:
        return [self.asset_id]
