from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
import os
class Settings(BaseSettings):
    """
    Application configuration settings.
    Inherits from pydantic BaseSettings to automatically load from env vars.
    """
    # Server Config
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"

    # API Keys & Secrets
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    MONGODB_URI: str = os.getenv("MONGODB_URI")
    DB_NAME: str = os.getenv("DB_NAME")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
