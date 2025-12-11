import os

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.config.settings import settings
from app.database import get_db
from app.logger import logger

load_dotenv()

router = APIRouter(prefix="/user", tags=["user"])

AUTH0_DOMAIN = settings.AUTH0_DOMAIN
AUTH0_CLIENT_ID = settings.AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET = settings.AUTH0_CLIENT_SECRET
AUTH0_AUDIENCE = settings.AUTH0_AUDIENCE
APPROVED_EMAILS = set(os.getenv("APPROVED_EMAILS", "").split(","))


def get_management_token():
    logger.info("Fetching Auth0 management token")
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
        logger.error(f"Failed to get Auth0 management token: {response.text}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Auth0 management token: {response.text}",
        )

    logger.info("Fetched Auth0 management token")
    return response.json()["access_token"]


@router.post("/create_or_get/{user_id}", response_model=schemas.User)
def create_or_get_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    logger.info(f"Checking user {user_id[-8:]} exists")
    mgmt_token = get_management_token()
    user_response = requests.get(
        f"https://{AUTH0_DOMAIN}/api/v2/users/{user_id}",
        headers={"Authorization": f"Bearer {mgmt_token}"},
    )

    if user_response.status_code != 200:
        logger.error(f"User {user_id[-8:]} not found in Auth0")
        raise HTTPException(status_code=404, detail="User not found in Auth0")

    user_data = user_response.json()
    email = user_data.get("email")

    if not user_data.get("email"):
        logger.error(f"User {user_id[-8:]} is not active")
        raise HTTPException(status_code=403, detail="User is not active")

    if user_data.get("email") not in APPROVED_EMAILS:
        logger.error(f"User {user_id[-8:]} access denied")
        raise HTTPException(status_code=403, detail="User access denied")

    db_user = crud.get_user_by_id(db, user_id=user_id)

    if db_user:
        logger.info(
            f"User {user_id[-8:]} already exists. Returning existing user information."
        )
        return db_user

    logger.info(f"User does not yet exist. Creating new user with id {user_id[-8:]}.")
    new_user = crud.create_user(
        db,
        user_id=user_id,
        email=email,
    )
    logger.info(f"New user created with id {user_id[-8:]}")
    return new_user


@router.get("/get_by_email/{email}", response_model=schemas.User)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = crud.user.get_user_by_email(db, email=email)
    if user is None:
        logger.error("User not found")
        raise HTTPException(status_code=404, detail="User not found")
    logger.info(f"Found user {user.id[-8:]} with email {email}")
    return user
