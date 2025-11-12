from datetime import date

from app import schemas
from app.backtesting.actions import Action
from app.backtesting.context import BacktestContext
from app.backtesting.strategies.base import BacktestStrategy
from app.schemas.backtest import DailySnapshot, BacktestMetrics
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
        cash = initial_cash
        history = []

        for trading_day in trading_days:
            context = BacktestContext(
                current_date=trading_day,
                cash=cash,
                holdings=holdings.copy(),
                price_lookup=price_lookup,
                history=history.copy(),
            )
            actions_list = strategy.on_day(context)
            cash_flow = self._execute_actions(
                actions_list, trading_day, cash, holdings, price_lookup
            )
            portfolio_value = self._calculate_value(
                cash, holdings, trading_day, price_lookup
            )
            daily_snapshot = DailySnapshot(
                date=trading_day,
                value=portfolio_value,
                cash=cash,
                holdings=holdings.copy(),
                cash_flow=cash_flow,
                daily_return_pct=0,
                daily_return_abs=0,
            )
            history.append(daily_snapshot)

        history = self._calculate_daily_returns(history)
        metrics = self._calculate_metrics(history)

        total_return_abs = history[-1].value - initial_cash
        total_return_pct = total_return_abs / initial_cash
        result = schemas.BacktestResult(
            start_date=start_date,
            end_date=end_date,
            initial_value=initial_cash,
            final_value=history[-1].value,
            total_return_abs=total_return_abs,
            total_return_pct=total_return_pct,
            metrics=metrics,
            history=history,
        )

        return result

    @staticmethod
    def _execute_actions(
        actions: list[Action],
        current_date: date,
        cash: float,  # Modified in place
        holdings: dict,  # Modified in place
        price_lookup: dict,
    ) -> float:  # Returns cash_flow
        # Todo
        cash_flow = 0
        return cash_flow

    @staticmethod
    def _calculate_value(
        cash: float, holdings: dict, current_date: date, price_lookup: dict
    ) -> float:  # Returns total value, not tuple
        # Todo
        total_value = 0
        return total_value

    @staticmethod
    def _calculate_daily_returns(
        history: list[DailySnapshot],
    ) -> list[DailySnapshot]:
        # Todo
        return history

    @staticmethod
    def _calculate_metrics(history: list[DailySnapshot]) -> BacktestMetrics:
        # Todo (or merge with portfolio metrics calculator?)
        metrics = schemas.BacktestMetrics(
            sharpe=0, max_drawdown=0, volatility=0, days_analysed=0
        )
        return metrics
