from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.main import app

TEST_USER_ID = "auth0|test-user-integration"


@pytest.fixture
def mock_db():
    """Mock database session that returns empty results for basic queries."""
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = []
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []
    return db


@pytest.fixture
def auth_client(mock_db):
    """TestClient with auth and DB dependencies overridden — simulates authenticated user."""
    app.dependency_overrides[get_current_user] = lambda: TEST_USER_ID
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def unauth_client():
    """TestClient with no dependency overrides — real auth enforcement."""
    app.dependency_overrides.clear()
    client = TestClient(app, raise_server_exceptions=False)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def db_only_client(mock_db):
    """TestClient with only DB overridden — used for unauthenticated endpoint tests."""
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app, raise_server_exceptions=False)
    yield client
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Health & routing
# ---------------------------------------------------------------------------


def test_health_check(unauth_client):
    """GET /health returns 200 with healthy status — baseline sanity check."""
    response = unauth_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root(unauth_client):
    """GET / returns 200."""
    response = unauth_client.get("/")
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# Authentication enforcement
# ---------------------------------------------------------------------------


def test_portfolio_holdings_no_token_returns_401(unauth_client):
    """Protected route with no Authorization header returns 401."""
    response = unauth_client.get("/portfolio/holdings")
    assert response.status_code == 401


def test_portfolio_holdings_malformed_token_returns_401(unauth_client):
    """Protected route with a malformed token returns 401."""
    response = unauth_client.get(
        "/portfolio/holdings",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert response.status_code == 401


def test_backtest_history_no_token_returns_401(unauth_client):
    """Backtest history endpoint rejects unauthenticated requests."""
    response = unauth_client.get("/backtest/backtest_history")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Authenticated endpoints
# ---------------------------------------------------------------------------


def test_portfolio_holdings_with_auth_returns_200(auth_client):
    """Authenticated request to portfolio holdings returns 200."""
    response = auth_client.get("/portfolio/holdings")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_portfolio_transactions_with_auth_returns_200(auth_client):
    """Authenticated request to portfolio transactions returns 200."""
    response = auth_client.get("/portfolio/transactions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_backtest_history_with_auth_returns_list(auth_client):
    """Authenticated request to backtest history returns a list."""
    response = auth_client.get("/backtest/backtest_history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------


def test_monte_carlo_negative_investment_returns_422(db_only_client):
    """Monte Carlo endpoint rejects monthly_investment <= 0 with 422."""
    response = db_only_client.get(
        "/monte_carlo/",
        params={
            "ticker_id": 1,
            "monthly_investment": -100,
            "investment_months": 12,
            "simulation_method": "Normal Distribution",
        },
    )
    assert response.status_code == 422


def test_monte_carlo_zero_months_returns_422(db_only_client):
    """Monte Carlo endpoint rejects investment_months <= 0 with 422."""
    response = db_only_client.get(
        "/monte_carlo/",
        params={
            "ticker_id": 1,
            "monthly_investment": 100,
            "investment_months": 0,
            "simulation_method": "Normal Distribution",
        },
    )
    assert response.status_code == 422


def test_monte_carlo_invalid_ticker_id_type_returns_422(db_only_client):
    """Monte Carlo endpoint rejects non-integer ticker_id with 422."""
    response = db_only_client.get(
        "/monte_carlo/",
        params={
            "ticker_id": "not-an-int",
            "monthly_investment": 100,
            "investment_months": 12,
            "simulation_method": "Normal Distribution",
        },
    )
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Authorisation (privilege escalation)
# ---------------------------------------------------------------------------


def test_admin_endpoint_non_admin_user_returns_403(mock_db):
    """Non-admin user attempting to access admin endpoint receives 403."""
    app.dependency_overrides[get_current_user] = lambda: "auth0|not-an-admin"
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app, raise_server_exceptions=False)

    response = client.post(
        "/admin/update-assets",
        json=["AAPL"],
    )

    app.dependency_overrides.clear()
    assert response.status_code == 403
