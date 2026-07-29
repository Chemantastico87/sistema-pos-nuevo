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
        "sqlite+aiosqlite:///./pos_saas.db" if not os.getenv("POSTGRES_DB") else "postgresql+asyncpg://pos_user:pos_password_secure@localhost:5432/pos_saas_db"
    )
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
