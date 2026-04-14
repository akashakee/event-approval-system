from functools import lru_cache

from pydantic import field_validator

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Event Approval System API"
    app_env: str = "development"
    secret_key: str = "change-this-secret-in-production"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./event_approval.db"
    jwt_algorithm: str = "HS256"
    cors_origins: list[str] = ["http://127.0.0.1:5173", "http://localhost:5173"]

    # Optional production settings
    sentry_dsn: str | None = None
    sendgrid_api_key: str | None = None
    sendgrid_from_email: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        app_env = info.data.get("app_env", "development")
        if app_env == "production" and v == "change-this-secret-in-production":
            raise ValueError("SECRET_KEY must be changed for production")
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

