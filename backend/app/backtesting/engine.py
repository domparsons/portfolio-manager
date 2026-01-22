from datetime import date
from decimal import Decimal

from sqlalchemy.orm.session import Session

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


class BacktestEngine:
    def __init__(self, db: Session, autorun_prices=True):
        self.price_service = PriceService(db, autorun_prices)

    def run(
        self,
        strategy: BacktestStrategy,
        start_date: date,
        end_date: date,
        initial_cash: Decimal,
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
                daily_return_pct=Decimal("0"),
                daily_return_abs=Decimal("0"),
            )
            history.append(daily_snapshot)

        history = self._calculate_daily_returns(history)
        metrics = self._calculate_metrics(history, all_actions)

        total_invested = sum(snapshot.cash_flow for snapshot in history)

        if total_invested == 0:
            total_invested = initial_cash

        if history:
            total_return_abs = history[-1].value - total_invested
            total_return_pct = total_return_abs / total_invested
            final_value = history[-1].value
        else:
            total_return_abs = Decimal("0")
            total_return_pct = Decimal("0")
            final_value = Decimal("0")

        num_days = len(history)
        avg_daily_return = total_return_pct / num_days if num_days > 0 else 0

        result = schemas.BacktestResult(
            start_date=start_date,
            end_date=end_date,
            total_invested=total_invested,
            final_value=final_value,
            total_return_pct=total_return_pct,
            total_return_abs=total_return_abs,
            avg_daily_return=avg_daily_return,
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
    ) -> Decimal:
        if not actions:
            return Decimal("0")

        cash_flow = Decimal("0")
        for action in actions:
            price = price_lookup.get((action.asset_id, current_date))
            if price is None:
                continue

            price_decimal = Decimal(str(price))

            if isinstance(action, BuyAction):
                dollar_amount = Decimal(str(action.dollar_amount))
                number_of_shares = dollar_amount / price_decimal
                cash_flow += dollar_amount
                current_shares = holdings.get(action.asset_id, Decimal("0"))
                holdings[action.asset_id] = current_shares + number_of_shares

            elif isinstance(action, SellAction):
                quantity = Decimal(str(action.quantity))
                current_shares = holdings.get(action.asset_id, Decimal("0"))
                if quantity > current_shares:
                    raise ValueError(
                        f"Cannot sell {quantity} shares, only {current_shares} available"
                    )
                proceeds = quantity * price_decimal
                holdings[action.asset_id] = current_shares - quantity
                cash_flow -= proceeds

        return cash_flow

    @staticmethod
    def _calculate_value(
        holdings: dict, current_date: date, price_lookup: dict
    ) -> Decimal:
        holdings_value = Decimal("0")
        for asset, shares in holdings.items():
            if shares <= 0:
                continue

            price = price_lookup.get((asset, current_date))
            if not price:
                continue

            price_decimal = Decimal(str(price))
            holdings_value += price_decimal * shares

        return holdings_value

    @staticmethod
    def _calculate_daily_returns(
        history: list[DailySnapshot],
    ) -> list[DailySnapshot]:
        if len(history) == 0:
            return history

        history[0].daily_return_pct = Decimal("0")
        history[0].daily_return_abs = Decimal("0")

        for i in range(1, len(history)):
            prev_value = history[i - 1].value
            curr_value = history[i].value
            cash_flow = history[i].cash_flow

            # Cash flows happen at start of day, so start-of-day value includes new money
            start_of_day_value = prev_value + cash_flow
            value_change = curr_value - start_of_day_value
            history[i].daily_return_abs = value_change

            if start_of_day_value > 0:
                history[i].daily_return_pct = value_change / start_of_day_value
            else:
                history[i].daily_return_pct = Decimal("0")

        return history

    @staticmethod
    def _calculate_metrics(
        history: list[DailySnapshot], all_actions: list[Action]
    ) -> BacktestMetrics:
        if len(history) < 2:
            return BacktestMetrics(
                sharpe=Decimal("0"),
                max_drawdown=Decimal("0"),
                max_drawdown_duration=0,
                volatility=Decimal("0"),
                days_analysed=len(history),
                investments_made=len(all_actions),
                peak_value=Decimal("0"),
                trough_value=Decimal("0"),
            )

        returns = [day.daily_return_pct for day in history[1:]]

        max_drawdown_result = calculate_max_drawdown(history)

        final_value = history[-1].value

        peak_value = (
            max(s.value for s in history) if history else final_value
        )
        trough_value = (
            min(s.value for s in history) if history else final_value
        )

        return BacktestMetrics(
            sharpe=calculate_sharpe(returns),
            max_drawdown=max_drawdown_result.max_drawdown,
            max_drawdown_duration=max_drawdown_result.max_drawdown_duration,
            volatility=calculate_volatility(returns),
            days_analysed=len(history),
            investments_made=len(all_actions),
            peak_value=peak_value,
            trough_value=trough_value,
        )
