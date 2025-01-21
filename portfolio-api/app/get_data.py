import yfinance as yf

wti = yf.Ticker("AAPL")
wti_data = wti.history(period="3mo", interval="60m")
print(wti_data.head())
