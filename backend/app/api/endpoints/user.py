import os

import requests
from app import crud, schemas
from app.config.settings import settings
from app.database import get_db
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

load_dotenv()

router = APIRouter(prefix="/user", tags=["user"])

AUTH0_DOMAIN = settings.AUTH0_DOMAIN
AUTH0_CLIENT_ID = settings.AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET = settings.AUTH0_CLIENT_SECRET
AUTH0_AUDIENCE = settings.AUTH0_AUDIENCE
APPROVED_EMAILS = set(os.getenv("APPROVED_EMAILS", "").split(","))


def get_management_token():
    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    payload = {
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "audience": AUTH0_AUDIENCE,
        "grant_type": "client_credentials",
    }

    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json=payload,
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Auth0 management token: {response.text}",
        )
    return response.json()["access_token"]


@router.post("/create_or_get/{user_id}", response_model=schemas.User)
def create_or_get_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    mgmt_token = get_management_token()
    user_response = requests.get(
        f"https://{AUTH0_DOMAIN}/api/v2/users/{user_id}",
        headers={"Authorization": f"Bearer {mgmt_token}"},
    )

    if user_response.status_code != 200:
        raise HTTPException(status_code=404, detail="User not found in Auth0")

    user_data = user_response.json()
    email = user_data.get("email")

    if not user_data.get("email"):
        raise HTTPException(status_code=403, detail="User is not active")

    if user_data.get("email") not in APPROVED_EMAILS:
        raise HTTPException(status_code=403, detail="User not allowed access")

    db_user = crud.get_user_by_id(db, user_id=user_id)
    if db_user:
        return db_user
    return crud.create_user(
        db,
        user_id=user_id,
        email=email,
    )


@router.get("/get_by_email/{email}", response_model=schemas.User)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = crud.user.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
