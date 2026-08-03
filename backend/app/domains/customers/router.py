import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.email import send_welcome_customer_email
from app.domains.customers.models import CustomerModel
from app.domains.customers.schemas import CustomerCreate, CustomerResponse
from app.domains.auth.models import CompanyModel

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerResponse])
@router.get("/", response_model=List[CustomerResponse])
async def list_customers(
    search: Optional[str] = Query(None),
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(CustomerModel).where(CustomerModel.company_id == tenant.company_id)
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                CustomerModel.name.ilike(term),
                CustomerModel.phone.ilike(term),
                CustomerModel.tax_id.ilike(term)
            )
        )
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=CustomerResponse)
@router.post("/", response_model=CustomerResponse)
async def create_customer(
    data: CustomerCreate,
    background_tasks: BackgroundTasks,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    cust_id = f"cust_{uuid.uuid4().hex[:12]}"
    customer = CustomerModel(
        id=cust_id,
        company_id=tenant.company_id,
        name=data.name,
        tax_id=data.tax_id,
        email=data.email,
        phone=data.phone,
        points=0
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)

    # Si se proporcionó un correo para el cliente, enviar correo de bienvenida
    if data.email:
        comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == tenant.company_id))
        company = comp_res.scalars().first()
        company_name = company.name if company else "Tu Comercio"
        background_tasks.add_task(send_welcome_customer_email, data.email, data.name, company_name, 0)

    return customer
