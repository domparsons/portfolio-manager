"""Tests for BacktestEngine static methods (action execution, value calculation)"""

from datetime import date
from decimal import Decimal

import pytest

from app.backtesting.actions import BuyAction, SellAction
from app.backtesting.engine import BacktestEngine
from app.schemas.backtest import DailySnapshot


class TestExecuteActions:
    """Test the engine's action execution logic"""

    def test_buy_action_increases_holdings(self):
        """Buying should add shares to holdings"""
        holdings = {}
        price_lookup = {(1, date(2024, 1, 1)): 100.0}

        action = BuyAction(asset_id=1, dollar_amount=1000.0)
        cash_flow = BacktestEngine._execute_actions(
            actions=[action],
            current_date=date(2024, 1, 1),
            holdings=holdings,
            price_lookup=price_lookup,
        )

        # $1000 / $100 = 10 shares
        assert float(holdings[1]) == pytest.approx(10.0)
        assert float(cash_flow) == pytest.approx(1000.0)

    def test_buy_action_with_fractional_shares(self):
        """Should handle fractional shares correctly"""
        holdings = {}
        price_lookup = {(1, date(2024, 1, 1)): 333.33}

        action = BuyAction(asset_id=1, dollar_amount=Decimal("1000.0"))
        BacktestEngine._execute_actions(
            actions=[action],
            current_date=date(2024, 1, 1),
            holdings=holdings,
            price_lookup=price_lookup,
        )

        # $1000 / $333.33 = 3.00003 shares
        assert float(holdings[1]) == pytest.approx(3.00003, rel=1e-3)

    def test_multiple_buys_accumulate_holdings(self):
        """Multiple buy actions should accumulate shares"""
        holdings = {}
        price_lookup = {(1, date(2024, 1, 1)): 50.0}

        actions = [
            BuyAction(asset_id=1, dollar_amount=Decimal("500")),  # 10 shares
            BuyAction(asset_id=1, dollar_amount=Decimal("250")),  # 5 shares
        ]

        BacktestEngine._execute_actions(
            actions=actions,
            current_date=date(2024, 1, 1),
            holdings=holdings,
            price_lookup=price_lookup,
        )

        assert float(holdings[1]) == pytest.approx(15.0)

    def test_sell_action_decreases_holdings(self):
        """Selling should reduce shares"""
        holdings = {1: Decimal("20.0")}
        price_lookup = {(1, date(2024, 1, 1)): 100.0}

        action = SellAction(asset_id=1, quantity=Decimal("5"))
        cash_flow = BacktestEngine._execute_actions(
            actions=[action],
            current_date=date(2024, 1, 1),
            holdings=holdings,
            price_lookup=price_lookup,
        )

        assert float(holdings[1]) == pytest.approx(15.0)
        assert float(cash_flow) == pytest.approx(-500.0)  # Negative = cash in

    def test_cannot_sell_more_than_owned(self):
        """Selling more shares than owned should raise ValueError"""
        holdings = {1: Decimal("5")}
        price_lookup = {(1, date(2024, 1, 1)): 100.0}

        action = SellAction(asset_id=1, quantity=Decimal("10"))

        with pytest.raises(ValueError, match="Cannot sell 10 shares, only 5 available"):
            BacktestEngine._execute_actions(
                actions=[action],
                current_date=date(2024, 1, 1),
                holdings=holdings,
                price_lookup=price_lookup,
            )

    def test_buy_multiple_assets(self):
        """Should handle multiple different assets"""
        holdings = {}
        price_lookup = {
            (1, date(2024, 1, 1)): 100.0,
            (2, date(2024, 1, 1)): 50.0,
        }

        actions = [
            BuyAction(asset_id=1, dollar_amount=Decimal("1000")),
            BuyAction(asset_id=2, dollar_amount=Decimal("500")),
        ]

        BacktestEngine._execute_actions(
            actions=actions,
            current_date=date(2024, 1, 1),
            holdings=holdings,
            price_lookup=price_lookup,
        )

        assert float(holdings[1]) == pytest.approx(10.0)
        assert float(holdings[2]) == pytest.approx(10.0)

    def test_missing_price_skips_action(self):
        """If price not available, action should be skipped"""
        holdings = {}
        price_lookup = {}  # No prices

        action = BuyAction(asset_id=1, dollar_amount=Decimal("1000"))
        cash_flow = BacktestEngine._execute_actions(
            actions=[action],
            current_date=date(2024, 1, 1),
            holdings=holdings,
            price_lookup=price_lookup,
        )

        assert 1 not in holdings
        assert float(cash_flow) == pytest.approx(0.0)

    def test_no_actions_returns_zero_cash_flow(self):
        """Empty action list should return 0 cash flow"""
        holdings = {}
        price_lookup = {}

        cash_flow = BacktestEngine._execute_actions(
            actions=[],
            current_date=date(2024, 1, 1),
            holdings=holdings,
            price_lookup=price_lookup,
        )

        assert float(cash_flow) == pytest.approx(0.0)


