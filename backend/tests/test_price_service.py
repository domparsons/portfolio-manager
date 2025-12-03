from datetime import date
from unittest.mock import Mock

import pytest
from app.services.price_service import PriceService


@pytest.fixture
def mock_price_service():
    """Create a mock price service"""
    service = Mock(spec=PriceService)
    return service


@pytest.fixture
def trading_days():
    """Real trading days matching your log output"""
    return [
        date(2025, 2, 3),  # First trading day Feb (1st was Saturday)
        date(2025, 2, 4),  # Regular day
        date(2025, 2, 5),  # Regular day
        date(2025, 3, 3),  # First trading day Mar (1st was Saturday)
        date(2025, 3, 4),  # Regular day
        date(2025, 4, 1),  # First trading day Apr
        date(2025, 4, 2),  # Regular day
    ]


def test_identifies_first_trading_day_correctly(trading_days):
    """Test the actual is_first_trading_day_of_month logic"""
    # Feb 3rd should be first trading day
    assert PriceService.is_first_trading_day_of_month(date(2025, 2, 3), trading_days)

    # Feb 4th should NOT be first trading day
    assert not PriceService.is_first_trading_day_of_month(
        date(2025, 2, 4), trading_days
    )

    # Mar 3rd should be first trading day
    assert PriceService.is_first_trading_day_of_month(date(2025, 3, 3), trading_days)

    # Apr 1st should be first trading day
    assert PriceService.is_first_trading_day_of_month(date(2025, 4, 1), trading_days)
