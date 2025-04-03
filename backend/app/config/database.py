from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Retrieve the database URL from environment variables (or default to SQLite if not set)
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://domparsons:DevPassword123!@localhost/portfolio"
)

# Create the database engine to connect to PostgreSQL
engine = create_engine(
    DATABASE_URL, echo=True
)  # echo=True for logging SQL queries, set to False for production

# Create a base class for declarative models
Base = declarative_base()

# SessionLocal is used to create a new session for each request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
