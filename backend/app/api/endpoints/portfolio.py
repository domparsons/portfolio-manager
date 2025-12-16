from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.logger import logger
from app.services.portfolio_engine import (
    calculate_holdings,
    calculate_metrics,
    get_portfolio_data_for_user,
)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/transactions", response_model=list[schemas.Portfolio])
def get_portfolio_transactions(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[schemas.Portfolio]:
    user_id = current_user
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.timestamp)
        .all()
    )

    if not transactions:
        logger.info(f"No transactions found for user {user_id[-8:]}")
        return []

    portfolios = {}
    for transaction in transactions:
        portfolio_name = str(transaction.portfolio_name)
        if portfolio_name not in portfolios:
            portfolios[portfolio_name] = []
        portfolios[portfolio_name].append(transaction)

    portfolio_list = []
    for portfolio_name, transactions in portfolios.items():
        portfolio = schemas.Portfolio(
            portfolio_name=portfolio_name,
            transactions=[
                schemas.TransactionBase(
                    id=transaction.id,
                    user_id=transaction.user_id,
                    portfolio_name=transaction.portfolio_name,
                    asset_id=transaction.asset_id,
                    type=transaction.type,
                    quantity=transaction.quantity,
                    price=transaction.price,
                    timestamp=transaction.timestamp,
                )
                for transaction in transactions
            ],
        )
        portfolio_list.append(portfolio)

    logger.info(
        f"Fetched {len(portfolio_list)} portfolio transactions for user {user_id[-8:]}"
    )
    return portfolio_list


@router.get("/holdings", response_model=list[schemas.PortfolioHoldings])
def get_portfolio_holdings(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[schemas.PortfolioHoldings]:
    user_id = current_user
    transactions = (
        db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
    )

    if not transactions:
        logger.info(f"No transactions found for user {user_id[-8:]}")
        return []

    latest_prices = crud.timeseries.get_latest_price_and_changes(db)

    holdings = calculate_holdings(transactions, latest_prices, db)

    logger.info(
        f"Calculated holdings for user {user_id[-8:]}: {len(holdings)} positions"
    )
    return list(holdings.values())


@router.get("/portfolio_over_time", response_model=list[schemas.PortfolioValueHistory])
def get_portfolio_over_time(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[schemas.PortfolioValueHistory]:
    """
    Calculate daily portfolio values for a user based on their transaction history.
    """
    user_id = current_user
    try:
        _, history = get_portfolio_data_for_user(user_id, db)
        logger.info(f"Fetched portfolio timeseries data for user {user_id[-8:]}")
        return history
    except ValueError as e:
        logger.error(f"Failed to get portfolio timeseries for user {user_id[-8:]}: {e}")
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/portfolio_metrics", response_model=schemas.PortfolioMetrics)
def get_portfolio_metrics(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> schemas.PortfolioMetrics:
    """
    Calculate performance metrics for a user's portfolio.
    """
    user_id = current_user
    try:
        transactions, history = get_portfolio_data_for_user(user_id, db)
        metrics = calculate_metrics(transactions, history)

        if metrics is None:
            logger.warning(
                f"Insufficient data to calculate metrics for user {user_id[-8:]}"
            )
            raise HTTPException(
                status_code=400, detail="Insufficient data to calculate metrics"
            )

        logger.info(f"Fetched portfolio metrics for user {user_id[-8:]}")
        return metrics
    except ValueError as e:
        logger.error(f"An error occurred while getting portfolio metrics: {e}")
        raise HTTPException(status_code=404, detail=str(e))
