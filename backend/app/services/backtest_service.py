from datetime import date, timedelta
from enum import Enum

from app import crud, schemas
from app.backtesting.engine import BacktestEngine
from app.backtesting.strategies import base
from app.backtesting.strategies.base import BacktestStrategy
from app.backtesting.strategies.buy_hold import BuyAndHoldStrategy
from app.backtesting.strategies.dca import DCAStrategy
from app.backtesting.strategies.va import VAStrategy
from app.core import PriceService
from app.logger import logger
from fastapi import HTTPException
from sqlalchemy.orm.session import Session


class StrategyType(str, Enum):
    BUY_AND_HOLD = "buy_and_hold"
    DCA = "dca"
    VA = "va"


STRATEGY_REGISTRY: dict[StrategyType | str, type[BacktestStrategy]] = {
    StrategyType.BUY_AND_HOLD: BuyAndHoldStrategy,
    StrategyType.DCA: DCAStrategy,
    StrategyType.VA: VAStrategy,
}


class BacktestService:
    def __init__(self, db: Session):
        self.db = db
        self.price_service = PriceService(db)
        self.engine = BacktestEngine(self.db)

    def run_backtest(self, request: schemas.BacktestRequest) -> schemas.BacktestResult:
        strategy = self._create_strategy(request)

        logger.info(
            f"Running {request.strategy} on asset(s) {request.asset_ids} from {request.start_date} to {request.end_date} with initial investment {request.initial_cash} and parameters {request.parameters}"
        )

        backtest_result = self.engine.run(
            strategy=strategy,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_cash=request.initial_cash,
        )

        return backtest_result

    def validate_request(self, request: schemas.BacktestRequest, db: Session):
        invalid_assets = self._validate_assets_exist(request.asset_ids)
        if invalid_assets:
            logger.warning(f"Asset(s) not found: {invalid_assets}")
            raise HTTPException(
                status_code=404, detail=f"Asset(s) not found {invalid_assets}"
            )

        if request.start_date >= date.today():
            logger.warning(
                f"Start date {request.start_date} cannot be in the future or today"
            )
            raise HTTPException(
                status_code=400,
                detail=f"Start date {request.start_date} cannot be in the future or today",
            )

        if request.end_date >= date.today():
            logger.warning(
                f"End date {request.end_date} cannot be in the future or today"
            )
            raise HTTPException(
                status_code=400,
                detail=f"End date {request.end_date} cannot be in the future or today",
            )

        if request.start_date >= request.end_date:
            raise HTTPException(
                status_code=400,
                detail="End date cannot be after or equal to start date",
            )

        date_range = request.end_date - request.start_date
        if date_range > timedelta(days=365 * 10):
            logger.warning("Date range cannot exceed 10 years")
            raise HTTPException(
                status_code=400, detail="Date range cannot exceed 10 years"
            )

        if date_range < timedelta(days=7):
            logger.warning("Date range must be at least 7 days")
            raise HTTPException(
                status_code=400, detail="Date range must be at least 7 days"
            )

        self._validate_data_availability(
            request.asset_ids, request.start_date, request.end_date, db
        )

    @staticmethod
    def _validate_data_availability(
        asset_ids: list[int], start_date: date, end_date: date, db: Session
    ):
        for asset_id in asset_ids:
            result = crud.get_data_availability_for_asset(asset_id, db)
            if not result or result.total_days == 0:
                raise HTTPException(
                    status_code=400, detail=f"No data available for asset {asset_id}"
                )

            first_available = (
                result.first_date.date()
                if isinstance(result.first_date, date)
                else result.first_date
            )
            last_available = (
                result.last_date.date()
                if isinstance(result.last_date, date)
                else result.last_date
            )

            if start_date < first_available:
                asset = crud.get_asset_by_id(asset_id, db)
                asset_name = (
                    f"{asset.get('ticker', 'unknown')} ({asset.get('asset_name', 'unknown')})"
                    if asset
                    else f"asset {asset_id}"
                )

                raise HTTPException(
                    status_code=400,
                    detail=f"No data available for {asset_name} before {first_available}. Data available from {first_available} onwards.",
                )

            if end_date > last_available:
                asset = crud.get_asset_by_id(asset_id, db)
                asset_name = (
                    f"{asset.get('ticker', 'unknown')} ({asset.get('asset_name', 'unknown')})"
                    if asset
                    else f"asset {asset_id}"
                )

                raise HTTPException(
                    status_code=400,
                    detail=f"No data available for {asset_name} after {last_available}. Data available until {last_available}.",
                )

    def _validate_assets_exist(self, requested_asset_ids) -> list[int]:
        all_assets = crud.get_all_assets(db=self.db)
        all_asset_ids = [asset.id for asset in all_assets]
        assets_not_found = []
        for requested_asset in requested_asset_ids:
            if requested_asset not in all_asset_ids:
                assets_not_found.append(requested_asset)

        return assets_not_found

    def _create_strategy(
        self, request: schemas.BacktestRequest
    ) -> base.BacktestStrategy:
        if request.strategy == StrategyType.BUY_AND_HOLD:
            return self._create_buy_hold_strategy(request)
        elif request.strategy == StrategyType.DCA:
            return self._create_dca_strategy(request)
        elif request.strategy == StrategyType.VA:
            return self._create_va_strategy(request)

        logger.error(f"Unhandled strategy: {request.strategy}")
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
        asset_id = request.asset_ids[0]
        amount_per_period = request.parameters.get("amount_per_period")
        frequency = request.parameters.get("frequency")

        return DCAStrategy(
            asset_id=asset_id,
            initial_investment=request.initial_cash,
            amount_per_period=amount_per_period,
            frequency=frequency,
        )

    def _create_va_strategy(
        self,
        request: schemas.BacktestRequest,
    ) -> VAStrategy:
        asset_id = request.asset_ids[0]
        target_increment_amount = request.parameters.get("target_increment_amount")
        trading_days = self.price_service.get_trading_days(
            request.start_date, request.end_date
        )

        return VAStrategy(
            asset_id=asset_id,
            initial_investment=request.initial_cash,
            target_increment_amount=target_increment_amount,
            trading_days=trading_days,
            price_service=self.price_service,
        )
