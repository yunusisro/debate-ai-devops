# backend/config.py
from pydantic_settings import BaseSettings
from pathlib import Path
import os

# Get the backend directory
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    APP_NAME: str = "Debate Assistant AI"
    DEBUG: bool = True

    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "debate_assistant"

    GEMINI_API_KEY: str = ""

    JWT_SECRET_KEY: str = "your-secret-key-change-this"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = str(ENV_FILE) if ENV_FILE.exists() else None
        env_file_encoding = 'utf-8'
        case_sensitive = True

settings = Settings()

# Debug: Print settings (mask password)
print("=" * 60)
print("🔧 Configuration loaded:")
print(f"   MONGODB_URL: {settings.MONGODB_URL[:30]}..." if len(settings.MONGODB_URL) > 30 else f"   MONGODB_URL: {settings.MONGODB_URL}")
print(f"   DATABASE_NAME: {settings.DATABASE_NAME}")
print(f"   .env file exists: {ENV_FILE.exists()}")
print("=" * 60)
