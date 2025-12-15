from datetime import date
from decimal import Decimal

from app.backtesting.actions import Action, BuyAction
from app.backtesting.context import BacktestContext
from app.backtesting.strategies.base import BacktestStrategy
from app.services.price_service import PriceService


class VAStrategy(BacktestStrategy):
    def __init__(
        self,
        asset_id: int,
        initial_investment: Decimal,
        target_increment_amount: Decimal,
        trading_days=list[date] | None,
        price_service=PriceService,
    ):
        self.asset_id = asset_id
        self.initial_investment = initial_investment
        self.target_increment_amount = target_increment_amount
        self.trading_days = trading_days or []
        self.price_service = price_service
        self.period_number = 0

    def on_day(self, context: BacktestContext) -> list[Action]:
        should_invest = self._should_invest_today(context.current_date)

        if should_invest:
            target_value = self.initial_investment + (
                self.target_increment_amount * self.period_number
            )
            current_value = context.history[-1].value if context.history else 0
            shortfall = target_value - current_value

            if shortfall > 0:
                self.period_number += 1
                return [BuyAction(asset_id=self.asset_id, dollar_amount=shortfall)]

        return []

    def _should_invest_today(self, current_date: date) -> bool:
        return self.price_service.is_first_trading_day_of_month(
            current_date, self.trading_days
        )

    def get_parameters(self) -> dict:
        return {
            "strategy": "va",
            "asset_id": self.asset_id,
            "initial_investment": self.initial_investment,
            "target_increment_amount": self.target_increment_amount,
        }

    def get_asset_ids(self) -> list[int]:
        return [self.asset_id]
