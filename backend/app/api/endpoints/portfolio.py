from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/{user_id}", response_model=list[schemas.Portfolio])
def get_portfolio(
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
