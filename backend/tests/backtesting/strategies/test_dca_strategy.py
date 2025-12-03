"""Tests for Dollar-Cost Averaging (DCA) Strategy"""

import pytest
from datetime import date, timedelta
from app.backtesting.strategies.dca import DCAStrategy
from app.backtesting.actions import BuyAction
from tests.backtesting.helpers import create_mock_context


class TestDCAStrategyInitialization:
    """Test strategy initialization and configuration"""

    def test_get_parameters(self):
        """Verify get_parameters returns correct configuration"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="monthly",
        )

        params = strategy.get_parameters()

        assert params == {
            "strategy": "dca",
            "asset_id": 1,
            "initial_investment": 1000.0,
            "amount_per_period": 100.0,
            "frequency": "monthly",
        }

    def test_get_asset_ids(self):
        """Verify get_asset_ids returns single asset"""
        strategy = DCAStrategy(
            asset_id=42,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="weekly",
        )

        asset_ids = strategy.get_asset_ids()

        assert asset_ids == [42]

    def test_initial_state(self):
        """Verify strategy starts with correct initial state"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="daily",
        )

        assert strategy.already_invested_initial is False
        assert strategy.last_investment_date is None


class TestDCAInitialInvestment:
    """Test initial investment behavior on first day"""

    def test_first_day_uses_initial_investment(self):
        """First trading day should invest initial_investment amount"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="monthly",
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        assert len(actions) == 1
        assert isinstance(actions[0], BuyAction)
        assert actions[0].asset_id == 1
        assert actions[0].dollar_amount == 1000.0

    def test_first_day_sets_invested_flag(self):
        """First investment should set already_invested_initial flag"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="weekly",
        )

        assert strategy.already_invested_initial is False

        context = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context)

        assert strategy.already_invested_initial is True

    def test_first_day_records_last_investment_date(self):
        """First investment should record the date"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="daily",
        )

        assert strategy.last_investment_date is None

        context = create_mock_context(current_date=date(2024, 1, 15))
        strategy.on_day(context)

        assert strategy.last_investment_date == date(2024, 1, 15)


class TestDCADailyFrequency:
    """Test daily investment frequency"""

    def test_daily_invests_every_day(self):
        """Daily frequency should invest on consecutive days"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="daily",
        )

        # Day 1: Initial investment
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        actions1 = strategy.on_day(context1)
        assert len(actions1) == 1
        assert actions1[0].dollar_amount == 1000.0

        # Day 2: Periodic investment
        context2 = create_mock_context(current_date=date(2024, 1, 2))
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 1
        assert actions2[0].dollar_amount == 100.0

        # Day 3: Another periodic investment
        context3 = create_mock_context(current_date=date(2024, 1, 3))
        actions3 = strategy.on_day(context3)
        assert len(actions3) == 1
        assert actions3[0].dollar_amount == 100.0

    def test_daily_uses_amount_per_period_after_first_day(self):
        """After initial investment, should use amount_per_period"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=5000.0,
            amount_per_period=250.0,
            frequency="daily",
        )

        # Skip first day
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)

        # Check subsequent days use amount_per_period
        context2 = create_mock_context(current_date=date(2024, 1, 2))
        actions = strategy.on_day(context2)

        assert actions[0].dollar_amount == 250.0


class TestDCAWeeklyFrequency:
    """Test weekly investment frequency"""

    def test_weekly_invests_after_seven_days(self):
        """Weekly frequency should invest after 7+ days"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="weekly",
        )

        # Day 1: Initial investment
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        actions1 = strategy.on_day(context1)
        assert len(actions1) == 1
        assert actions1[0].dollar_amount == 1000.0

        # Day 3 (2 days later): No investment
        context2 = create_mock_context(current_date=date(2024, 1, 3))
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 0

        # Day 7 (6 days later): No investment yet
        context3 = create_mock_context(current_date=date(2024, 1, 7))
        actions3 = strategy.on_day(context3)
        assert len(actions3) == 0

        # Day 8 (7 days later): Should invest
        context4 = create_mock_context(current_date=date(2024, 1, 8))
        actions4 = strategy.on_day(context4)
        assert len(actions4) == 1
        assert actions4[0].dollar_amount == 100.0

    def test_weekly_updates_last_investment_date(self):
        """Weekly investment should update last_investment_date"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="weekly",
        )

        # Initial investment on Jan 1
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)
        assert strategy.last_investment_date == date(2024, 1, 1)

        # Next investment on Jan 8 (7 days later)
        context2 = create_mock_context(current_date=date(2024, 1, 8))
        strategy.on_day(context2)
        assert strategy.last_investment_date == date(2024, 1, 8)

    def test_weekly_no_action_before_seven_days(self):
        """Should not invest if less than 7 days have passed"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="weekly",
        )

        # Initial investment
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)

        # Check each day from 2-6 days later
        for days_offset in range(1, 7):
            next_date = date(2024, 1, 1) + timedelta(days=days_offset)
            context = create_mock_context(current_date=next_date)
            actions = strategy.on_day(context)
            assert len(actions) == 0, f"Should not invest {days_offset} days later"


