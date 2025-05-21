from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/transactions/{user_id}", response_model=list[schemas.Portfolio])
def get_portfolio_transactions(
    user_id: str, db: Session = Depends(get_db)
) -> list[schemas.Portfolio]:
    transactions = (
        db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
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
                net_quantity=0.0,
            )
        if transaction.type == schemas.TransactionType.buy:
            holdings[asset_id].net_quantity += transaction.quantity
        elif transaction.type == schemas.TransactionType.sell:
            holdings[asset_id].net_quantity -= transaction.quantity

    return list(holdings.values())
