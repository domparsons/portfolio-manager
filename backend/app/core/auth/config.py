import os

from pydantic_settings import BaseSettings


class Auth0Config(BaseSettings):
    domain: str = os.getenv("AUTH0_DOMAIN", "dev-aej4rxcs3274i7ss.us.auth0.com")
    api_audience: str = os.getenv("AUTH0_API_AUDIENCE", "http://localhost:8000")
    algorithms: set[str] = ["RS256"]

    class Config:
        env_prefix = "AUTH0_"


auth0_config = Auth0Config()
