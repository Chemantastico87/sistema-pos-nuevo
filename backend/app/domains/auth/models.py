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
    created_at = Column(DateTime, server_default=func.now())

class UserModel(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    email = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="cashier")
    status = Column(String(30), nullable=False, default="pending_email") # pending_email, active, blocked, suspended, deleted
    is_active = Column(Boolean, default=True)
    permissions = Column(JSON, default=list)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    reset_password_token = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    last_login_at = Column(DateTime, nullable=True)

class RefreshTokenModel(Base):
    __tablename__ = "refresh_tokens"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token = Column(Text, nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class UserSessionModel(Base):
    __tablename__ = "user_sessions"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    refresh_token_hash = Column(String(255), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    os_name = Column(String(50), nullable=True)
    device_type = Column(String(50), nullable=True)
    location = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    last_activity = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

class AuditLogModel(Base):
    __tablename__ = "security_audit_logs"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), nullable=True)
    user_id = Column(String(36), nullable=True)
    event_type = Column(String(50), nullable=False) # register, login_success, login_failed, logout, password_reset, account_locked
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    details = Column(JSON, nullable=True)
