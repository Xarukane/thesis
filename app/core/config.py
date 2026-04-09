from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Marketplace API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # We will use SQLite for quick local development.
    # To switch to Postgres later, you just change this string.
    DATABASE_URL: str = "sqlite:///./marketplace.db"

    # JWT Settings (We will use these when we build Authentication)
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True


settings = Settings()
