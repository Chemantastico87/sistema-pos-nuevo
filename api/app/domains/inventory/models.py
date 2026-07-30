from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class InventoryMovementModel(Base):
    __tablename__ = "inventory_movements"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"))
    movement_type = Column(String(50), nullable=False) # Entrada, Salida, Ajuste, Venta, Devolución, Transferencia, Reserva
    quantity = Column(Numeric(12, 3), nullable=False)
    stock_before = Column(Numeric(12, 3), nullable=False)
    stock_after = Column(Numeric(12, 3), nullable=False)
    reason = Column(Text)
    notes = Column(Text)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=func.now())
