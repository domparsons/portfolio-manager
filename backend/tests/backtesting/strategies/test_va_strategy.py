"""Tests for Value Averaging (VA) Strategy"""

from datetime import date
from decimal import Decimal
from unittest.mock import Mock

from app.backtesting.actions import BuyAction
from app.backtesting.strategies.va import VAStrategy
from app.services.price_service import PriceService
from tests.backtesting.helpers import (
    create_mock_context,
    create_mock_history_with_value,
    create_multi_month_trading_days,
    create_trading_days,
)


class TestVAStrategyInitialization:
    """Test strategy initialization and configuration"""

    def test_get_parameters(self):
        """Verify get_parameters returns correct configuration"""
        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("500"),
        )

        params = strategy.get_parameters()

        assert params == {
            "strategy": "va",
            "asset_id": 1,
            "initial_investment": 1000,
            "target_increment_amount": 500,
        }

    def test_get_asset_ids(self):
        """Verify get_asset_ids returns single asset"""
        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("500"),
        )

        asset_ids = strategy.get_asset_ids()

        assert asset_ids == [1]

    def test_initial_state(self):
        """Verify strategy starts with period_number = 0"""
        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("500"),
        )

        assert strategy.period_number == 0


class TestVAInitialInvestment:
    """Test initial investment behavior on first trading day"""

    def test_invests_on_first_trading_day_of_month(self):
        """Should invest on first trading day of month"""
        # Jan 2024: 1st is a holiday, 2nd is first trading day
        trading_days = create_trading_days(2024, 1, [2, 3, 4, 5, 8, 9])
        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Jan 2nd - should invest
        context = create_mock_context(
            current_date=date(2024, 1, 2),
            history=[],
        )
        actions = strategy.on_day(context)

        assert len(actions) == 1
        assert isinstance(actions[0], BuyAction)

    def test_first_investment_increments_period_number(self):
        """First investment should increment period_number to 1"""
        trading_days = create_trading_days(2024, 1, [2, 3, 4, 5, 8, 9])
        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Jan 2nd - should invest
        context = create_mock_context(
            current_date=date(2024, 1, 2),
            history=[],
        )
        strategy.on_day(context)

        assert strategy.period_number == 1


class TestVAMonthlyInvestment:
    """Test monthly investment timing (first trading day logic)"""

    def test_invests_on_first_trading_day_of_month(self):
        """Should invest on first trading day of month"""
        # Jan 2024: 1st is a holiday, 2nd is first trading day
        trading_days = create_trading_days(2024, 1, [2, 3, 4, 5, 8, 9])

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Jan 2nd - should invest
        context = create_mock_context(
            current_date=date(2024, 1, 2),
            history=[],  # Empty history means current_value = 0
        )
        actions = strategy.on_day(context)

        assert len(actions) == 1
        assert isinstance(actions[0], BuyAction)

    def test_no_investment_on_non_first_trading_day(self):
        """Should not invest on other trading days of month"""
        trading_days = create_trading_days(2024, 1, [2, 3, 4, 5, 8, 9])

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Jan 3rd - NOT first trading day
        context = create_mock_context(current_date=date(2024, 1, 3))
        actions = strategy.on_day(context)

        assert len(actions) == 0

    def test_invests_across_multiple_months(self):
        """Should invest on first trading day of each month"""
        trading_days = create_multi_month_trading_days(
            2024,
            {
                1: [2, 3, 4],  # First trading day: Jan 2
                2: [1, 2, 5],  # First trading day: Feb 1
                3: [1, 4, 5],  # First trading day: Mar 1
            },
        )

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Jan 2 - should invest
        context1 = create_mock_context(
            current_date=date(2024, 1, 2),
            history=[],
        )
        actions1 = strategy.on_day(context1)
        assert len(actions1) == 1

        # Feb 1 - should invest
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("900")),
        )
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 1


