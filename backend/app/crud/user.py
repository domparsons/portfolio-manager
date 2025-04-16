from sqlalchemy.orm import Session
from app.models.user import User


def create_user(db: Session, user_id: str, email: str) -> User:
    db_user = User(id=user_id, email=email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[type[User]]:
    return db.query(User).offset(skip).limit(limit).all()
