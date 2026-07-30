from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Integer, Numeric, Text
from sqlalchemy.sql import func
from app.core.database import Base

class CompanyModel(Base):
    __tablename__ = "companies"
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    tax_id = Column(String(50))
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50))
    address = Column(Text)
    country = Column(String(100), default="España")
    currency = Column(String(10), default="EUR")
    timezone = Column(String(50), default="Europe/Madrid")
    logo_url = Column(Text)
    default_vat_rate = Column(Numeric(5, 2), default=21.00)
    onboarding_completed = Column(Boolean, default=False)
    plan = Column(String(50), default="Starter")
    subscription_status = Column(String(20), default="trial")
    subscription_expires_at = Column(DateTime)
    max_users = Column(Integer, default=5)
    max_products = Column(Integer, default=500)
    storage_mb_limit = Column(Integer, default=1000)

class UserModel(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    email = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="cashier")
    is_active = Column(Boolean, default=True)
    permissions = Column(JSON, default=list)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    email_verified = Column(Boolean, default=True)
    verification_token = Column(String(255))
    reset_password_token = Column(String(255))

class RefreshTokenModel(Base):
    __tablename__ = "refresh_tokens"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token = Column(Text, nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
