from sqlalchemy.orm import Session

from app import models
from app.schemas import TransactionOut


def get_transactions_by_user(db: Session, user_id: str) -> list[TransactionOut]:
    results = (
        db.query(models.Transaction, models.Asset.asset_name, models.Asset.ticker)
        .join(models.Asset, models.Transaction.asset_id == models.Asset.id)
        .filter(models.Transaction.user_id == user_id)
        .all()
    )
    return [
        TransactionOut(**t.__dict__, asset_name=asset_name, ticker=ticker)
        for t, asset_name, ticker in results
    ]
