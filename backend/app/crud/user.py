from app.models import User
from app.models.user import User
from sqlalchemy.orm import Session


def create_user(db: Session, user_id: str) -> User:
    db_user = User(id=user_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[type[User]]:
    return db.query(User).offset(skip).limit(limit).all()


def update_name(user_id: str, name: str, db: Session) -> User | None:
    db.query(User).filter(User.id == user_id).update({"name": name})
    db.commit()
    return db.query(User).filter(User.id == user_id).first()
