import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from sqlalchemy import Column, String, Text, Numeric, Integer, Boolean, DateTime

from app.core.database import Base, get_db

class CouponModel(Base):
    __tablename__ = "coupons"

    id = Column(String(36), primary_key=True)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    discount_percent = Column(Numeric(5, 2), default=0.00)
    discount_amount = Column(Numeric(12, 2), default=0.00)
    discount_type = Column(String(20), default="percent") # percent, fixed
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    max_uses = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

router = APIRouter(prefix="/coupons", tags=["Coupons"])

class CouponValidateRequest(BaseModel):
    code: str

class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_percent: float
    discount_amount: float
    discount_type: str
    message: str

DEFAULT_COUPONS = [
    {
        "id": "coup_welcome50",
        "code": "WELCOME50",
        "description": "50% de descuento en el primer mes de suscripción VENDIX",
        "discount_percent": 50.00,
        "discount_amount": 0.00,
        "discount_type": "percent",
        "max_uses": 500,
        "used_count": 12,
        "is_active": True
    },
    {
        "id": "coup_primermes",
        "code": "PRIMERMES",
        "description": "20€ de descuento directo en cualquier plan anual",
        "discount_percent": 0.00,
        "discount_amount": 20.00,
        "discount_type": "fixed",
        "max_uses": 200,
        "used_count": 8,
        "is_active": True
    },
    {
        "id": "coup_blackfriday",
        "code": "BLACKFRIDAY",
        "description": "Descuento especial de temporada",
        "discount_percent": 30.00,
        "discount_amount": 0.00,
        "discount_type": "percent",
        "max_uses": 1000,
        "used_count": 0,
        "is_active": True
    }
]

@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(data: CouponValidateRequest, db: AsyncSession = Depends(get_db)):
    code_upper = data.code.strip().upper()
    res = await db.execute(select(CouponModel).where(CouponModel.code == code_upper))
    coupon = res.scalars().first()

    if not coupon:
        # Si la BD está limpia, verificar cupones por defecto
        match = next((c for c in DEFAULT_COUPONS if c["code"] == code_upper), None)
        if match:
            return CouponValidateResponse(
                valid=True,
                code=match["code"],
                discount_percent=float(match["discount_percent"]),
                discount_amount=float(match["discount_amount"]),
                discount_type=match["discount_type"],
                message=f"¡Cupón {match['code']} aplicado correctamente!"
            )
        raise HTTPException(status_code=404, detail="El código de cupón no existe o no es válido.")

    if not coupon.is_active or (coupon.used_count >= coupon.max_uses):
        raise HTTPException(status_code=400, detail="Este cupón ha caducado o ha alcanzado su límite de usos.")

    return CouponValidateResponse(
        valid=True,
        code=coupon.code,
        discount_percent=float(coupon.discount_percent),
        discount_amount=float(coupon.discount_amount),
        discount_type=coupon.discount_type,
        message=f"¡Cupón {coupon.code} aplicado con éxito!"
    )
