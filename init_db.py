from app.config.database import Base, engine
from app.models.watchlist import Watchlist

# Create all tables
print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created!")