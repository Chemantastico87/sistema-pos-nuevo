import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.core.database import get_db
from app.domains.plans.models import PlanModel

router = APIRouter(prefix="/plans", tags=["Plans"])

class PlanSchema(BaseModel):
    id: str
    name: str
    slug: str
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    monthly_price: float
    annual_price: float
    trial_days: int
    color: str
    icon: str
    sort_order: int
    is_active: bool
    max_users: int
    max_products: int
    max_customers: int
    max_warehouses: int
    max_cash_registers: int
    has_printers: bool
    storage_mb: int
    has_api: bool
    has_ai: bool
    has_ocr: bool
    has_marketplace: bool
    has_plugins: bool
    has_priority_support: bool

    class Config:
        from_attributes = True

class PlanCreateUpdate(BaseModel):
    name: str
    slug: str
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    monthly_price: float = 0.00
    annual_price: float = 0.00
    trial_days: int = 14
    color: str = "#6366f1"
    icon: str = "Sparkles"
    sort_order: int = 1
    is_active: bool = True
    max_users: int = 1
    max_products: int = 500
    max_customers: int = 500
    max_warehouses: int = 1
    max_cash_registers: int = 1
    has_printers: bool = True
    storage_mb: int = 500
    has_api: bool = False
    has_ai: bool = False
    has_ocr: bool = False
    has_marketplace: bool = False
    has_plugins: bool = False
    has_priority_support: bool = False

DEFAULT_PLANS = [
    {
        "id": "plan_starter",
        "name": "Starter",
        "slug": "starter",
        "short_description": "Ideal para pequeños negocios que empiezan.",
        "full_description": "Incluye 1 usuario, 500 productos, 500 clientes y 1 caja registradora TPV.",
        "monthly_price": 19.00,
        "annual_price": 190.00,
        "trial_days": 14,
        "color": "#6366f1",
        "icon": "Zap",
        "sort_order": 1,
        "is_active": True,
        "max_users": 1,
        "max_products": 500,
        "max_customers": 500,
        "max_warehouses": 1,
        "max_cash_registers": 1,
        "has_printers": True,
        "storage_mb": 500,
        "has_api": False,
        "has_ai": False,
        "has_ocr": False,
        "has_marketplace": False,
        "has_plugins": False,
        "has_priority_support": False
    },
    {
        "id": "plan_professional",
        "name": "Professional",
        "slug": "professional",
        "short_description": "Pensado para empresas en crecimiento.",
        "full_description": "Incluye 5 usuarios, 10.000 productos, clientes ilimitados, 3 cajas y acceso a API.",
        "monthly_price": 39.00,
        "annual_price": 390.00,
        "trial_days": 14,
        "color": "#3b82f6",
        "icon": "ShieldCheck",
        "sort_order": 2,
        "is_active": True,
        "max_users": 5,
        "max_products": 10000,
        "max_customers": 999999,
        "max_warehouses": 3,
        "max_cash_registers": 3,
        "has_printers": True,
        "storage_mb": 5000,
        "has_api": True,
        "has_ai": False,
        "has_ocr": False,
        "has_marketplace": True,
        "has_plugins": True,
        "has_priority_support": False
    },
    {
        "id": "plan_business",
        "name": "Business",
        "slug": "business",
        "short_description": "Empresas consolidadas con múltiples empleados.",
        "full_description": "Usuarios, productos y clientes ilimitados, IA, OCR y backups automáticos.",
        "monthly_price": 79.00,
        "annual_price": 790.00,
        "trial_days": 14,
        "color": "#8b5cf6",
        "icon": "Building2",
        "sort_order": 3,
        "is_active": True,
        "max_users": 999,
        "max_products": 999999,
        "max_customers": 999999,
        "max_warehouses": 10,
        "max_cash_registers": 10,
        "has_printers": True,
        "storage_mb": 50000,
        "has_api": True,
        "has_ai": True,
        "has_ocr": True,
        "has_marketplace": True,
        "has_plugins": True,
        "has_priority_support": True
    },
    {
        "id": "plan_enterprise",
        "name": "Enterprise",
        "slug": "enterprise",
        "short_description": "Todo ilimitado con soporte prioritario 24/7.",
        "full_description": "Infraestructura dedicada, integraciones personalizadas y acceso anticipado.",
        "monthly_price": 149.00,
        "annual_price": 1490.00,
        "trial_days": 14,
        "color": "#10b981",
        "icon": "Crown",
        "sort_order": 4,
        "is_active": True,
        "max_users": 9999,
        "max_products": 9999999,
        "max_customers": 9999999,
        "max_warehouses": 999,
        "max_cash_registers": 999,
        "has_printers": True,
        "storage_mb": 500000,
        "has_api": True,
        "has_ai": True,
        "has_ocr": True,
        "has_marketplace": True,
        "has_plugins": True,
        "has_priority_support": True
    }
]

@router.get("", response_model=List[PlanSchema])
async def list_plans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanModel).where(PlanModel.is_active == True).order_by(PlanModel.sort_order))
    plans = result.scalars().all()
    if not plans:
        # Carga por defecto si la base de datos está limpia
        for dp in DEFAULT_PLANS:
            p = PlanModel(**dp)
            db.add(p)
        await db.commit()
        result = await db.execute(select(PlanModel).where(PlanModel.is_active == True).order_by(PlanModel.sort_order))
        plans = result.scalars().all()
    return plans

@router.post("", response_model=PlanSchema)
async def create_plan(data: PlanCreateUpdate, db: AsyncSession = Depends(get_db)):
    plan_id = f"plan_{uuid.uuid4().hex[:10]}"
    new_plan = PlanModel(id=plan_id, **data.model_dump())
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    return new_plan

@router.put("/{plan_id}", response_model=PlanSchema)
async def update_plan(plan_id: str, data: PlanCreateUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(PlanModel).where(PlanModel.id == plan_id))
    plan = res.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado.")
    for k, v in data.model_dump().items():
        setattr(plan, k, v)
    await db.commit()
    await db.refresh(plan)
    return plan
