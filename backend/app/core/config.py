import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sistema POS SaaS Multi-Tenant"
    VERSION: str = "5.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_jwt_key_commercial_pos_saas_v5")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Horas
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        os.getenv("POSTGRES_URL", "sqlite+aiosqlite:///:memory:" if os.getenv("VERCEL") else "sqlite+aiosqlite:///./pos_saas.db")
    )
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production" if os.getenv("VERCEL") else "development")

settings = Settings()