class TestVATargetValueCalculation:
    """Test target value and shortfall calculations"""

    def test_initial_period_target_equals_initial_investment(self):
        """Period 0: target = initial_investment + (0 * increment) = initial"""
        trading_days = create_trading_days(2024, 1, [1, 2, 3])

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        context = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        actions = strategy.on_day(context)

        # target = 1000 + (100 * 0) = 1000
        # shortfall = 1000 - 0 = 1000
        assert actions[0].dollar_amount == 1000.0
        assert strategy.period_number == 1  # Incremented after investment

    def test_second_period_target_includes_increment(self):
        """Period 1: target = initial + (1 * increment)"""
        trading_days = create_multi_month_trading_days(
            2024,
            {
                1: [1],
                2: [1],
            },
        )

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Period 0: Jan investment (period_number becomes 1)
        context1 = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        strategy.on_day(context1)

        # Period 1: Feb investment
        # target = 1000 + (100 * 1) = 1100
        # If current_value = 1050, shortfall = 50
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("1050")),
        )
        actions = strategy.on_day(context2)

        assert actions[0].dollar_amount == 50.0

    def test_higher_shortfall_when_portfolio_underperforms(self):
        """If portfolio drops, shortfall increases"""
        trading_days = create_multi_month_trading_days(2024, {1: [1], 2: [1]})

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Period 0
        context1 = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        strategy.on_day(context1)

        # Period 1: Portfolio dropped to $900
        # target = 1100, current = 900, shortfall = 200
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("900")),
        )
        actions = strategy.on_day(context2)

        assert actions[0].dollar_amount == 200.0

    def test_lower_shortfall_when_portfolio_outperforms(self):
        """If portfolio grows, shortfall decreases"""
        trading_days = create_multi_month_trading_days(2024, {1: [1], 2: [1]})

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Period 0
        context1 = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        strategy.on_day(context1)

        # Period 1: Portfolio grew to $1090
        # target = 1100, current = 1090, shortfall = 10
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("1090")),
        )
        actions = strategy.on_day(context2)

        assert actions[0].dollar_amount == 10.0


class TestVANoInvestmentAboveTarget:
    """Test behavior when current value exceeds target"""

    def test_no_investment_when_above_target(self):
        """Should not invest if current_value > target_value"""
        trading_days = create_multi_month_trading_days(2024, {1: [1], 2: [1]})

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Period 0
        context1 = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        strategy.on_day(context1)

        # Period 1: Portfolio way above target
        # target = 1100, current = 1300, shortfall = -200
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("1300")),
        )
        actions = strategy.on_day(context2)

        # Should return empty list (shortfall <= 0)
        assert len(actions) == 0

    def test_period_number_not_incremented_when_no_investment(self):
        """period_number should not increment if no investment made"""
        trading_days = create_multi_month_trading_days(2024, {1: [1], 2: [1]})

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Period 0
        context1 = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        strategy.on_day(context1)
        assert strategy.period_number == 1

        # Try to invest but portfolio above target
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("1300")),
        )
        strategy.on_day(context2)

        # period_number should NOT have incremented
        assert strategy.period_number == 1


class TestVAEdgeCases:
    """Test edge cases and error handling"""

    def test_empty_trading_days_list(self):
        """Should handle empty trading_days gracefully"""
        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=[],  # Empty list
            price_service=PriceService,
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        # is_first_trading_day_of_month returns False for empty list
        assert len(actions) == 0

    def test_zero_initial_investment(self):
        """Strategy should handle $0 initial investment"""
        trading_days = create_trading_days(2024, 1, [1])

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("0"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        context = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        actions = strategy.on_day(context)

        # target = 0, shortfall = 0, should not invest
        assert len(actions) == 0

    def test_zero_target_increment(self):
        """$0 increment acts like buy-and-hold"""
        trading_days = create_multi_month_trading_days(2024, {1: [1], 2: [1]})

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("0"),  # No increment
            trading_days=trading_days,
            price_service=PriceService,
        )

        # Period 0: Invest 1000
        context1 = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        actions1 = strategy.on_day(context1)
        assert actions1[0].dollar_amount == 1000.0

        # Period 1: target = 1000 + (0 * 1) = 1000
        # If portfolio at 1000, no additional investment
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("1000")),
        )
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 0


class TestVAStateManagement:
    """Test internal state management"""

    def test_period_number_increments_on_investment(self):
        """period_number should increment each time investment occurs"""
        trading_days = create_multi_month_trading_days(
            2024,
            {
                1: [1],
                2: [1],
                3: [1],
            },
        )

        strategy = VAStrategy(
            asset_id=1,
            initial_investment=Decimal("1000"),
            target_increment_amount=Decimal("100"),
            trading_days=trading_days,
            price_service=PriceService,
        )

        assert strategy.period_number == 0

        # Jan: period_number becomes 1
        context1 = create_mock_context(
            current_date=date(2024, 1, 1),
            history=[],
        )
        strategy.on_day(context1)
        assert strategy.period_number == 1

        # Feb: period_number becomes 2
        context2 = create_mock_context(
            current_date=date(2024, 2, 1),
            history=create_mock_history_with_value(Decimal("1000")),
        )
        strategy.on_day(context2)
        assert strategy.period_number == 2

        # Mar: period_number becomes 3
        context3 = create_mock_context(
            current_date=date(2024, 3, 1),
            history=create_mock_history_with_value(Decimal("1100")),
        )
        strategy.on_day(context3)
        assert strategy.period_number == 3
