from app import models
from app.schemas import TransactionBase, TransactionOut
from sqlalchemy.orm import Session


def get_transactions_by_user(
    db: Session, user_id: str, limit: int = None
) -> list[TransactionOut]:
    query = (
        db.query(models.Transaction, models.Asset.asset_name, models.Asset.ticker)
        .join(models.Asset, models.Transaction.asset_id == models.Asset.id)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.timestamp.desc())
    )
    results = query.limit(limit).all() if limit is not None else query.all()
    return [
        TransactionOut(**t.__dict__, asset_name=asset_name, ticker=ticker)
        for t, asset_name, ticker in results
    ]


def get_transactions_by_user_and_asset(
    db: Session, user_id: str, asset_id: int, limit: int = None
) -> list[TransactionOut]:
    query = (
        db.query(models.Transaction, models.Asset.asset_name, models.Asset.ticker)
        .join(models.Asset, models.Transaction.asset_id == models.Asset.id)
        .filter(models.Transaction.user_id == user_id)
        .filter(models.Transaction.asset_id == asset_id)
        .order_by(models.Transaction.timestamp.desc())
    )
    results = query.limit(limit).all() if limit is not None else query.all()
    return [
        TransactionOut(**t.__dict__, asset_name=asset_name, ticker=ticker)
        for t, asset_name, ticker in results
    ]


def get_transaction_by_id(db: Session, transaction_id: int) -> TransactionOut | None:
    transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )
    if not transaction:
        return None
    asset = (
        db.query(models.Asset).filter(models.Asset.id == transaction.asset_id).first()
    )
    return TransactionOut(
        **transaction.__dict__, asset_name=asset.asset_name, ticker=asset.ticker
    )


def delete_transaction(db: Session, transaction_id: int) -> TransactionBase | None:
    transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )
    if not transaction:
        return None
    db.delete(transaction)
    db.commit()
    return TransactionBase(**transaction.__dict__)
