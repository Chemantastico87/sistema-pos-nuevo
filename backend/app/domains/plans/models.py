from sqlalchemy import Column, String, Text, Numeric, Integer, Boolean
from app.core.database import Base

class PlanModel(Base):
    __tablename__ = "plans"

    id = Column(String(36), primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    short_description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    monthly_price = Column(Numeric(12, 2), default=0.00)
    annual_price = Column(Numeric(12, 2), default=0.00)
    trial_days = Column(Integer, default=14)
    color = Column(String(20), default='#6366f1')
    icon = Column(String(50), default='Sparkles')
    sort_order = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    
    # Cuotas y Límites configurables
    max_users = Column(Integer, default=1)
    max_products = Column(Integer, default=500)
    max_customers = Column(Integer, default=500)
    max_warehouses = Column(Integer, default=1)
    max_cash_registers = Column(Integer, default=1)
    has_printers = Column(Boolean, default=True)
    storage_mb = Column(Integer, default=500)
    has_api = Column(Boolean, default=False)
    has_ai = Column(Boolean, default=False)
    has_ocr = Column(Boolean, default=False)
    has_marketplace = Column(Boolean, default=False)
    has_plugins = Column(Boolean, default=False)
    has_priority_support = Column(Boolean, default=False)
