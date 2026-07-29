from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class CategoryModel(Base):
    __tablename__ = "categories"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)

class ProductModel(Base):
    __tablename__ = "products"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"))
    barcode = Column(String(100))
    sku = Column(String(100))
    name = Column(String(255), nullable=False)
    description = Column(String)
    price = Column(Numeric(12, 2), nullable=False, default=0.00)
    cost_price = Column(Numeric(12, 2), nullable=False, default=0.00)
    stock = Column(Numeric(12, 3), nullable=False, default=0.000)
    min_stock = Column(Numeric(12, 3), nullable=False, default=0.000)
    unit = Column(String(20), default="unit")
    is_active = Column(Boolean, default=True)
