import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal, get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.domains.products.models import ProductModel

logger = logging.getLogger("InventoryDomain")

router = APIRouter(prefix="/inventory", tags=["Inventory"])

async def handle_sale_created_stock_update(payload: Dict[str, Any]):
    """Manejador de evento SaleCreated para deducir stock en tiempo real."""
    items = payload.get("items", [])
    company_id = payload.get("company_id")
    logger.info(f"📦 Inventory: Procesando deducción de stock para venta {payload.get('sale_id')}")
    
    async with AsyncSessionLocal() as db:
        for item in items:
            product_id = item.get("product_id")
            qty = float(item.get("quantity", 0))
            result = await db.execute(
                select(ProductModel).where(ProductModel.id == product_id, ProductModel.company_id == company_id)
            )
            product = result.scalars().first()
            if product:
                product.stock = float(product.stock) - qty
        await db.commit()

# Suscribir el manejador al EventBus
event_bus.subscribe("SaleCreated", handle_sale_created_stock_update)

@router.post("/adjust")
async def adjust_stock(
    product_id: str,
    new_stock: float,
    reason: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ProductModel).where(ProductModel.id == product_id, ProductModel.company_id == tenant.company_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    product.stock = new_stock
    await db.commit()
    return {"message": "Stock actualizado correctamente", "product_id": product_id, "new_stock": new_stock}
