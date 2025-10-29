from datetime import datetime

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

    # ========== Step 1: Get Transactions ==========
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.timestamp)
        .all()
    )

    if not transactions:
        return []

    # ========== Step 2: Determine Date Range ==========
    start_date = min(
        t.timestamp
        for t in transactions
        if t.timestamp is not None and isinstance(t.timestamp, datetime)
    )
    end_date = datetime.now()

    # ========== Step 3: Get Trading Days ==========
    trading_days_raw = (
        db.query(models.Timeseries.timestamp)
        .filter(
            models.Timeseries.timestamp >= start_date,
            models.Timeseries.timestamp <= end_date,
        )
        .distinct()
        .order_by(models.Timeseries.timestamp)
        .all()
    )

    trading_days = [
        row[0].date() if isinstance(row[0], datetime) else row[0]
        for row in trading_days_raw
    ]

    if not trading_days:
        return []

    # ========== Step 4: Get Unique Assets ==========
    unique_asset_ids = list(set(t.asset_id for t in transactions))

    # ========== Step 5: Fetch All Price Data ==========
    timeseries_data = (
        db.query(
            models.Timeseries.asset_id,
            models.Timeseries.timestamp,
            models.Timeseries.adj_close,
        )
        .filter(
            models.Timeseries.asset_id.in_(unique_asset_ids),
            models.Timeseries.timestamp >= start_date,
            models.Timeseries.timestamp <= end_date,
        )
        .all()
    )

    # Create price lookup dictionary (no Polars needed)
    price_lookup = {
        (row.asset_id, row.timestamp.date()): float(row.adj_close)
        for row in timeseries_data
    }

    # ========== Step 6: Calculate Portfolio Value Over Time ==========
    holdings = {}
    results = []
    transaction_index = 0

    for day in trading_days:
        # Apply all transactions up to and including this day
        while (
            transaction_index < len(transactions)
            and transactions[transaction_index].timestamp.date() <= day
        ):
            txn = transactions[transaction_index]

            if txn.type == "buy":
                holdings[txn.asset_id] = holdings.get(txn.asset_id, 0.0) + txn.quantity

            elif txn.type == "sell":
                holdings[txn.asset_id] = holdings.get(txn.asset_id, 0.0) - txn.quantity

            transaction_index += 1

        # Calculate total portfolio value for this day
        total_value = 0.0
        for asset_id, quantity in holdings.items():
            if quantity > 0:
                price = price_lookup.get((asset_id, day))
                if price is not None:
                    total_value += quantity * price

        results.append(
            {
                "date": day.isoformat(),
                "value": round(total_value, 2),
            }
        )

    # ========== Step 7: Calculate Daily Returns ==========
    if results:
        results[0]["daily_return"] = 0.0

    for i in range(1, len(results)):
        prev_value = results[i - 1]["value"]
        curr_value = results[i]["value"]

        if prev_value > 0:
            results[i]["daily_return"] = round(
                (curr_value - prev_value) / prev_value, 6
            )
        else:
            results[i]["daily_return"] = 0.0

    return results
