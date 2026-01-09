from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
class Settings(BaseSettings):
    """
    Application configuration settings.
    Inherits from pydantic BaseSettings to automatically load from env vars.
    """
    # Server Config
    PORT: int = os.getenv("PORT", 8001)
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    # API Keys & Secrets
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    API_SECRET: str = os.getenv("API_SECRET", "default_secret_change_me")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
