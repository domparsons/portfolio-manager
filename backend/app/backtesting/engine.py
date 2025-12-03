from datetime import date

from app import schemas
from app.backtesting.actions import Action, BuyAction, SellAction
from app.backtesting.context import BacktestContext
from app.backtesting.metrics import (
    calculate_max_drawdown,
    calculate_sharpe,
    calculate_volatility,
)
from app.backtesting.strategies.base import BacktestStrategy
from app.schemas.backtest import BacktestMetrics, DailySnapshot
from app.services.price_service import PriceService
from sqlalchemy.orm.session import Session


class BacktestEngine:
    def __init__(self, db: Session):
        self.price_service = PriceService(db)

    def run(
        self,
        strategy: BacktestStrategy,
        start_date: date,
        end_date: date,
        initial_cash: float,
    ) -> schemas.BacktestResult:
        trading_days = self.price_service.get_trading_days(start_date, end_date)
        asset_ids = strategy.get_asset_ids()
        price_lookup = self.price_service.get_price_lookup(
            asset_ids, start_date, end_date
        )
        holdings = {}
        history = []
        all_actions = []

        for trading_day in trading_days:
            context = BacktestContext(
                current_date=trading_day,
                holdings=holdings.copy(),
                price_lookup=price_lookup,
                history=history.copy(),
            )
            actions_list = strategy.on_day(context)
            all_actions = all_actions + actions_list
            cash_flow = self._execute_actions(
                actions_list, trading_day, holdings, price_lookup
            )
            portfolio_value = self._calculate_value(holdings, trading_day, price_lookup)
            daily_snapshot = DailySnapshot(
                date=trading_day,
                value=portfolio_value,
                holdings=holdings.copy(),
                cash_flow=cash_flow,
                daily_return_pct=0,
                daily_return_abs=0,
            )
            history.append(daily_snapshot)

        history = self._calculate_daily_returns(history)
        metrics = self._calculate_metrics(history, all_actions)

        total_invested = sum(snapshot.cash_flow for snapshot in history)

        if total_invested == 0:
            total_invested = initial_cash

        total_return_abs = history[-1].value - total_invested
        total_return_pct = total_return_abs / total_invested
        result = schemas.BacktestResult(
            start_date=start_date,
            end_date=end_date,
            total_invested=total_invested,
            final_value=history[-1].value,
            total_return_pct=total_return_pct,
            total_return_abs=total_return_abs,
            metrics=metrics,
            history=history,
        )

        return result

    @staticmethod
    def _execute_actions(
        actions: list[Action],
        current_date: date,
        holdings: dict,
        price_lookup: dict,
    ) -> float:
        if not actions:
            return 0.0

        cash_flow = 0
        for action in actions:
            price = price_lookup.get((action.asset_id, current_date))
            if price is None:
                continue

            if isinstance(action, BuyAction):
                number_of_shares = action.dollar_amount / price
                cash_flow += action.dollar_amount
                current_shares = holdings.get(action.asset_id, 0.0)
                holdings[action.asset_id] = current_shares + number_of_shares

            elif isinstance(action, SellAction):
                current_shares = holdings.get(action.asset_id, 0.0)
                if action.quantity > current_shares:
                    raise ValueError(
                        f"Cannot sell {action.quantity} shares, only {current_shares} available"
                    )
                current_shares = holdings.get(action.asset_id, 0.0)
                proceeds = action.quantity * price
                holdings[action.asset_id] = current_shares - action.quantity
                cash_flow -= proceeds

        return cash_flow

    @staticmethod
    def _calculate_value(
        holdings: dict, current_date: date, price_lookup: dict
    ) -> float:
        holdings_value = 0
        for asset, shares in holdings.items():
            if shares <= 0:
                continue

            price = price_lookup.get((asset, current_date))
            if not price:
                continue

            holdings_value += price * shares

        portfolio_value = holdings_value

        return portfolio_value

    @staticmethod
    def _calculate_daily_returns(
        history: list[DailySnapshot],
    ) -> list[DailySnapshot]:
        if len(history) == 0:
            return history

        history[0].daily_return_pct = 0
        history[0].daily_return_abs = 0

        for i in range(1, len(history)):
            prev_value = history[i - 1].value
            curr_value = history[i].value
            cash_flow = history[i].cash_flow

            value_change = curr_value - prev_value - cash_flow
            history[i].daily_return_abs = value_change

            if prev_value > 0:
                history[i].daily_return_pct = value_change / prev_value
            else:
                history[i].daily_return_pct = 0.0

        return history

    @staticmethod
    def _calculate_metrics(
        history: list[DailySnapshot], all_actions: list[Action]
    ) -> BacktestMetrics:
        if len(history) < 2:
            return BacktestMetrics(
                sharpe=0.0,
                max_drawdown=0.0,
                max_drawdown_duration=0,
                volatility=0.0,
                days_analysed=len(history),
                investments_made=len(all_actions),
            )

        returns = [day.daily_return_pct for day in history[1:]]

        max_drawdown_result = calculate_max_drawdown(history)

        return BacktestMetrics(
            sharpe=calculate_sharpe(returns),
            max_drawdown=max_drawdown_result.max_drawdown,
            max_drawdown_duration=max_drawdown_result.max_drawdown_duration,
            volatility=calculate_volatility(returns),
            days_analysed=len(history),
            investments_made=len(all_actions),
        )
