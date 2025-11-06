from app import models, schemas, crud
from app.core.portfolio_engine import (
    calculate_metrics,
    get_portfolio_data_for_user,
)
from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import polars as pl

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/transactions/{user_id}", response_model=list[schemas.Portfolio])
def get_portfolio_transactions(
    user_id: str, db: Session = Depends(get_db)
) -> list[schemas.Portfolio]:
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.timestamp)
        .all()
    )

    if not transactions:
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

    return portfolio_list


@router.get("/holdings/{user_id}", response_model=list[schemas.PortfolioHoldings])
def get_portfolio_holdings(
    user_id: str, db: Session = Depends(get_db)
) -> list[schemas.PortfolioHoldings]:
    transactions = (
        db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
    )

    if not transactions:
        return []

    holdings = {}
    latest_prices = crud.timeseries.get_latest_price_and_changes(db)
    for transaction in transactions:
        asset_id = str(transaction.asset_id)
        asset_name = db.query(models.Asset).get(transaction.asset_id).asset_name
        if asset_id not in holdings:
            holdings[asset_id] = schemas.PortfolioHoldings(
                asset_id=asset_id,
                asset_name=asset_name,
                net_quantity_shares=0.0,
                net_value=0.0,
            )

        if transaction.type == schemas.TransactionType.buy:
            holdings[asset_id].net_quantity_shares += transaction.quantity
        elif transaction.type == schemas.TransactionType.sell:
            holdings[asset_id].net_quantity_shares -= transaction.quantity

    for asset in holdings.keys():
        asset_id = int(asset)
        latest_price_for_asset = (
            latest_prices.filter(pl.col("asset_id") == asset_id)
            .select(pl.col("latest_price"))
            .item()
        )
        holdings[asset].net_value = (
            latest_price_for_asset * holdings[asset].net_quantity_shares
        )

    return list(holdings.values())


@router.get(
    "/portfolio_over_time/{user_id}", response_model=list[schemas.PortfolioValueHistory]
)
def get_portfolio_over_time(
    user_id: str, db: Session = Depends(get_db)
) -> list[schemas.PortfolioValueHistory]:
    """
    Calculate daily portfolio values for a user based on their transaction history.
    """
    try:
        _, history = get_portfolio_data_for_user(user_id, db)
        return history
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/portfolio_metrics/{user_id}", response_model=schemas.PortfolioMetrics)
def get_portfolio_metrics(
    user_id: str, db: Session = Depends(get_db)
) -> schemas.PortfolioMetrics:
    """
    Calculate performance metrics for a user's portfolio.
    """
    try:
        transactions, history = get_portfolio_data_for_user(user_id, db)
        metrics = calculate_metrics(transactions, history)

        if metrics is None:
            raise HTTPException(
                status_code=400, detail="Insufficient data to calculate metrics"
            )

        return metrics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
