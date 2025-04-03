from sqlalchemy import Column, String, DateTime
from app.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    # Using String for Auth0's user ID, which is a string (e.g., UUID or auth0|<random_string>)
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)

    # Use UTC time for the created_at column with a proper default
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationship to WatchlistItem (a user can have multiple stock symbols in their watchlist)
    watchlists = relationship("WatchlistItem", back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, created_at={self.created_at})>"
