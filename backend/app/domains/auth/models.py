from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class CompanyModel(Base):
    __tablename__ = "companies"
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    tax_id = Column(String(50))
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50))
    address = Column(String)

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
