from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.main import app

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def mock_db():
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = []
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []
    return db


@pytest.fixture
def unauthenticated_client(mock_db):
    """
    TestClient with no auth override — real JWT enforcement is active.
    DB is mocked so tests do not require a running database.
    """
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app, raise_server_exceptions=False)
    yield client
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Test 1 — missing Authorization header is rejected
# ---------------------------------------------------------------------------


def test_protected_route_no_token_returns_401(unauthenticated_client):
    """
    A request to a protected route with no Authorization header must be
    rejected with HTTP 401.  Verifies the bearer-token scheme is enforced
    on every protected route.
    """
    response = unauthenticated_client.get("/portfolio/holdings")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Test 2 — malformed / self-signed token is rejected
# ---------------------------------------------------------------------------


def test_protected_route_malformed_token_returns_401(unauthenticated_client):
    """
    An Authorization header containing an arbitrary string that is not a valid
    Auth0 RS256 JWT must be rejected with HTTP 401.  This confirms the
    application cannot be bypassed by self-signed or hand-crafted tokens.
    """
    response = unauthenticated_client.get(
        "/portfolio/holdings",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Test 3 — privilege escalation to admin endpoint is prevented
# ---------------------------------------------------------------------------


def test_admin_endpoint_non_admin_user_returns_403(mock_db):
    """
    A request from an authenticated but non-admin user to a privileged admin
    endpoint must be rejected with HTTP 403.  Verifies the require_admin
    dependency enforces role-based access control independently of
    get_current_user.
    """
    app.dependency_overrides[get_current_user] = lambda: "auth0|regular-user"
    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app, raise_server_exceptions=False)

    response = client.post("/admin/update-assets", json=["AAPL"])

    app.dependency_overrides.clear()
    assert response.status_code == 403


# ---------------------------------------------------------------------------
# Test 4 — CORS headers absent for disallowed origin
# ---------------------------------------------------------------------------


def test_cors_disallowed_origin_receives_no_cors_header(unauthenticated_client):
    """
    A request from an origin not in the allow-list must not receive an
    Access-Control-Allow-Origin header in the response.  CORS is enforced by
    the browser using these headers; their absence means the browser will block
    the response from the untrusted page.
    """
    response = unauthenticated_client.get(
        "/health",
        headers={"Origin": "http://malicious-site.com"},
    )
    assert "access-control-allow-origin" not in response.headers


def test_cors_allowed_origin_receives_cors_header(unauthenticated_client):
    """
    Contrast test: a request from a whitelisted origin (the production frontend)
    must receive an Access-Control-Allow-Origin header so the browser permits
    the response.
    """
    response = unauthenticated_client.get(
        "/health",
        headers={"Origin": "https://portfolio.domparsons.com"},
    )
    assert response.headers.get("access-control-allow-origin") == (
        "https://portfolio.domparsons.com"
    )


# ---------------------------------------------------------------------------
# Test 5 — malformed / extreme inputs are rejected before business logic
# ---------------------------------------------------------------------------


def test_monte_carlo_negative_investment_rejected_before_auth(unauthenticated_client):
    """
    A Monte Carlo request with monthly_investment <= 0 must return 422 rather
    than propagating to application logic or producing a 500 error.  Input
    validation acts as the first line of defence against malformed data.
    """
    response = unauthenticated_client.get(
        "/monte_carlo/",
        params={
            "ticker_id": 1,
            "monthly_investment": -1000,
            "investment_months": 12,
            "simulation_method": "Normal Distribution",
        },
    )
    assert response.status_code == 422


def test_monte_carlo_zero_months_rejected(unauthenticated_client):
    """
    investment_months=0 is economically nonsensical and must be rejected with
    422 before it can trigger a divide-by-zero or empty-array error.
    """
    response = unauthenticated_client.get(
        "/monte_carlo/",
        params={
            "ticker_id": 1,
            "monthly_investment": 100,
            "investment_months": 0,
            "simulation_method": "Normal Distribution",
        },
    )
    assert response.status_code == 422


def test_monte_carlo_string_ticker_id_rejected(unauthenticated_client):
    """
    A non-integer ticker_id must be rejected with 422 by FastAPI's type
    validation layer — the application must never attempt a database lookup
    with an arbitrary string identifier.
    """
    response = unauthenticated_client.get(
        "/monte_carlo/",
        params={
            "ticker_id": "DROP TABLE assets;--",
            "monthly_investment": 100,
            "investment_months": 12,
            "simulation_method": "Normal Distribution",
        },
    )
    assert response.status_code == 422