class TestCalculateValue:
    """Test portfolio value calculation"""

    def test_single_asset_value(self):
        """Calculate value with one asset"""
        holdings = {1: Decimal("10.0")}  # 10 shares
        price_lookup = {(1, date(2024, 1, 1)): 100.0}

        value = BacktestEngine._calculate_value(
            holdings=holdings,
            current_date=date(2024, 1, 1),
            price_lookup=price_lookup,
        )

        assert float(value) == pytest.approx(1000.0)

    def test_multiple_asset_value(self):
        """Calculate total portfolio value"""
        holdings = {1: Decimal("10.0"), 2: Decimal("5.0"), 3: Decimal("20.0")}
        price_lookup = {
            (1, date(2024, 1, 1)): 100.0,
            (2, date(2024, 1, 1)): 200.0,
            (3, date(2024, 1, 1)): 50.0,
        }

        value = BacktestEngine._calculate_value(
            holdings=holdings,
            current_date=date(2024, 1, 1),
            price_lookup=price_lookup,
        )

        # 10*$100 + 5*$200 + 20*$50 = $1000 + $1000 + $1000 = $3000
        assert float(value) == pytest.approx(3000.0)

    def test_fractional_shares_value(self):
        """Should handle fractional shares"""
        holdings = {1: Decimal("3.5")}
        price_lookup = {(1, date(2024, 1, 1)): 100.0}

        value = BacktestEngine._calculate_value(
            holdings=holdings,
            current_date=date(2024, 1, 1),
            price_lookup=price_lookup,
        )

        assert float(value) == pytest.approx(350.0)

    def test_zero_shares_excluded(self):
        """Assets with 0 shares shouldn't affect value"""
        holdings = {1: Decimal("10.0"), 2: Decimal("0.0")}
        price_lookup = {
            (1, date(2024, 1, 1)): 100.0,
            (2, date(2024, 1, 1)): 999.0,
        }

        value = BacktestEngine._calculate_value(
            holdings=holdings,
            current_date=date(2024, 1, 1),
            price_lookup=price_lookup,
        )

        assert float(value) == pytest.approx(1000.0)

    def test_negative_shares_excluded(self):
        """Negative holdings are skipped (bug protection)"""
        holdings = {1: Decimal("10.0"), 2: Decimal("-5.0")}
        price_lookup = {
            (1, date(2024, 1, 1)): 100.0,
            (2, date(2024, 1, 1)): 100.0,
        }

        value = BacktestEngine._calculate_value(
            holdings=holdings,
            current_date=date(2024, 1, 1),
            price_lookup=price_lookup,
        )

        # Negative shares ignored
        assert float(value) == pytest.approx(1000.0)

    def test_missing_price_excluded(self):
        """Assets without prices shouldn't count"""
        holdings = {1: Decimal("10.0"), 2: Decimal("5.0")}
        price_lookup = {(1, date(2024, 1, 1)): 100.0}  # No price for asset 2

        value = BacktestEngine._calculate_value(
            holdings=holdings,
            current_date=date(2024, 1, 1),
            price_lookup=price_lookup,
        )

        assert float(value) == pytest.approx(1000.0)

    def test_empty_holdings(self):
        """Empty portfolio has zero value"""
        holdings = {}
        price_lookup = {}

        value = BacktestEngine._calculate_value(
            holdings=holdings,
            current_date=date(2024, 1, 1),
            price_lookup=price_lookup,
        )

        assert float(value) == pytest.approx(0.0)


