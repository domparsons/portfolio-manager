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

    user = crud.user.get_user_by_id(db, id=user_id)
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
    return transaction


@router.get("/", response_model=list[schemas.transaction.TransactionBase])
def get_transactions(
    user_id: str,
    portfolio_name: str,
    db: Session = Depends(get_db),
):
    transactions = crud.transaction.get_transactions_by_user_and_portfolio(
        db, user_id=user_id, portfolio_name=portfolio_name
    )
    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions found")
    return transactions
