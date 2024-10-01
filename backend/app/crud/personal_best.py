# app/crud/personal_best.py
from sqlalchemy.orm import Session
from app.models.personal_best import PersonalBest
from app.schemas.personal_best import PersonalBestCreate, PersonalBestUpdate


def create_personal_best(db: Session, personal_best: PersonalBestCreate):
    db_personal_best = PersonalBest(**personal_best.dict())
    db.add(db_personal_best)
    db.commit()
    db.refresh(db_personal_best)
    return db_personal_best


def get_personal_best(db: Session, personal_best_id: int):
    return db.query(PersonalBest).filter(PersonalBest.id == personal_best_id).first()


def get_personal_bests(db: Session, skip: int = 0, limit: int = 10):
    return db.query(PersonalBest).offset(skip).limit(limit).all()


def update_personal_best(db: Session, personal_best_id: int, update_data: PersonalBestUpdate):
    personal_best = db.query(PersonalBest).filter(PersonalBest.id == personal_best_id).first()
    if not personal_best:
        return None
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(personal_best, field, value)
    db.commit()
    db.refresh(personal_best)
    return personal_best


def delete_personal_best(db: Session, personal_best_id: int):
    personal_best = db.query(PersonalBest).filter(PersonalBest.id == personal_best_id).first()
    if personal_best:
        db.delete(personal_best)
        db.commit()
    return personal_best
