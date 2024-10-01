from sqlalchemy import Column, Integer, Float, String
from app.database import Base


class PersonalBest(Base):
    __tablename__ = "personal_bests"

    id = Column(Integer, primary_key=True, index=True)
    time = Column(Float, nullable=False)  # Total time in minutes
    distance = Column(Float, nullable=False)  # Distance covered (e.g., in km or miles)
    pace = Column(Float, nullable=False)  # Pace in min/km or min/mile
    description = Column(String, nullable=True)  # Optional description (e.g., "5k run")
