import os

import requests
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
ALGORITHMS = ["RS256"]

bearer_scheme = HTTPBearer()

JWKS = requests.get(f"{AUTH0_DOMAIN}/.well-known/jwks.json").json()["keys"]


def get_rsa_key(kid: str):
    for key in JWKS:
        if key["kid"] == kid:
            return {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
    return None


def get_current_user_id(
    token: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    try:
        unverified_header = jwt.get_unverified_header(token.credentials)
        rsa_key = get_rsa_key(unverified_header["kid"])

        if rsa_key is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        payload = jwt.decode(
            token.credentials,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer=AUTH0_DOMAIN + "/",
        )
        return payload["sub"]
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
