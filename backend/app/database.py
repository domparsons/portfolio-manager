from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config.settings import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # Keep up to 5 connections open and ready — avoids the cost of
    # establishing a new TCP connection to the remote DB on every request.
    pool_size=5,
    # Allow up to 10 extra connections under burst load before blocking.
    max_overflow=10,
    # If no connection is available within 30 s, raise instead of hanging.
    pool_timeout=30,
    # Recycle connections after 30 minutes to prevent stale/dropped connections
    # from the DB side (common with managed Postgres services like Railway/Supabase).
    pool_recycle=1800,
    # Emit a lightweight SELECT 1 before handing a connection to the app,
    # so stale connections are silently replaced rather than causing 500 errors.
    pool_pre_ping=True,
)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