class TestDCAMonthlyFrequency:
    """Test monthly investment frequency"""

    def test_monthly_invests_on_month_boundary(self):
        """Monthly frequency should invest when month changes"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="monthly",
        )

        # Jan 15: Initial investment
        context1 = create_mock_context(current_date=date(2024, 1, 15))
        actions1 = strategy.on_day(context1)
        assert len(actions1) == 1
        assert actions1[0].dollar_amount == 1000.0

        # Jan 20: No investment (same month)
        context2 = create_mock_context(current_date=date(2024, 1, 20))
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 0

        # Feb 1: Should invest (new month)
        context3 = create_mock_context(current_date=date(2024, 2, 1))
        actions3 = strategy.on_day(context3)
        assert len(actions3) == 1
        assert actions3[0].dollar_amount == 100.0

    def test_monthly_no_action_within_same_month(self):
        """Should not invest multiple times in same month"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="monthly",
        )

        # Initial investment on Jan 1
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)

        # Try again on Jan 15
        context2 = create_mock_context(current_date=date(2024, 1, 15))
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 0

        # Try again on Jan 31
        context3 = create_mock_context(current_date=date(2024, 1, 31))
        actions3 = strategy.on_day(context3)
        assert len(actions3) == 0

    def test_monthly_invests_every_month(self):
        """Should invest once per month for multiple months"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="monthly",
        )

        # Jan: Initial investment
        context1 = create_mock_context(current_date=date(2024, 1, 15))
        actions1 = strategy.on_day(context1)
        assert len(actions1) == 1
        assert actions1[0].dollar_amount == 1000.0

        # Feb: Periodic investment
        context2 = create_mock_context(current_date=date(2024, 2, 10))
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 1
        assert actions2[0].dollar_amount == 100.0

        # Mar: Periodic investment
        context3 = create_mock_context(current_date=date(2024, 3, 5))
        actions3 = strategy.on_day(context3)
        assert len(actions3) == 1
        assert actions3[0].dollar_amount == 100.0

    def test_monthly_handles_year_boundary(self):
        """Should invest when year changes (Dec -> Jan)"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="monthly",
        )

        # Dec 2023: Initial investment
        context1 = create_mock_context(current_date=date(2023, 12, 15))
        actions1 = strategy.on_day(context1)
        assert len(actions1) == 1

        # Jan 2024: Should invest (new month AND new year)
        context2 = create_mock_context(current_date=date(2024, 1, 5))
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 1
        assert actions2[0].dollar_amount == 100.0


class TestDCAEdgeCases:
    """Test edge cases and error handling"""

    def test_invalid_frequency_returns_no_actions(self):
        """Invalid frequency should result in no investments"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="yearly",  # Not a valid frequency
        )

        # First day: Initial investment should still happen
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        actions1 = strategy.on_day(context1)
        assert len(actions1) == 1  # Initial investment

        # Second day: No periodic investment due to invalid frequency
        context2 = create_mock_context(current_date=date(2024, 1, 2))
        actions2 = strategy.on_day(context2)
        assert len(actions2) == 0

    def test_zero_initial_investment(self):
        """Strategy should handle $0 initial investment"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=0.0,
            amount_per_period=100.0,
            frequency="monthly",
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        assert len(actions) == 1
        assert actions[0].dollar_amount == 0.0

    def test_zero_amount_per_period(self):
        """Strategy should handle $0 periodic investment"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=0.0,
            frequency="daily",
        )

        # Initial investment
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)

        # Periodic investment should be $0
        context2 = create_mock_context(current_date=date(2024, 1, 2))
        actions = strategy.on_day(context2)

        assert len(actions) == 1
        assert actions[0].dollar_amount == 0.0

    def test_different_asset_ids(self):
        """Strategy should work with any asset_id"""
        strategy = DCAStrategy(
            asset_id=999,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="daily",
        )

        context = create_mock_context(current_date=date(2024, 1, 1))
        actions = strategy.on_day(context)

        assert actions[0].asset_id == 999


class TestDCAStateManagement:
    """Test internal state management across multiple calls"""

    def test_state_persists_across_calls(self):
        """Verify state variables persist between on_day calls"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="weekly",
        )

        # First call
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)

        # Verify state persisted
        assert strategy.already_invested_initial is True
        assert strategy.last_investment_date == date(2024, 1, 1)

        # Second call (too soon for weekly)
        context2 = create_mock_context(current_date=date(2024, 1, 5))
        actions = strategy.on_day(context2)

        # State should prevent investment
        assert len(actions) == 0
        assert strategy.last_investment_date == date(2024, 1, 1)  # Not updated

    def test_last_investment_date_updates_only_when_investing(self):
        """last_investment_date should only update when investment occurs"""
        strategy = DCAStrategy(
            asset_id=1,
            initial_investment=1000.0,
            amount_per_period=100.0,
            frequency="weekly",
        )

        # Initial investment on Jan 1
        context1 = create_mock_context(current_date=date(2024, 1, 1))
        strategy.on_day(context1)
        assert strategy.last_investment_date == date(2024, 1, 1)

        # No investment on Jan 5
        context2 = create_mock_context(current_date=date(2024, 1, 5))
        strategy.on_day(context2)
        assert strategy.last_investment_date == date(2024, 1, 1)  # Unchanged

        # Investment on Jan 8
        context3 = create_mock_context(current_date=date(2024, 1, 8))
        strategy.on_day(context3)
        assert strategy.last_investment_date == date(2024, 1, 8)  # Updated