class TestCalculateDailyReturns:
    """Test daily return calculation logic"""

    def test_first_day_has_zero_return(self):
        """Day 1 should always have 0% return"""
        history = [
            DailySnapshot(
                date=date(2024, 1, 1),
                value=Decimal("1000.0"),
                holdings={},
                cash_flow=Decimal("1000.0"),
                daily_return_pct=Decimal("999.0"),  # Should be overwritten
                daily_return_abs=Decimal("999.0"),
            )
        ]

        result = BacktestEngine._calculate_daily_returns(history)

        assert float(result[0].daily_return_pct) == pytest.approx(0.0)
        assert float(result[0].daily_return_abs) == pytest.approx(0.0)

    def test_positive_return_no_cash_flow(self):
        """Portfolio appreciation without new investments"""
        history = [
            DailySnapshot(
                date=date(2024, 1, 1),
                value=Decimal("1000.0"),
                holdings={},
                cash_flow=Decimal("1000.0"),
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
            DailySnapshot(
                date=date(2024, 1, 2),
                value=Decimal("1100.0"),
                holdings={},
                cash_flow=Decimal("0.0"),  # No new investment
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
        ]

        result = BacktestEngine._calculate_daily_returns(history)

        # (1100 - 1000 - 0) / 1000 = 0.10 = 10%
        assert float(result[1].daily_return_pct) == pytest.approx(0.10)
        assert float(result[1].daily_return_abs) == pytest.approx(100.0)

    def test_return_excludes_cash_flow(self):
        """New investments shouldn't count as returns"""
        history = [
            DailySnapshot(
                date=date(2024, 1, 1),
                value=Decimal("1000.0"),
                holdings={},
                cash_flow=Decimal("1000.0"),
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
            DailySnapshot(
                date=date(2024, 1, 2),
                value=Decimal("1150.0"),
                holdings={},
                cash_flow=Decimal("100.0"),  # Added $100 investment
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
        ]

        result = BacktestEngine._calculate_daily_returns(history)

        # Value change = 1150 - 1000 - 100 = 50
        # Return = 50 / 1000 = 5%
        assert float(result[1].daily_return_pct) == pytest.approx(0.05)
        assert float(result[1].daily_return_abs) == pytest.approx(50.0)

    def test_negative_return(self):
        """Portfolio decline should show negative return"""
        history = [
            DailySnapshot(
                date=date(2024, 1, 1),
                value=Decimal("1000.0"),
                holdings={},
                cash_flow=Decimal("1000.0"),
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
            DailySnapshot(
                date=date(2024, 1, 2),
                value=Decimal("900.0"),
                holdings={},
                cash_flow=Decimal("0.0"),
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
        ]

        result = BacktestEngine._calculate_daily_returns(history)

        # (900 - 1000 - 0) / 1000 = -0.10 = -10%
        assert float(result[1].daily_return_pct) == pytest.approx(-0.10)
        assert float(result[1].daily_return_abs) == pytest.approx(-100.0)

    def test_multiple_days(self):
        """Should calculate returns for sequence of days"""
        history = [
            DailySnapshot(
                date=date(2024, 1, 1),
                value=Decimal("1000.0"),
                holdings={},
                cash_flow=Decimal("1000.0"),
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
            DailySnapshot(
                date=date(2024, 1, 2),
                value=Decimal("1100.0"),
                holdings={},
                cash_flow=Decimal("0.0"),
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
            DailySnapshot(
                date=date(2024, 1, 3),
                value=Decimal("1210.0"),
                holdings={},
                cash_flow=Decimal("0.0"),
                daily_return_pct=Decimal("0.0"),
                daily_return_abs=Decimal("0.0"),
            ),
        ]

        result = BacktestEngine._calculate_daily_returns(history)

        # Day 1: 0%
        assert float(result[0].daily_return_pct) == pytest.approx(0.0)
        # Day 2: (1100-1000-0)/1000 = 10%
        assert float(result[1].daily_return_pct) == pytest.approx(0.10)
        # Day 3: (1210-1100-0)/1100 = 10%
        assert float(result[2].daily_return_pct) == pytest.approx(0.10)

    def test_empty_history(self):
        """Empty history should return empty"""
        history = []
        result = BacktestEngine._calculate_daily_returns(history)
        assert result == []
