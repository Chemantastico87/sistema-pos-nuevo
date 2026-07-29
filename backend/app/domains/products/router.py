import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.domains.products.models import ProductModel
from app.domains.products.schemas import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def list_products(
    search: Optional[str] = Query(None),
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(ProductModel).where(ProductModel.company_id == tenant.company_id)
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                ProductModel.name.ilike(term),
                ProductModel.barcode.ilike(term),
                ProductModel.sku.ilike(term)
            )
        )
    result = await db.execute(query)
    products = result.scalars().all()
    return products

@router.post("", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    prod_id = f"prod_{uuid.uuid4().hex[:12]}"
    product = ProductModel(
        id=prod_id,
        company_id=tenant.company_id,
        name=data.name,
        price=data.price,
        cost_price=data.cost_price,
        stock=data.stock,
        min_stock=data.min_stock,
        barcode=data.barcode,
        sku=data.sku,
        category_id=data.category_id,
        unit=data.unit
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    # Emisión de evento ProductUpdated
    await event_bus.publish("ProductUpdated", {
        "product_id": product.id,
        "company_id": product.company_id,
        "action": "created"
    })
    
    return product
