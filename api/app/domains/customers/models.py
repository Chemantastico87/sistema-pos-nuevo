from sqlalchemy import Column, String, Integer, ForeignKey
from app.core.database import Base

class CustomerModel(Base):
    __tablename__ = "customers"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    tax_id = Column(String(50))
    email = Column(String(255))
    phone = Column(String(50))
    points = Column(Integer, default=0)
