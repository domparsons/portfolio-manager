import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config.settings import settings
from app.core.auth.config import auth0_config
from app.core.auth.jwt_validator import JWTValidator

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Validates JWT from Authorization header
    Returns: user_id (subclaim)
    Raises: HTTPException(401) if invalid
    """
    try:
        token = credentials.credentials
        validator = JWTValidator(auth0_config)
        payload = validator.validate_token(token)

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing sub claim",
            )

        return user_id

    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}"
        )


async def require_admin(current_user: str = Depends(get_current_user)) -> str:
    """
    Checks if user has admin privileges
    Returns: user_id
    Raises: HTTPException(403) if not admin
    """
    if current_user not in settings.ADMIN_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    return current_user
