from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class CashRegisterModel(Base):
    __tablename__ = "cash_registers"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), default="Caja Principal")
    status = Column(String(20), nullable=False, default="closed")
    opening_balance = Column(Numeric(12, 2), nullable=False, default=0.00)
    closing_balance = Column(Numeric(12, 2))
    expected_balance = Column(Numeric(12, 2))
    difference = Column(Numeric(12, 2))

class CashMovementModel(Base):
    __tablename__ = "cash_movements"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    cash_register_id = Column(String(36), ForeignKey("cash_registers.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    reason = Column(String)
