# app/api/api_v1/endpoints/personal_best.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import personal_best as crud_personal_best
from app.schemas.personal_best import PersonalBest, PersonalBestCreate, PersonalBestUpdate
from app.dependencies import get_db

router = APIRouter()


@router.post("/", response_model=PersonalBest)
def create_personal_best(personal_best: PersonalBestCreate, db: Session = Depends(get_db)):
    return crud_personal_best.create_personal_best(db=db, personal_best=personal_best)


@router.get("/{personal_best_id}", response_model=PersonalBest)
def read_personal_best(personal_best_id: int, db: Session = Depends(get_db)):
    db_personal_best = crud_personal_best.get_personal_best(db=db, personal_best_id=personal_best_id)
    if db_personal_best is None:
        raise HTTPException(status_code=404, detail="Personal best not found")
    return db_personal_best


@router.get("/", response_model=list[PersonalBest])
def read_personal_bests(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud_personal_best.get_personal_bests(db=db, skip=skip, limit=limit)


@router.put("/{personal_best_id}", response_model=PersonalBest)
def update_personal_best(personal_best_id: int, update_data: PersonalBestUpdate, db: Session = Depends(get_db)):
    return crud_personal_best.update_personal_best(db=db, personal_best_id=personal_best_id, update_data=update_data)


@router.delete("/{personal_best_id}", response_model=PersonalBest)
def delete_personal_best(personal_best_id: int, db: Session = Depends(get_db)):
    return crud_personal_best.delete_personal_best(db=db, personal_best_id=personal_best_id)
