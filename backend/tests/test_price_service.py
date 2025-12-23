"""Tests for PriceService"""

from datetime import date, datetime
from unittest.mock import MagicMock, Mock

import pytest

from app.services.price_service import PriceService


@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return Mock()


@pytest.fixture
def mock_price_service(mock_db):
    """Create a PriceService with mocked DB"""
    return PriceService(mock_db, autorun=False)


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


class TestIsTradingDay:
    """Test weekday detection"""

    def test_monday_is_trading_day(self):
        """Monday (weekday=0) should be trading day"""
        monday = date(2024, 1, 1)  # Jan 1, 2024 is Monday
        assert PriceService.is_trading_day(monday)

    def test_friday_is_trading_day(self):
        """Friday (weekday=4) should be trading day"""
        friday = date(2024, 1, 5)  # Jan 5, 2024 is Friday
        assert PriceService.is_trading_day(friday)

    def test_saturday_not_trading_day(self):
        """Saturday (weekday=5) should NOT be trading day"""
        saturday = date(2024, 1, 6)  # Jan 6, 2024 is Saturday
        assert not PriceService.is_trading_day(saturday)

    def test_sunday_not_trading_day(self):
        """Sunday (weekday=6) should NOT be trading day"""
        sunday = date(2024, 1, 7)  # Jan 7, 2024 is Sunday
        assert not PriceService.is_trading_day(sunday)


class TestIsFirstTradingDayOfMonth:
    """Test first trading day detection"""

    def test_identifies_first_trading_day_correctly(self, trading_days):
        """Test the actual is_first_trading_day_of_month logic"""
        # Feb 3rd should be first trading day
        assert PriceService.is_first_trading_day_of_month(
            date(2025, 2, 3), trading_days
        )

        # Feb 4th should NOT be first trading day
        assert not PriceService.is_first_trading_day_of_month(
            date(2025, 2, 4), trading_days
        )

        # Mar 3rd should be first trading day
        assert PriceService.is_first_trading_day_of_month(
            date(2025, 3, 3), trading_days
        )

        # Apr 1st should be first trading day
        assert PriceService.is_first_trading_day_of_month(
            date(2025, 4, 1), trading_days
        )

    def test_empty_trading_days_returns_false(self):
        """Empty trading days list should return False"""
        assert not PriceService.is_first_trading_day_of_month(date(2024, 1, 1), [])

    def test_date_not_in_trading_days_returns_false(self):
        """Date not in trading_days list should return False"""
        trading_days = [date(2024, 1, 2), date(2024, 1, 3)]
        assert not PriceService.is_first_trading_day_of_month(
            date(2024, 1, 1), trading_days
        )

    def test_only_day_in_month_is_first(self):
        """If only one day in month, it's the first"""
        trading_days = [date(2024, 1, 15)]
        assert PriceService.is_first_trading_day_of_month(
            date(2024, 1, 15), trading_days
        )


class TestGetTradingDays:
    """Test trading days retrieval from database"""

    def test_returns_unique_dates_in_range(self, mock_db):
        """Should return distinct dates between start and end"""
        # Mock the database query
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.distinct.return_value = mock_query
        mock_query.order_by.return_value = mock_query

        # Mock query results - return tuples with datetime objects
        mock_query.all.return_value = [
            (datetime(2024, 1, 2, 0, 0, 0),),
            (datetime(2024, 1, 3, 0, 0, 0),),
            (datetime(2024, 1, 4, 0, 0, 0),),
        ]

        service = PriceService(mock_db, autorun=False)
        result = service.get_trading_days(date(2024, 1, 1), date(2024, 1, 5))

        assert result == [date(2024, 1, 2), date(2024, 1, 3), date(2024, 1, 4)]

    def test_handles_datetime_objects(self, mock_db):
        """Should convert datetime objects to date"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.distinct.return_value = mock_query
        mock_query.order_by.return_value = mock_query

        # Return datetime objects (some DBs do this)
        mock_query.all.return_value = [
            (datetime(2024, 1, 2, 12, 0, 0),),
            (datetime(2024, 1, 3, 12, 0, 0),),
        ]

        service = PriceService(mock_db, autorun=False)
        result = service.get_trading_days(date(2024, 1, 1), date(2024, 1, 5))

        # Should convert to date objects
        assert result == [date(2024, 1, 2), date(2024, 1, 3)]


class TestGetPriceLookup:
    """Test price lookup dictionary creation"""

    def test_creates_lookup_dict(self, mock_db):
        """Should create (asset_id, date) -> price mapping"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query

        # Mock timeseries data - use datetime objects
        mock_data = [
            Mock(asset_id=1, timestamp=datetime(2024, 1, 1, 0, 0, 0), adj_close=100.50),
            Mock(asset_id=1, timestamp=datetime(2024, 1, 2, 0, 0, 0), adj_close=101.00),
            Mock(asset_id=2, timestamp=datetime(2024, 1, 1, 0, 0, 0), adj_close=50.25),
        ]
        mock_query.all.return_value = mock_data

        service = PriceService(mock_db, autorun=False)
        result = service.get_price_lookup([1, 2], date(2024, 1, 1), date(2024, 1, 2))

        expected = {
            (1, date(2024, 1, 1)): 100.50,
            (1, date(2024, 1, 2)): 101.00,
            (2, date(2024, 1, 1)): 50.25,
        }
        assert result == expected

    def test_handles_datetime_timestamps(self, mock_db):
        """Should convert datetime timestamps to date"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query

        mock_data = [
            Mock(
                asset_id=1,
                timestamp=datetime(2024, 1, 1, 16, 0, 0),  # datetime
                adj_close=100.0,
            ),
        ]
        mock_query.all.return_value = mock_data

        service = PriceService(mock_db, autorun=False)
        result = service.get_price_lookup([1], date(2024, 1, 1), date(2024, 1, 1))

        assert (1, date(2024, 1, 1)) in result


class TestGetPrice:
    """Test single price retrieval with caching"""

    def test_returns_price_from_database(self, mock_db):
        """Should query database and return price"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = (100.50,)

        service = PriceService(mock_db, autorun=False)
        result = service.get_price(1, date(2024, 1, 1))

        assert result == 100.50

    def test_caches_price(self, mock_db):
        """Second call should use cache, not query DB"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = (100.50,)

        service = PriceService(mock_db, autorun=False)

        # First call
        result1 = service.get_price(1, date(2024, 1, 1))

        # Second call - should use cache
        result2 = service.get_price(1, date(2024, 1, 1))

        assert result1 == result2 == 100.50
        # DB should only be queried once
        assert mock_db.query.call_count == 1

    def test_returns_none_when_not_found(self, mock_db):
        """Should return None if price doesn't exist"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None

        service = PriceService(mock_db, autorun=False)
        result = service.get_price(1, date(2024, 1, 1))

        assert result is None


class TestGetLatestPrice:
    """Test latest price retrieval"""

    def test_returns_most_recent_price(self, mock_db):
        """Should return latest price for asset"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = (105.75,)

        service = PriceService(mock_db, autorun=False)
        result = service.get_latest_price(1)

        assert result == 105.75

    def test_returns_none_when_no_data(self, mock_db):
        """Should return None if no price data exists"""
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = None

        service = PriceService(mock_db, autorun=False)
        result = service.get_latest_price(999)

        assert result is None
