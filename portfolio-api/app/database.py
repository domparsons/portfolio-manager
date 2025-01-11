from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define the SQLite database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///../portfolio.db"

# Create the engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a base class for your models
Base = declarative_base()

# Create a sessionmaker to interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
