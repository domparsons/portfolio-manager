# app/test.py

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.watchlist import Watchlist

# Create a new session
db = SessionLocal()

# Check if the tables exist
users = db.query(User).all()
watchlists = db.query(Watchlist).all()

print("Users:", users)
print("Watchlists:", watchlists)
