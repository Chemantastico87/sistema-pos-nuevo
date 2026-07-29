import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.core.telemetry import capture_sale_latency
from app.domains.pos.models import SaleModel, SaleItemModel
from app.domains.pos.schemas import CheckoutRequest, SaleResponse, SyncBatchRequest

router = APIRouter(prefix="/pos", tags=["POS Checkout"])

@router.post("/checkout", response_model=SaleResponse)
async def checkout(
    data: CheckoutRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    start_time = time.time()
    
    if not data.items:
        raise HTTPException(status_code=400, detail="La venta debe contener al menos un producto.")
    
    sale_id = data.offline_sale_id or f"sale_{uuid.uuid4().hex[:12]}"
    
    # Verificar idempotencia si es venta offline
    if data.offline_sale_id:
        existing = await db.execute(select(SaleModel).where(SaleModel.id == sale_id, SaleModel.company_id == tenant.company_id))
        if existing.scalars().first():
            # Retornar idempotente
            sale = existing.scalars().first()
            return sale

    subtotal = sum(item.quantity * item.unit_price for item in data.items)
    total = max(0.0, subtotal - data.discount)
    invoice_number = f"INV-{int(time.time() * 1000) % 10000000:07d}"

    sale = SaleModel(
        id=sale_id,
        company_id=tenant.company_id,
        invoice_number=invoice_number,
        user_id=tenant.user_id,
        customer_id=data.customer_id,
        cash_register_id=data.cash_register_id,
        subtotal=subtotal,
        discount=data.discount,
        tax=0.0,
        total=total,
        payment_method=data.payment_method,
        status="completed"
    )
    db.add(sale)

    sale_items = []
    for item in data.items:
        item_id = f"item_{uuid.uuid4().hex[:12]}"
        s_item = SaleItemModel(
            id=item_id,
            sale_id=sale.id,
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.quantity * item.unit_price
        )
        db.add(s_item)
        sale_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": item.unit_price
        })

    await db.commit()
    await db.refresh(sale)

    duration_ms = (time.time() - start_time) * 1000
    capture_sale_latency(sale.id, duration_ms)

    # Disparar evento SaleCreated asíncrono
    await event_bus.publish("SaleCreated", {
        "event_id": f"evt_{uuid.uuid4().hex[:8]}",
        "company_id": tenant.company_id,
        "sale_id": sale.id,
        "invoice_number": sale.invoice_number,
        "total": float(sale.total),
        "payment_method": sale.payment_method,
        "cash_register_id": sale.cash_register_id,
        "user_id": tenant.user_id,
        "items": sale_items
    })

    return sale

@router.post("/sync", response_model=List[SaleResponse])
async def sync_offline_sales(
    batch: SyncBatchRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    synced_sales = []
    for sale_data in batch.sales:
        res = await checkout(sale_data, tenant, db)
        synced_sales.append(res)
    return synced_sales
