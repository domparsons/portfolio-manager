from datetime import date
from app import schemas


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
        list of dicts with date, value, and daily_return
    """
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
            schemas.PortfolioValueHistory(
                date=day,
                value=round(total_value, 2),
                daily_return=0.0,
            )
        )

    if results:
        results[0].daily_return = 0.0

    for i in range(1, len(results)):
        prev_value = results[i - 1].value
        curr_value = results[i].value

        if prev_value > 0:
            results[i].daily_return = round((curr_value - prev_value) / prev_value, 6)
        else:
            results[i].daily_return = 0.0

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
