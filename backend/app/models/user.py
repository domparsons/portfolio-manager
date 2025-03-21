from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from passlib.context import CryptContext
from sqlalchemy.orm import relationship


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to WatchlistItem (a user can have multiple stock symbols in their watchlist)
    watchlists = relationship("WatchlistItem", back_populates="owner")

    def set_password(self, password: str):
        self.password = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
