from app.models.asset import Asset
from sqlalchemy.orm import Session

def get_all_assets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Asset).offset(skip).limit(limit).all()
    