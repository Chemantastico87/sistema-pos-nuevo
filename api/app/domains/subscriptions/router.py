from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func as sql_func

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.auth.models import CompanyModel, UserModel
from app.domains.products.models import ProductModel

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

PLAN_LIMITS = {
    "Starter": {"max_users": 3, "max_products": 300, "storage_mb": 500, "plugins": False, "api": False},
    "Profesional": {"max_users": 10, "max_products": 2000, "storage_mb": 2000, "plugins": True, "api": True},
    "Business": {"max_users": 25, "max_products": 10000, "storage_mb": 10000, "plugins": True, "api": True},
    "Enterprise": {"max_users": 999, "max_products": 999999, "storage_mb": 100000, "plugins": True, "api": True}
}

@router.get("/current")
async def get_subscription_status(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == tenant.company_id))
    company = comp_res.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    users_count_res = await db.execute(select(sql_func.count(UserModel.id)).where(UserModel.company_id == tenant.company_id))
    users_count = users_count_res.scalar() or 0

    prods_count_res = await db.execute(select(sql_func.count(ProductModel.id)).where(ProductModel.company_id == tenant.company_id))
    products_count = prods_count_res.scalar() or 0

    plan_info = PLAN_LIMITS.get(company.plan or "Starter", PLAN_LIMITS["Starter"])

    return {
        "company_id": company.id,
        "company_name": company.name,
        "plan": company.plan or "Starter",
        "subscription_status": company.subscription_status or "trial",
        "expires_at": str(company.subscription_expires_at) if company.subscription_expires_at else None,
        "usage": {
            "users_used": users_count,
            "max_users": company.max_users or plan_info["max_users"],
            "products_used": products_count,
            "max_products": company.max_products or plan_info["max_products"],
            "storage_mb_used": round(products_count * 0.05, 2),
            "max_storage_mb": company.storage_mb_limit or plan_info["storage_mb"]
        },
        "features": {
            "plugins": plan_info["plugins"],
            "api_access": plan_info["api"],
            "read_only_mode": company.subscription_status == "read_only"
        }
    }

@router.post("/change-plan")
async def change_plan(
    plan_name: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    if plan_name not in PLAN_LIMITS:
        raise HTTPException(status_code=400, detail="Plan no válido")

    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == tenant.company_id))
    company = comp_res.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    limits = PLAN_LIMITS[plan_name]
    company.plan = plan_name
    company.max_users = limits["max_users"]
    company.max_products = limits["max_products"]
    company.subscription_status = "active"

    await db.commit()
    return {"message": f"Suscripción actualizada al plan {plan_name} exitosamente."}
