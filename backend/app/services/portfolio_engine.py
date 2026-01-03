from datetime import date, datetime
from decimal import Decimal

import polars as pl
from fastapi import HTTPException
from sqlalchemy.orm.session import Session

from app import models, schemas
from app.backtesting.metrics import (
    calculate_max_drawdown,
    calculate_sharpe,
    calculate_volatility,
)


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
        net_cash_flow = Decimal("0")

        while (
            transaction_index < len(transactions)
            and transactions[transaction_index].timestamp.date() <= day
        ):
            txn = transactions[transaction_index]

            if txn.type == "buy":
                holdings[txn.asset_id] = holdings.get(txn.asset_id, Decimal("0")) + txn.quantity
                net_cash_flow += txn.quantity * txn.price

            elif txn.type == "sell":
                holdings[txn.asset_id] = holdings.get(txn.asset_id, Decimal("0")) - txn.quantity
                net_cash_flow -= txn.quantity * txn.price

            transaction_index += 1

        total_value = Decimal("0")
        for asset_id, quantity in holdings.items():
            if quantity > 0:
                price = price_lookup.get((asset_id, day))
                if price is not None:
                    total_value += quantity * Decimal(str(price))

        results.append(
            schemas.PortfolioValueHistory(
                date=day,
                value=total_value.quantize(Decimal("0.01")),
                daily_return_pct=Decimal("0"),
                daily_return_val=Decimal("0"),
                cash_flow=net_cash_flow.quantize(Decimal("0.01")),
            )
        )

    if results:
        results[0].daily_return_pct = Decimal("0")
        results[0].daily_return_val = Decimal("0")

    for i in range(1, len(results)):
        prev_value = results[i - 1].value
        curr_value = results[i].value
        cash_flow = results[i].cash_flow

        if prev_value > 0:
            results[i].daily_return_pct = (
                (curr_value - prev_value - cash_flow) / prev_value
            ).quantize(Decimal("0.000001"))
            results[i].daily_return_val = (curr_value - prev_value - cash_flow).quantize(Decimal("0.01"))
        else:
            results[i].daily_return_pct = Decimal("0")
            results[i].daily_return_val = Decimal("0")

    return results


def get_current_holdings(transactions: list) -> dict[int, Decimal]:
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
            holdings[txn.asset_id] = holdings.get(txn.asset_id, Decimal("0")) + txn.quantity
        elif txn.type == "sell":
            holdings[txn.asset_id] = holdings.get(txn.asset_id, Decimal("0")) - txn.quantity

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

    max_drawdown_response = calculate_max_drawdown(history)

    return schemas.PortfolioMetrics(
        total_invested=total_cash_out.quantize(Decimal("0.01")),
        current_value=current_value.quantize(Decimal("0.01")),
        total_return_abs=total_return_abs.quantize(Decimal("0.01")),
        total_return_pct=total_return_pct.quantize(Decimal("0.000001")),
        start_date=history[0].date,
        end_date=history[-1].date,
        days_analysed=len(history),
        sharpe=Decimal(str(calculate_sharpe(returns))),
        max_drawdown=Decimal(str(max_drawdown_response.max_drawdown)),
        max_drawdown_duration=max_drawdown_response.max_drawdown_duration,
        volatility=Decimal(str(calculate_volatility(returns))),
    )


def calculate_holdings(
    transactions: list[type[models.Transaction]],
    latest_prices: pl.DataFrame,
    db: Session,
) -> dict:
    holdings = {}

    for transaction in transactions:
        asset_id = str(transaction.asset_id)
        asset_name = db.query(models.Asset).get(transaction.asset_id).asset_name
        if asset_id not in holdings:
            holdings[asset_id] = schemas.PortfolioHoldings(
                asset_id=asset_id,
                asset_name=asset_name,
                net_quantity_shares=Decimal("0"),
                average_cost_basis=Decimal("0"),
                total_cost=Decimal("0"),
                current_price=Decimal("0"),
                net_value=Decimal("0"),
                unrealised_gain_loss=Decimal("0"),
                unrealised_gain_loss_pct=Decimal("0"),
            )

        if transaction.type == schemas.TransactionType.buy:
            holdings[asset_id].total_cost += transaction.quantity * transaction.price
            holdings[asset_id].net_quantity_shares += transaction.quantity
            if holdings[asset_id].net_quantity_shares > 0:
                holdings[asset_id].average_cost_basis = (
                    holdings[asset_id].total_cost
                    / holdings[asset_id].net_quantity_shares
                )
        elif transaction.type == schemas.TransactionType.sell:
            cost_reduction = (
                holdings[asset_id].average_cost_basis * transaction.quantity
            )
            holdings[asset_id].total_cost -= cost_reduction
            holdings[asset_id].net_quantity_shares -= transaction.quantity

    for asset in holdings.values():
        if asset.net_quantity_shares == 0:
            continue

        asset_id = int(asset.asset_id)
        latest_price_float = (
            latest_prices.filter(pl.col("asset_id") == asset_id)
            .select(pl.col("latest_price"))
            .item()
        )
        latest_price = Decimal(str(latest_price_float))

        asset.current_price = latest_price
        asset.net_value = latest_price * asset.net_quantity_shares
        asset.average_cost_basis = asset.total_cost / asset.net_quantity_shares
        asset.unrealised_gain_loss = asset.net_value - asset.total_cost

        if asset.total_cost > 0:
            asset.unrealised_gain_loss_pct = (
                (asset.unrealised_gain_loss / asset.total_cost)
            )

    return holdings
