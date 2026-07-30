from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class SaleModel(Base):
    __tablename__ = "sales"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    invoice_number = Column(String(100), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"))
    cash_register_id = Column(String(36), ForeignKey("cash_registers.id"))
    subtotal = Column(Numeric(12, 2), nullable=False)
    discount = Column(Numeric(12, 2), default=0.00)
    tax = Column(Numeric(12, 2), default=0.00)
    total = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(50), nullable=False, default="cash") # cash, card, bizum, transfer, voucher, mixed
    status = Column(String(20), default="completed")
    notes = Column(Text)
    change_given = Column(Numeric(12, 2), default=0.00)
    created_at = Column(DateTime, default=func.now())

class SaleItemModel(Base):
    __tablename__ = "sale_items"
    id = Column(String(36), primary_key=True)
    sale_id = Column(String(36), ForeignKey("sales.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Numeric(12, 3), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)
