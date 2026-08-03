import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.domains.products.models import ProductModel, CategoryModel, ProductPriceHistoryModel
from app.domains.products.schemas import ProductCreate, ProductUpdate, ProductResponse, CategoryCreate, CategoryResponse, ProductPriceHistoryResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
@router.get("/", response_model=List[ProductResponse])
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
@router.post("/", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    prod_id = f"prod_{uuid.uuid4().hex[:12]}"
    price = float(data.price or 0.0)
    cost = float(data.cost_price) if data.cost_price is not None else None
    vat = float(data.vat_rate or 21.0)
    
    if cost is not None:
        profit = price - cost
        margin = ((price - cost) / price * 100) if price > 0 else 0.0
    else:
        profit = None
        margin = None

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
        raise HTTPException(status_code=404, detail="errors.product_not_found")

    old_price = float(product.price or 0.0)
    old_cost = float(product.cost_price) if product.cost_price is not None else None

    update_dict = data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        if val is not None or key == "cost_price":
            setattr(product, key, val)

    new_price = float(product.price or 0.0)
    new_cost = float(product.cost_price) if product.cost_price is not None else None

    # Registrar historial si cambió el precio o el coste
    if old_price != new_price or old_cost != new_cost:
        history_entry = ProductPriceHistoryModel(
            id=f"hist_{uuid.uuid4().hex[:12]}",
            company_id=tenant.company_id,
            product_id=product.id,
            user_id=tenant.user_id,
            old_price=old_price,
            new_price=new_price,
            old_cost=old_cost,
            new_cost=new_cost,
            reason="Actualización de ficha de producto"
        )
        db.add(history_entry)

    # Recalcular beneficio y margen solo si existe coste
    if product.cost_price is not None:
        cost = float(product.cost_price)
        product.profit = new_price - cost
        product.margin = ((new_price - cost) / new_price * 100) if new_price > 0 else 0.0
    else:
        product.profit = None
        product.margin = None

    await db.commit()
    await db.refresh(product)
    return product

@router.get("/{product_id}/price-history")
async def get_product_price_history(
    product_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(ProductPriceHistoryModel).where(
        ProductPriceHistoryModel.product_id == product_id,
        ProductPriceHistoryModel.company_id == tenant.company_id
    ).order_by(ProductPriceHistoryModel.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

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

# Catálogo Global VENDIX (Comunidad)
GLOBAL_VENDIX_CATALOG = {}

@router.get("/global-catalog/{barcode}")
@router.get("/global-catalog/{barcode}/")
async def get_global_catalog_product(barcode: str):
    item = GLOBAL_VENDIX_CATALOG.get(barcode)
    if item:
        return {"found": True, "product": item}
    return {"found": False, "message": "Producto no encontrado en el Catálogo Global"}

@router.post("/global-catalog/share")
@router.post("/global-catalog/share/")
async def share_product_to_global_catalog(data: dict):
    barcode = data.get("barcode")
    if not barcode:
        raise HTTPException(status_code=400, detail="Código de barras es requerido")

    # Guardar únicamente metadatos genéricos comunitarios (NUNCA precios, costos, empresa ni ventas)
    GLOBAL_VENDIX_CATALOG[barcode] = {
        "barcode": barcode,
        "name": data.get("name"),
        "brand": data.get("brand", "Comercial"),
        "category": data.get("category", "General"),
        "image_url": data.get("image_url", ""),
        "description": data.get("description", ""),
        "unit": data.get("unit", "Ud"),
        "weight": data.get("weight", ""),
        "manufacturer": data.get("manufacturer", ""),
        "shared_at": uuid.uuid4().hex[:8]
    }
    return {"message": f"Producto {barcode} registrado en el Catálogo Global VENDIX."}

