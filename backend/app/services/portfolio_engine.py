from datetime import date, datetime

from app import models, schemas
from app.backtesting.metrics import (
    calculate_max_drawdown,
    calculate_sharpe,
)
from sqlalchemy.orm.session import Session
from fastapi import HTTPException


def get_portfolio_data_for_user(
    user_id: str, db: Session
) -> tuple[list, list[schemas.PortfolioValueHistory]]:
    """
    Fetch all data needed for portfolio calculations.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        Tuple of (transactions, portfolio_history)

    Raises:
        ValueError: If no transactions or data available
    """
    from app.core import PriceService  # inside function to prevent circular import

    price_service = PriceService(db=db)

    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.timestamp)
        .all()
    )

    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions found")

    timestamps = [t.timestamp for t in transactions if t.timestamp]

    if not timestamps:
        raise HTTPException(status_code=404, detail="No valid transaction timestamps")


    start_date = min(timestamps)  # type: ignore[arg-type]
    end_date = datetime.now()

    trading_days = price_service.get_trading_days(start_date, end_date)

    if not trading_days:
        raise HTTPException(status_code=404, detail="No trading data available")


    unique_asset_ids = list(set(t.asset_id for t in transactions))  # type: ignore[arg-type]

    price_lookup = price_service.get_price_lookup(
        unique_asset_ids,  # type: ignore[arg-type]
        start_date,
        end_date,
    )

    history = calculate_portfolio_history(transactions, trading_days, price_lookup)

    return transactions, history


def calculate_portfolio_history(
    transactions: list,
    trading_days: list[date],
    price_lookup: dict[tuple[int, date], float],
) -> list[schemas.PortfolioValueHistory]:
    """
    Calculate portfolio value for each trading day.

    Args:
        transactions: list of transaction objects (sorted by timestamp)
        trading_days: list of trading days to calculate for
        price_lookup: dictionary mapping (asset_id, date) to price

    Returns:
        list of PortfolioValueHistory with date, value, daily_return_pct
    """
    holdings = {}
    results = []
    transaction_index = 0

    for day in trading_days:
        net_cash_flow = 0.0

        while (
            transaction_index < len(transactions)
            and transactions[transaction_index].timestamp.date() <= day
        ):
            txn = transactions[transaction_index]

            if txn.type == "buy":
                holdings[txn.asset_id] = holdings.get(txn.asset_id, 0.0) + txn.quantity
                net_cash_flow += txn.quantity * txn.price

            elif txn.type == "sell":
                holdings[txn.asset_id] = holdings.get(txn.asset_id, 0.0) - txn.quantity
                net_cash_flow -= txn.quantity * txn.price

            transaction_index += 1

        total_value = 0.0
        for asset_id, quantity in holdings.items():
            if quantity > 0:
                price = price_lookup.get((asset_id, day))
                if price is not None:
                    total_value += quantity * price

        results.append(
            schemas.PortfolioValueHistory(
                date=day,
                value=round(total_value, 2),
                daily_return_pct=0.0,
                daily_return_val=0.0,
                cash_flow=round(net_cash_flow, 2),
            )
        )

    if results:
        results[0].daily_return_pct = 0.0
        results[0].daily_return_val = 0.0

    for i in range(1, len(results)):
        prev_value = results[i - 1].value
        curr_value = results[i].value
        cash_flow = results[i].cash_flow

        if prev_value > 0:
            results[i].daily_return_pct = round(
                (curr_value - prev_value - cash_flow) / prev_value, 6
            )
            results[i].daily_return_val = round(curr_value - prev_value - cash_flow, 2)
        else:
            results[i].daily_return_pct = 0.0
            results[i].daily_return_val = 0.0

    return results


def get_current_holdings(transactions: list) -> dict[int, float]:
    """
    Calculate current holdings from transaction history.

    Args:
        transactions: list of transaction objects (sorted by timestamp)

    Returns:
        dictionary mapping asset_id to quantity
    """
    holdings = {}

    for txn in transactions:
        if txn.type == "buy":
            holdings[txn.asset_id] = holdings.get(txn.asset_id, 0.0) + txn.quantity
        elif txn.type == "sell":
            holdings[txn.asset_id] = holdings.get(txn.asset_id, 0.0) - txn.quantity

    return {
        asset_id: quantity for asset_id, quantity in holdings.items() if quantity > 0
    }


def calculate_metrics(
    transactions: list,
    history: list[schemas.PortfolioValueHistory],
) -> schemas.PortfolioMetrics | None:
    if len(history) < 1:
        return None

    total_cash_out = sum(
        txn.quantity * txn.price for txn in transactions if txn.type == "buy"
    )
    total_cash_in = sum(
        txn.quantity * txn.price for txn in transactions if txn.type == "sell"
    )
    net_invested = total_cash_out - total_cash_in

    if total_cash_out <= 0:
        return None

    current_value = history[-1].value
    total_return_abs = current_value - net_invested
    total_return_pct = total_return_abs / total_cash_out

    returns = [hist.daily_return_pct for hist in history[1:]]
    sharpe = calculate_sharpe(returns)
    max_drawdown = calculate_max_drawdown(history)

    return schemas.PortfolioMetrics(
        total_invested=round(total_cash_out, 2),
        current_value=round(current_value, 2),
        total_return_abs=round(total_return_abs, 2),
        total_return_pct=round(total_return_pct, 6),
        start_date=history[0].date,
        end_date=history[-1].date,
        days_analysed=len(history),
        sharpe=sharpe,
        max_drawdown=max_drawdown,
    )
