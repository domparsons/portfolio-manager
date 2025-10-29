from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.core import PriceService, calculate_portfolio_history
from app.database import get_db

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
            holdings[asset_id].net_value = round(
                holdings[asset_id].net_value + transaction.quantity * transaction.price,
                2,
            )
        elif transaction.type == schemas.TransactionType.sell:
            holdings[asset_id].net_quantity_shares -= transaction.quantity
            holdings[asset_id].net_value = round(
                holdings[asset_id].net_value - transaction.quantity * transaction.price,
                2,
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
    price_service = PriceService(db=db)

    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.timestamp)
        .all()
    )

    if not transactions:
        return []

    timestamps = [t.timestamp for t in transactions if t.timestamp]
    if not timestamps:
        return []

    start_date = min(timestamps)  # type: ignore[arg-type]
    end_date = datetime.now()

    trading_days = price_service.get_trading_days(start_date, end_date)

    if not trading_days:
        return []

    unique_asset_ids = list(set(t.asset_id for t in transactions))  # type: ignore[arg-type]

    price_lookup = price_service.get_price_lookup(
        unique_asset_ids,  # type: ignore[arg-type]
        start_date,
        end_date,
    )

    results = calculate_portfolio_history(transactions, trading_days, price_lookup)

    return results
