import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    AUTH0_DOMAIN: str = os.getenv("AUTH0_DOMAIN", "dev-aej4rxcs3274i7ss.us.auth0.com")
    AUTH0_CLIENT_ID: str = os.getenv("AUTH0_CLIENT_ID")
    AUTH0_CLIENT_SECRET: str = os.getenv("AUTH0_CLIENT_SECRET")
    AUTH0_AUDIENCE: str = f"https://{AUTH0_DOMAIN}/api/v2/"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
