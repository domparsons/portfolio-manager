from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "My Project"
    PROJECT_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./test.db"
    API_V1_STR: str = "/api/v1"

    class Config:
        env_file = ".env"


settings = Settings()
