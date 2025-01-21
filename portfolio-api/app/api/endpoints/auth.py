from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, security
from app.crud import user as user_crud
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token")
def login_for_access_token(
    form_data: schemas.UserCreate, db: Session = Depends(get_db)
):
    user = user_crud.get_user_by_username(db, username=form_data.username)
    if user is None or not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )
    access_token = security.create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}
