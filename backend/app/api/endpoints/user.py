import os

import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app import crud, schemas
from app.database import get_db


load_dotenv()

router = APIRouter(prefix="/user", tags=["user"])

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "https://dev-aej4rxcs3274i7ss.us.auth0.com")
AUTH0_MGMT_API_CLIENT_ID = os.getenv("AUTH0_MGMT_API_CLIENT_ID")
AUTH0_MGMT_API_CLIENT_SECRET = os.getenv("AUTH0_MGMT_API_CLIENT_SECRET")
AUTH0_AUDIENCE = f"{AUTH0_DOMAIN}/api/v2/"


def get_management_token():
    response = requests.post(
        f"{AUTH0_DOMAIN}/oauth/token",
        headers={"Content-Type": "application/json"},
        json={
            "client_id": AUTH0_MGMT_API_CLIENT_ID,
            "client_secret": AUTH0_MGMT_API_CLIENT_SECRET,
            "audience": AUTH0_AUDIENCE,
            "grant_type": "client_credentials",
        },
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=500, detail="Failed to get Auth0 management token"
        )
    return response.json()["access_token"]


@router.post("/sync/{user_id}", response_model=schemas.User)
def sync_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    mgmt_token = get_management_token()
    user_response = requests.get(
        f"{AUTH0_DOMAIN}/api/v2/users/{user_id}",
        headers={"Authorization": f"Bearer {mgmt_token}"},
    )

    if user_response.status_code != 200:
        raise HTTPException(status_code=404, detail="User not found in Auth0")

    user_data = user_response.json()
    email = user_data.get("email")

    if not user_data.get("email"):
        raise HTTPException(status_code=403, detail="User is not active")

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
