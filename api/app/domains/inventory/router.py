import uuid
import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func as sql_func, desc

from app.core.database import AsyncSessionLocal, get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.domains.products.models import ProductModel
from app.domains.inventory.models import InventoryMovementModel

logger = logging.getLogger("InventoryDomain")

router = APIRouter(prefix="/inventory", tags=["Inventory"])

async def handle_sale_created_stock_update(payload: Dict[str, Any]):
    """Manejador de evento SaleCreated para deducir stock y registrar auditoría de movimiento."""
    items = payload.get("items", [])
    company_id = payload.get("company_id")
    user_id = payload.get("user_id")
    
    async with AsyncSessionLocal() as db:
        for item in items:
            product_id = item.get("product_id")
            qty = float(item.get("quantity", 0))
            result = await db.execute(
                select(ProductModel).where(ProductModel.id == product_id, ProductModel.company_id == company_id)
            )
            product = result.scalars().first()
            if product:
                before = float(product.stock)
                after = before - qty
                product.stock = after
                product.last_sale_at = sql_func.now()

                mov = InventoryMovementModel(
                    id=f"mov_{uuid.uuid4().hex[:12]}",
                    company_id=company_id,
                    product_id=product_id,
                    user_id=user_id,
                    movement_type="Venta",
                    quantity=-qty,
                    stock_before=before,
                    stock_after=after,
                    reason=f"Venta de TPV #{payload.get('invoice_number', '')}",
                    notes="Deducción de stock automática"
                )
                db.add(mov)
        await db.commit()

event_bus.subscribe("SaleCreated", handle_sale_created_stock_update)

@router.get("/kpis")
async def get_inventory_kpis(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(ProductModel).where(ProductModel.company_id == tenant.company_id)
    result = await db.execute(query)
    products = result.scalars().all()

    total_value = sum(float(p.stock) * float(p.cost_price or 0.0) for p in products)
    potential_profit = sum(float(p.stock) * (float(p.price or 0.0) - float(p.cost_price or 0.0)) for p in products)
    out_of_stock = sum(1 for p in products if float(p.stock) <= 0)
    low_stock = sum(1 for p in products if float(p.stock) > 0 and float(p.stock) <= float(p.min_stock or 0.0))
    no_movement = sum(1 for p in products if p.last_sale_at is None)

    return {
        "total_inventory_value": total_value,
        "potential_profit": potential_profit,
        "out_of_stock_count": out_of_stock,
        "low_stock_count": low_stock,
        "no_movement_count": no_movement,
        "total_products": len(products)
    }

@router.get("/movements")
async def list_inventory_movements(
    product_id: Optional[str] = Query(None),
    movement_type: Optional[str] = Query(None),
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(InventoryMovementModel).where(InventoryMovementModel.company_id == tenant.company_id)
    if product_id:
        query = query.where(InventoryMovementModel.product_id == product_id)
    if movement_type:
        query = query.where(InventoryMovementModel.movement_type == movement_type)
    query = query.order_by(desc(InventoryMovementModel.created_at))
    
    result = await db.execute(query)
    movements = result.scalars().all()
    return movements

@router.post("/adjust")
async def adjust_stock(
    product_id: str,
    new_stock: float,
    movement_type: str = "Ajuste", # Entrada, Salida, Ajuste, Devolución, Transferencia, Reserva
    reason: str = "Ajuste de inventario",
    notes: Optional[str] = None,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ProductModel).where(ProductModel.id == product_id, ProductModel.company_id == tenant.company_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    before = float(product.stock)
    diff = new_stock - before
    product.stock = new_stock

    mov = InventoryMovementModel(
        id=f"mov_{uuid.uuid4().hex[:12]}",
        company_id=tenant.company_id,
        product_id=product_id,
        user_id=tenant.user_id,
        movement_type=movement_type,
        quantity=diff,
        stock_before=before,
        stock_after=new_stock,
        reason=reason,
        notes=notes
    )
    db.add(mov)
    await db.commit()

    return {"message": "Stock e historial de movimientos actualizados correctamente", "product_id": product_id, "new_stock": new_stock}
