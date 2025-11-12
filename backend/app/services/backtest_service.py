from enum import Enum

from app import crud, schemas
from app.backtesting.engine import BacktestEngine
from app.backtesting.strategies import base
from app.backtesting.strategies.base import BacktestStrategy
from app.backtesting.strategies.buy_hold import BuyAndHoldStrategy
from app.backtesting.strategies.dca import DCAStrategy
from app.backtesting.strategies.lump_sum import LumpSumStrategy
from app.core import PriceService
from fastapi import HTTPException
from sqlalchemy.orm.session import Session


class StrategyType(str, Enum):
    BUY_AND_HOLD = "buy_and_hold"
    DCA = "dca"
    LUMP_SUM = "lump_sum"


STRATEGY_REGISTRY: dict[StrategyType | str, type[BacktestStrategy]] = {
    StrategyType.BUY_AND_HOLD: BuyAndHoldStrategy,
    StrategyType.DCA: DCAStrategy,
    StrategyType.LUMP_SUM: LumpSumStrategy,
}


class BacktestService:
    def __init__(self, db: Session):
        self.db = db
        self.price_service = PriceService(db)
        self.engine = BacktestEngine(self.db)

    def run_backtest(self, request: schemas.BacktestRequest) -> schemas.BacktestResult:
        if not self.validate_assets_exist(request.asset_ids):
            raise HTTPException(status_code=404, detail="Asset not found")

        strategy = self._create_strategy(request)

        backtest_result = self.engine.run(
            strategy=strategy,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_cash=request.initial_cash,
        )

        return backtest_result

    def validate_assets_exist(self, requested_asset_ids) -> bool:
        all_assets = crud.get_all_assets(db=self.db)
        all_asset_ids = [asset.id for asset in all_assets]
        for requested_asset in requested_asset_ids:
            if requested_asset not in all_asset_ids:
                return False

        return True

    def _create_strategy(
        self, request: schemas.BacktestRequest
    ) -> base.BacktestStrategy:
        if request.strategy == StrategyType.BUY_AND_HOLD:
            return self._create_buy_hold_strategy(request)
        elif request.strategy == StrategyType.DCA:
            return self._create_dca_strategy(request)
        elif request.strategy == StrategyType.LUMP_SUM:
            return self._create_lump_sum_strategy(request)

        raise ValueError(f"Unhandled strategy: {request.strategy}")

    @staticmethod
    def _create_buy_hold_strategy(
        request: schemas.BacktestRequest,
    ) -> BuyAndHoldStrategy:
        allocation = request.parameters.get("allocation")

        if allocation:
            allocation = {int(k): v for k, v in allocation.items()}

        if not allocation and len(request.asset_ids) == 1:
            allocation = {request.asset_ids[0]: 1.0}

        return BuyAndHoldStrategy(
            allocation=allocation,
            initial_investment=request.initial_cash,
        )

    @staticmethod
    def _create_dca_strategy(
        request: schemas.BacktestRequest,
    ) -> DCAStrategy:
        print(request)

        return DCAStrategy()

    @staticmethod
    def _create_lump_sum_strategy(
        request: schemas.BacktestRequest,
    ) -> LumpSumStrategy:
        print(request)

        return LumpSumStrategy()
