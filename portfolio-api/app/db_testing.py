from app.database import SessionLocal
from app.models.user import User
from app.models.watchlist import Watchlist

# Create a new session
db = SessionLocal()

# Create a new user
new_user = User(
    username="John Doe", email="johndoe@example.com", password="yourpassword"
)

# Add the user to the session
db.add(new_user)

# Commit the transaction to the database
db.commit()

# Refresh the instance to get the ID assigned by the database
db.refresh(new_user)

print(f"User {new_user.username} added with ID {new_user.id}")

# Create a watchlist for the user (optional)
watchlist = Watchlist(user_id=new_user.id, name="Tech Stocks")
db.add(watchlist)

# Add items to the watchlist (Apple, Tesla, Nvidia)
watchlist_items = [
    {"symbol": "AAPL", "name": "Apple"},
    {"symbol": "TSLA", "name": "Tesla"},
    {"symbol": "NVDA", "name": "Nvidia"},
]

# Add stocks to the watchlist
for item in watchlist_items:
    db.add(WatchlistItem(watchlist_id=watchlist.id, **item))

# Commit the changes
db.commit()

# Close the session
db.close()

print(f"Watchlist for {new_user.username} created with {len(watchlist_items)} items.")
