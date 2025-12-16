from datetime import datetime, timezone

import pytz
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.auth.dependencies import get_current_user
from app.crud.asset import get_asset_by_id
from app.database import get_db
from app.logger import logger
from app.utils.convert_to_utc import convert_to_utc

router = APIRouter(prefix="/transaction", tags=["transaction"])


@router.post("/", response_model=schemas.transaction.Portfolio)
def create_transaction(
    portfolio_name: str,
    asset_id: int,
    type: models.transaction.TransactionType,
    quantity: float,
    price: float,
    purchase_date: datetime,
    user_timezone: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user
    asset = get_asset_by_id(asset_id, db)
    if asset is None:
        logger.error(f"Asset not found for asset id {asset_id}")
        raise HTTPException(status_code=404, detail="Asset not found")

    user = crud.user.get_user_by_id(db, user_id=user_id)
    if user is None:
        logger.error("User not found")
        raise HTTPException(status_code=404, detail="User not found")

    if user_timezone not in pytz.all_timezones:
        logger.error(f"Invalid timezone: {user_timezone}")
        raise HTTPException(status_code=400, detail="Invalid timezone")

    utc_date = convert_to_utc(purchase_date, user_timezone)

    if utc_date > datetime.now(timezone.utc):
        logger.warning(f"Purchase date {utc_date} cannot be in the future")
        raise HTTPException(
            status_code=400, detail=f"Purchase date {utc_date} cannot be in the future"
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

    portfolio = schemas.transaction.Portfolio(
        portfolio_name=portfolio_name,
        transactions=[transaction_base],
    )
    logger.info(
        f"Transaction created: asset_id={asset_id}, type={type}, "
        f"quantity={quantity}, total=${quantity * price:.2f}"
    )
    return portfolio


@router.get("/", response_model=list[schemas.transaction.TransactionOut])
def get_transactions(
    current_user: str = Depends(get_current_user),
    limit: int = None,
    db: Session = Depends(get_db),
):
    user_id = current_user
    transactions = crud.transaction.get_transactions_by_user(
        db, user_id=user_id, limit=limit
    )
    return transactions


@router.get("/by_asset/{asset_id}", response_model=list[schemas.transaction.TransactionOut])
def get_transactions_by_asset(
    asset_id: int,
    current_user: str = Depends(get_current_user),
    limit: int = None,
    db: Session = Depends(get_db),
):
    user_id = current_user
    transactions = crud.transaction.get_transactions_by_user_and_asset(
        db, user_id=user_id, asset_id=asset_id, limit=limit
    )
    return transactions


@router.delete("/")
def delete_transaction(
    transaction_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user
    transaction = crud.transaction.get_transaction_by_id(
        db, transaction_id=transaction_id
    )
    if not transaction:
        logger.warning(
            f"Transaction {transaction_id} not found for user {user_id[-8:]}"
        )
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.user_id != user_id:
        logger.info(f"User {user_id[-8:]} not authorised to delete this transactions")
        raise HTTPException(
            status_code=403,
            detail=f"User {user_id[-8:]} not authorised to delete this transactions",
        )

    crud.transaction.delete_transaction(db, transaction_id=transaction_id)
    logger.info(
        f"Transaction {transaction_id} successfully deleted for user {user_id[-8:]}"
    )
    return {"detail": "Transaction deleted successfully"}
