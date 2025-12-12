import pytest
from app.schemas import PortfolioValueHistory
from datetime import date
from decimal import Decimal


@pytest.fixture
def simple_drawdown_case():
    """Portfolio with one clear drawdown: +20%, -15%, +10%"""
    return [
        PortfolioValueHistory(
            date=date(2024, 1, 1), value=Decimal("1000"), daily_return_pct=Decimal("0.0"), daily_return_val=Decimal("0")
        ),
        PortfolioValueHistory(
            date=date(2024, 1, 2),
            value=Decimal("1200"),
            daily_return_pct=Decimal("0.2"),
            daily_return_val=Decimal("200"),
        ),
        PortfolioValueHistory(
            date=date(2024, 1, 3),
            value=Decimal("1020"),
            daily_return_pct=Decimal("-0.15"),
            daily_return_val=Decimal("-180"),
        ),
        PortfolioValueHistory(
            date=date(2024, 1, 4),
            value=Decimal("1122"),
            daily_return_pct=Decimal("0.1"),
            daily_return_val=Decimal("102"),
        ),
    ]
    # Expected max drawdown: -15% (from 1200 to 1020)


@pytest.fixture
def no_drawdown_case():
    """Portfolio with only gains"""
    return [
        PortfolioValueHistory(
            date=date(2024, 1, 1), value=Decimal("1000"), daily_return_pct=Decimal("0.0"), daily_return_val=Decimal("0")
        ),
        PortfolioValueHistory(
            date=date(2024, 1, 2), value=Decimal("1050"), daily_return_pct=Decimal("5.0"), daily_return_val=Decimal("50")
        ),
        PortfolioValueHistory(
            date=date(2024, 1, 3),
            value=Decimal("1100"),
            daily_return_pct=Decimal("4.76"),
            daily_return_val=Decimal("50"),
        ),
    ]


@pytest.fixture
def negative_sharpe_returns():
    """Returns that should produce negative Sharpe"""
    # Consistently losing more than risk-free rate
    return [-0.01, -0.005, -0.008] * 30


@pytest.fixture
def zero_volatility_returns():
    """Edge case: no volatility"""
    return [0.001] * 50


@pytest.fixture
def sample_portfolio_history():
    return [
        0.153256,
        -0.042347,
        0.040587,
        0.022057,
        -0.001881,
        -0.038929,
        0.013932,
        -0.019389,
        0.034044,
        0.024341,
        0.018422,
        0.004378,
        0.004119,
        0.005057,
        0.006123,
        0.003868,
        -0.037359,
        -0.031486,
        -0.001865,
        -0.011412,
        0.006334,
        0.005279,
        0.063115,
        0.010164,
        -0.002821,
        -0.004149,
        -0.0009,
        -0.011752,
        -0.009159,
        -0.023085,
        -0.003616,
        -0.030229,
        0.025276,
        0.00105,
        -0.002348,
        0.004506,
        0.004237,
        0.007793,
        -0.002216,
        -0.01081,
        0.016417,
        -0.012126,
        0.006063,
        -0.019216,
        0.002115,
        -0.013771,
        0.010039,
        -0.014026,
        0.00481,
        0.022459,
        0.00249,
        -0.005962,
        0.006298,
        -0.002782,
        0.000398,
        0.020363,
        0.012882,
        0.022256,
        0.005231,
        -0.016877,
        0.000286,
        0.005387,
        0.006022,
        -0.005892,
        -0.012042,
        0.002351,
        0.005027,
        -0.000667,
        0.00553,
        0.006163,
        0.009046,
        -0.001167,
        -0.001823,
        0.000562,
        0.000796,
        -0.013002,
        -0.01052,
        -0.007088,
        -0.024984,
        0.004798,
        -0.002117,
        0.050915,
        0.031783,
        0.042361,
        -0.008337,
        0.010872,
        0.016024,
        -0.002357,
        -0.005112,
        -0.003023,
        -0.001429,
        -0.019735,
        -0.004911,
        0.012717,
        -0.002634,
        0.009465,
        0.005146,
        0.008981,
        -0.001806,
        -0.010425,
        0.03809,
        0.005493,
        -0.000375,
        -0.007551,
        -0.014839,
        -0.032259,
        0.014286,
        0.017563,
        0.011236,
        0.006126,
        0.003527,
        -0.004645,
        0.032033,
        0.043096,
        -0.006443,
        -0.008332,
        0.018073,
        -0.005489,
        -0.004032,
        0.000786,
        0.00322,
        0.006577,
        0.003461,
        -0.005155,
        -0.000818,
        0.00616,
        -0.015578,
        0.006613,
        -0.031519,
        0.000444,
        0.006337,
        -0.00758,
        0.01956,
        0.039439,
        0.002021,
        -0.01644,
        0.004372,
        0.012482,
        0.022791,
        0.000707,
        0.002602,
        0.006303,
        -0.003795,
        -0.009469,
        0.008327,
        0.00037,
        0.009403,
    ]
