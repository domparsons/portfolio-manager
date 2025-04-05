from app import models
from sqlalchemy.orm import Session


def get_transactions_by_id(db: Session, user_id: str):
    return (
        db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
    )


def get_transactions_by_user_and_portfolio(
    db: Session, user_id: str, portfolio_name: str
):
    return (
        db.query(models.Transaction)
        .filter(
            models.Transaction.user_id == user_id,
            models.Transaction.portfolio_name == portfolio_name,
        )
        .all()
    )
