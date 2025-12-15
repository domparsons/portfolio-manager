"""Tests for Buy-and-Hold Strategy"""

from datetime import date
from decimal import Decimal

from app.backtesting.actions import BuyAction
from app.backtesting.strategies.buy_hold import BuyAndHoldStrategy
from tests.backtesting.helpers import create_mock_context


class TestBuyHoldStrategyInitialization:
    """Test strategy initialization and configuration"""

    def test_get_parameters(self):
        """Verify get_parameters returns correct configuration"""

        strategy = BuyAndHoldStrategy(
            allocation={1: 1.0},
            initial_investment=Decimal("1000"),
        )

        params = strategy.get_parameters()

        assert params == {
            "strategy": "buy_and_hold",
            "allocation": {1: 1.0},
            "initial_investment": Decimal("1000"),
        }

    def test_get_asset_ids(self):
        """Verify get_asset_ids returns single asset"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 1.0},
            initial_investment=Decimal("1000"),
        )

        asset_ids = strategy.get_asset_ids()

        assert asset_ids == [1]

    def test_multiple_assets_allocation(self):
        """Should invest in multiple assets according to weights"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 0.6, 2: 0.4},  # 60% asset 1, 40% asset 2
            initial_investment=Decimal("1000"),
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        assert len(actions) == 2
        assert actions[0].asset_id == 1
        assert actions[0].dollar_amount == Decimal("600")
        assert actions[1].asset_id == 2
        assert actions[1].dollar_amount == Decimal("400")

    def test_get_asset_ids_multiple_assets(self):
        """Verify get_asset_ids returns all assets"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 0.5, 2: 0.3, 3: 0.2},
            initial_investment=Decimal("1000"),
        )

        asset_ids = strategy.get_asset_ids()

        assert set(asset_ids) == {1, 2, 3}

    def test_initial_state(self):
        """Verify strategy starts with correct initial state"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 1.0},
            initial_investment=Decimal("1000"),
        )

        assert strategy.already_invested is False


#
class TestBuyAndHoldInitialInvestment:
    """Test initial investment behavior on first day"""

    def test_first_day_uses_initial_investment(self):
        """First trading day should invest initial_investment amount"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 1.0},
            initial_investment=Decimal("1000"),
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        assert len(actions) == 1
        assert isinstance(actions[0], BuyAction)
        assert actions[0].asset_id == 1
        assert actions[0].dollar_amount == 1000.0

    def test_first_day_sets_invested_flag(self):
        """First investment should set already_invested_initial flag"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 1.0},
            initial_investment=Decimal("1000"),
        )

        assert strategy.already_invested is False

        context = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context)

        assert strategy.already_invested is True


class TestBuyAndHoldEdgeCases:
    """Test edge cases and error handling"""

    def test_zero_initial_investment(self):
        """Strategy should handle $0 initial investment"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 1.0},
            initial_investment=Decimal("0"),
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        assert len(actions) == 1
        assert actions[0].dollar_amount == 0.0

    def test_different_asset_ids(self):
        """Strategy should work with any asset_id"""

        strategy = BuyAndHoldStrategy(
            allocation={999: 1.0},
            initial_investment=Decimal("1000"),
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        assert actions[0].asset_id == 999


class TestBuyAndHoldStateManagement:
    """Test internal state management across multiple calls"""

    def test_state_persists_across_calls(self):
        """Verify state variables persist between on_day calls"""
        strategy = BuyAndHoldStrategy(
            allocation={1: 1.0},
            initial_investment=Decimal("1000"),
        )

        # First call
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)

        # Verify state persisted
        assert strategy.already_invested is True

        # Second call (too soon for weekly)
        context2 = create_mock_context(current_date=date(2024, 1, 5))
        actions = strategy.on_day(context2)

        # State should prevent investment
        assert len(actions) == 0
