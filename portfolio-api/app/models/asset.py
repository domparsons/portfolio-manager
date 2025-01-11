from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

#
# class Asset(Base):
#     __tablename__ = 'asset'
#
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     symbol = Column(String, nullable=False)
#     watchlist_id = Column(Integer, ForeignKey('watchlist.id'))
#
#     watchlist = relationship('Dashboard', back_populates='assets')
