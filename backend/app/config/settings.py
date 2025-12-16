import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    DATABASE_URL: str = os.getenv("DATABASE_URL")
    AUTH0_DOMAIN: str = os.getenv("AUTH0_DOMAIN", "dev-aej4rxcs3274i7ss.us.auth0.com")
    AUTH0_CLIENT_ID: str = os.getenv("AUTH0_CLIENT_ID", "")
    ADMIN_CLIENT_ID: str = os.getenv("ADMIN_CLIENT_ID", "")
    AUTH0_CLIENT_SECRET: str = os.getenv("AUTH0_CLIENT_SECRET", "")
    OPEN_AI_API_KEY: str = os.getenv("OPEN_AI_API_KEY", "")
    AUTH0_AUDIENCE: str = f"https://{AUTH0_DOMAIN}/api/v2/"


settings = Settings()
