from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas
from app import crud
from app.database import get_db

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/", response_model=schemas.User)
def create_user(user_id: str, email: str, db: Session = Depends(get_db)):
    user_exists = crud.user.get_user_by_email(db, email=email)
    if user_exists:
        raise HTTPException(status_code=400, detail="This email is already registered.")
    db_user = crud.create_user(db=db, user_id=user_id, email=email)
    return db_user


@router.get("/get_by_email/{email}", response_model=schemas.User)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = crud.user.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/get_by_id/{id}", response_model=schemas.User)
def get_user_by_id(id: str, db: Session = Depends(get_db)):
    user = crud.user.get_user_by_id(db, id=id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
