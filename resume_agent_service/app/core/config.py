from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    """
    Application configuration settings.
    Inherits from pydantic BaseSettings to automatically load from env vars.
    """
    # Server Config
    PORT: int = 8005
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"

    # API Keys & Secrets
    GROQ_API_KEY: Optional[str] = None
    API_SECRET: str = "default_secret_change_me"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
