from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

#
# class User(Base):
#     __tablename__ = 'users'
#
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     username = Column(String, unique=True, nullable=False)
#     email = Column(String, unique=True, nullable=False)
#     password = Column(String, nullable=False)
#
#     # One-to-Many relationship with Watchlists
#     watchlists = relationship('Dashboard', back_populates='user')
#
#     def __repr__(self):
#         return f"<User(username={self.username}, email={self.email})>"
