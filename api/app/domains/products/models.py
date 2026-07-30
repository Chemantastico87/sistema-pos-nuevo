from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey, DateTime, Text
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
    reference = Column(String(100))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    image_url = Column(Text)
    supplier = Column(String(255))
    brand = Column(String(255))
    price = Column(Numeric(12, 2), nullable=False, default=0.00)
    cost_price = Column(Numeric(12, 2), nullable=False, default=0.00)
    vat_rate = Column(Numeric(5, 2), default=21.00)
    margin = Column(Numeric(8, 2), default=0.00)
    profit = Column(Numeric(12, 2), default=0.00)
    stock = Column(Numeric(12, 3), nullable=False, default=0.000)
    min_stock = Column(Numeric(12, 3), nullable=False, default=0.000)
    max_stock = Column(Numeric(12, 3), nullable=False, default=1000.000)
    unit = Column(String(20), default="unit")
    location = Column(String(100))
    lot_number = Column(String(100))
    expiration_date = Column(String(20))
    is_active = Column(Boolean, default=True)
    weighted_avg_cost = Column(Numeric(12, 2), default=0.00)
    last_cost = Column(Numeric(12, 2), default=0.00)
    last_purchase_at = Column(DateTime)
    last_sale_at = Column(DateTime)
