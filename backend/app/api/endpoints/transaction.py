from datetime import datetime, timezone

import pytz
from app import crud, models, schemas
from app.crud.asset import get_asset_by_id
from app.database import get_db
from app.utils.convert_to_utc import convert_to_utc
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/transaction", tags=["transaction"])


@router.post("/", response_model=schemas.transaction.Portfolio)
def create_transaction(
    user_id: str,
    portfolio_name: str,
    asset_id: int,
    type: models.transaction.TransactionType,
    quantity: float,
    price: float,
    purchase_date: datetime,
    user_timezone: str,
    db: Session = Depends(get_db),
):
    asset = get_asset_by_id(asset_id, db)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user_timezone not in pytz.all_timezones:
        raise HTTPException(status_code=400, detail="Invalid timezone")

    utc_date = convert_to_utc(purchase_date, user_timezone)

    if utc_date > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400, detail="Purchase date cannot be in the future"
        )

    transaction = models.Transaction(
        user_id=user_id,
        portfolio_name=portfolio_name,
        asset_id=asset_id,
        type=type,
        quantity=quantity,
        price=price,
        timestamp=utc_date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    transaction_base = schemas.transaction.TransactionBase(
        id=transaction.id,
        user_id=transaction.user_id,
        portfolio_name=transaction.portfolio_name,
        asset_id=transaction.asset_id,
        type=transaction.type,
        quantity=transaction.quantity,
        price=transaction.price,
        timestamp=transaction.timestamp,
    )

    # Create the portfolio object with the transaction
    portfolio = schemas.transaction.Portfolio(
        portfolio_name=portfolio_name,
        transactions=[transaction_base],
    )
    return portfolio


@router.get("/{user_id}", response_model=list[schemas.transaction.TransactionOut])
def get_transactions(
    user_id: str,
    limit: int = None,
    db: Session = Depends(get_db),
):
    transactions = crud.transaction.get_transactions_by_user(
        db, user_id=user_id, limit=limit
    )
    return transactions


@router.get(
    "/by_asset/{user_id}/{asset_id}",
    response_model=list[schemas.transaction.TransactionOut],
)
def get_transactions_by_asset(
    user_id: str,
    asset_id: int,
    limit: int = None,
    db: Session = Depends(get_db),
):
    transactions = crud.transaction.get_transactions_by_user_and_asset(
        db, user_id=user_id, asset_id=asset_id, limit=limit
    )
    return transactions


@router.delete("/")
def delete_transaction(
    user_id: str,
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = crud.transaction.get_transaction_by_id(
        db, transaction_id=transaction_id
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this transaction"
        )

    crud.transaction.delete_transaction(db, transaction_id=transaction_id)
    return {"detail": "Transaction deleted successfully"}
