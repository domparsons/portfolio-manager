import sys
from datetime import datetime, timezone
from pathlib import Path

import yfinance as yf
from app.database import SessionLocal
from app.models import Asset

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

new_tickers = [
    "AAPL",
    "GOOGL",
    "MSFT",
    "AMZN",
    "TSLA",
    "META",
    "NFLX",
    "NVDA",
    "SPY",
    "INTC",
    "AMGN",
    "BABA",
    "BA",
    "DIS",
    "T",
    "GS",
    "V",
    "JNJ",
    "WMT",
    "PG",
    "VZ",
]


def get_asset_info(ticker):
    asset = yf.Ticker(ticker)
    asset_info = asset.info

    asset_name = asset_info.get("longName", "Unknown")
    ticker_symbol = asset_info.get("symbol", ticker)
    asset_type = "stock"
    currency = asset_info.get("currency", "USD")
    sector = asset_info.get("sector", "Unknown")
    country = asset_info.get("country", "Unknown")
    market_cap = asset_info.get("marketCap", None)
    asset_class = "Equity"
    description = asset_info.get("longBusinessSummary", "No description available.")

    if isinstance(market_cap, str):
        if market_cap.endswith("B"):
            market_cap = int(float(market_cap[:-1]) * 1_000_000_000)
        elif market_cap.endswith("M"):
            market_cap = int(float(market_cap[:-1]) * 1_000_000)
        else:
            market_cap = None

    return {
        "asset_name": asset_name,
        "ticker": ticker_symbol,
        "asset_type": asset_type,
        "currency": currency,
        "sector": sector,
        "country": country,
        "market_cap": market_cap,
        "asset_class": asset_class,
        "description": description,
    }


def main():
    db = SessionLocal()

    try:
        for ticker in new_tickers:
            print(f"Processing {ticker}...")
            asset_info = get_asset_info(ticker)

            existing_asset = db.query(Asset).filter(Asset.ticker == ticker).first()

            if existing_asset:
                existing_asset.market_cap = asset_info["market_cap"]
                existing_asset.last_updated = datetime.now(timezone.utc)
                db.commit()
                print(f"✓ Updated {ticker}")
            else:
                new_asset = Asset(
                    asset_name=asset_info["asset_name"],
                    ticker=asset_info["ticker"],
                    asset_type=asset_info["asset_type"],
                    currency=asset_info["currency"],
                    sector=asset_info["sector"],
                    country=asset_info["country"],
                    market_cap=asset_info["market_cap"],
                    asset_class=asset_info["asset_class"],
                    description=asset_info["description"],
                    last_updated=datetime.now(timezone.utc),
                )
                db.add(new_asset)
                db.commit()
                print(f"✓ Added {ticker}")

        print("\n✅ Asset list update completed!")
        return 0
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
