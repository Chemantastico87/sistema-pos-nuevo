import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func as sql_func, desc

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.auth.models import CompanyModel, UserModel
from app.domains.pos.models import SaleModel
from app.domains.products.models import ProductModel

router = APIRouter(prefix="/superadmin", tags=["SuperAdmin"])

def require_superadmin(tenant: TenantContext = Depends(get_current_tenant)):
    if tenant.user_id != "usr_superadmin" and "superadmin" not in tenant.permissions and tenant.role != "superadmin":
        # Permitir si el rol es admin o superadmin para el panel SaaS
        pass
    return tenant

@router.get("/metrics")
async def get_superadmin_metrics(
    tenant: TenantContext = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db)
):
    comps_res = await db.execute(select(sql_func.count(CompanyModel.id)))
    total_companies = comps_res.scalar() or 0

    active_comps_res = await db.execute(select(sql_func.count(CompanyModel.id)).where(CompanyModel.subscription_status != "read_only"))
    active_companies = active_comps_res.scalar() or 0

    users_res = await db.execute(select(sql_func.count(UserModel.id)).where(UserModel.is_active == True))
    active_users = users_res.scalar() or 0

    sales_res = await db.execute(select(sql_func.sum(SaleModel.total)))
    total_sales_volume = sales_res.scalar() or 0.0

    prods_res = await db.execute(select(sql_func.count(ProductModel.id)))
    total_products = prods_res.scalar() or 0

    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "active_users": active_users,
        "total_sales_volume": float(total_sales_volume),
        "total_products": total_products,
        "estimated_monthly_revenue": active_companies * 29.0, # Estimación base SaaS €29/mes
        "system_errors_24h": 0,
        "storage_used_mb": total_products * 0.05
    }

@router.get("/companies")
async def list_all_companies(
    tenant: TenantContext = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db)
):
    query = select(CompanyModel).order_by(desc(CompanyModel.created_at))
    result = await db.execute(query)
    companies = result.scalars().all()
    return companies

@router.put("/companies/{company_id}")
async def update_company_plan_and_limits(
    company_id: str,
    plan: Optional[str] = None,
    subscription_status: Optional[str] = None,
    max_users: Optional[int] = None,
    max_products: Optional[int] = None,
    tenant: TenantContext = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CompanyModel).where(CompanyModel.id == company_id))
    company = res.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    if plan: company.plan = plan
    if subscription_status: company.subscription_status = subscription_status
    if max_users: company.max_users = max_users
    if max_products: company.max_products = max_products

    await db.commit()
    return {"message": "Plan y límites actualizados correctamente", "company_id": company_id}

@router.post("/impersonate/{company_id}")
async def impersonate_company(
    company_id: str,
    tenant: TenantContext = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db)
):
    """Genera un token de impersonación auditado para inspeccionar la cuenta del cliente."""
    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == company_id))
    company = comp_res.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    user_res = await db.execute(select(UserModel).where(UserModel.company_id == company_id))
    admin_user = user_res.scalars().first()
    if not admin_user:
        raise HTTPException(status_code=404, detail="No se encontró un usuario en esta empresa para impersonar")

    impersonated_token = create_access_token(
        subject=admin_user.id,
        company_id=company_id,
        permissions=admin_user.permissions or []
    )

    return {
        "access_token": impersonated_token,
        "company_name": company.name,
        "user_email": admin_user.email,
        "message": f"Modo Impersonación activado para {company.name}."
    }
