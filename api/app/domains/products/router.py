import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.domains.products.models import ProductModel, CategoryModel
from app.domains.products.schemas import ProductCreate, ProductUpdate, ProductResponse, CategoryCreate, CategoryResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def list_products(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(ProductModel).where(ProductModel.company_id == tenant.company_id)
    if category_id:
        query = query.where(ProductModel.category_id == category_id)
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                ProductModel.name.ilike(term),
                ProductModel.barcode.ilike(term),
                ProductModel.sku.ilike(term),
                ProductModel.reference.ilike(term)
            )
        )
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    prod_id = f"prod_{uuid.uuid4().hex[:12]}"
    cost = float(data.cost_price or 0.0)
    price = float(data.price or 0.0)
    vat = float(data.vat_rate or 21.0)
    profit = price - cost
    margin = ((price - cost) / price * 100) if price > 0 else 0.0

    product = ProductModel(
        id=prod_id,
        company_id=tenant.company_id,
        name=data.name,
        price=price,
        cost_price=cost,
        vat_rate=vat,
        profit=profit,
        margin=margin,
        stock=data.stock,
        min_stock=data.min_stock,
        max_stock=data.max_stock,
        barcode=data.barcode,
        sku=data.sku,
        reference=data.reference,
        description=data.description,
        image_url=data.image_url,
        supplier=data.supplier,
        brand=data.brand,
        unit=data.unit,
        location=data.location,
        lot_number=data.lot_number,
        expiration_date=data.expiration_date,
        category_id=data.category_id,
        weighted_avg_cost=cost,
        last_cost=cost
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    await event_bus.publish("ProductCreated", {
        "product_id": product.id,
        "company_id": product.company_id,
        "user_id": tenant.user_id,
        "stock": float(product.stock),
        "reason": "Alta de producto"
    })
    
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(ProductModel).where(ProductModel.id == product_id, ProductModel.company_id == tenant.company_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_dict = data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        if val is not None:
            setattr(product, key, val)

    # Recalcular costo, beneficio y margen
    cost = float(product.cost_price or 0.0)
    price = float(product.price or 0.0)
    product.profit = price - cost
    product.margin = ((price - cost) / price * 100) if price > 0 else 0.0

    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(ProductModel).where(ProductModel.id == product_id, ProductModel.company_id == tenant.company_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    await db.delete(product)
    await db.commit()
    return {"message": "Producto eliminado correctamente"}

# Categorías
@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(CategoryModel).where(CategoryModel.company_id == tenant.company_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    cat_id = f"cat_{uuid.uuid4().hex[:12]}"
    category = CategoryModel(
        id=cat_id,
        company_id=tenant.company_id,
        name=data.name
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category
