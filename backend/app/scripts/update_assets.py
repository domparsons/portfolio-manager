import yfinance as yf
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models import Asset

db = SessionLocal()

tickers = [asset.ticker for asset in db.query(Asset).all()]
tickers = [ticker for ticker in tickers if "." not in ticker]

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


for ticker in tickers:
    asset_info = get_asset_info(ticker)

    existing_asset = db.query(Asset).filter(Asset.ticker == ticker).first()

    if existing_asset:
        existing_asset.market_cap = asset_info["market_cap"]
        existing_asset.last_updated = datetime.now(timezone.utc)
        db.commit()
        print(f"Updated {ticker} with new market cap and last updated timestamp.")
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
            last_updated=datetime.utcnow(),
        )
        db.add(new_asset)
        db.commit()
        print(f"Added new asset: {ticker}")

db.close()

print("Asset list update completed!")
