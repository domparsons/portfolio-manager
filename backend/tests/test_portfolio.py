from decimal import Decimal

from app.backtesting.metrics import calculate_max_drawdown, calculate_sharpe


def test_max_drawdown_basic(simple_drawdown_case):
    result = calculate_max_drawdown(simple_drawdown_case)
    expected = Decimal("-0.15")
    assert abs(result.max_drawdown - expected) < Decimal("0.01")


def test_no_drawdown(no_drawdown_case):
    result = calculate_max_drawdown(no_drawdown_case)
    expected = Decimal("0")
    assert abs(result.max_drawdown - expected) < Decimal("0.01")


def test_sharpe_ratio_basic(sample_portfolio_history):
    result = calculate_sharpe(sample_portfolio_history)
    expected = Decimal("2.45")
    assert abs(result - expected) < Decimal("0.01")


def test_sharpe_negative_returns(negative_sharpe_returns):
    result = calculate_sharpe(negative_sharpe_returns)
    assert result < 0


def test_sharpe_zero_volatility(zero_volatility_returns):
    result = calculate_sharpe(zero_volatility_returns)
    assert result == 0.0
