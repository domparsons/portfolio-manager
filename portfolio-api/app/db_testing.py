from app.database import SessionLocal
from app.models.user import User
from app.models.watchlistitem import WatchlistItem

# Create a new session
db = SessionLocal()

# Create a new user
user = User(username="JohnDoe", email="johndoe@example.com")
user.set_password("password123")  # Set password

# Add the user to the session
db.add(user)
db.commit()

# Create a new watchlist for the user
watchlist = WatchlistItem(symbol="AAPL", user_id=user.id)

# Add the watchlist to the session
db.add(watchlist)
db.commit()

print(f"User {user.username} created with watchlist {watchlist.symbol}")

# Close the session
db.close()
