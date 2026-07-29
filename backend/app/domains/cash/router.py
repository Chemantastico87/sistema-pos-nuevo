import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.core.permissions import require_permission
from app.domains.cash.models import CashRegisterModel, CashMovementModel
from app.domains.cash.schemas import OpenCashRegisterRequest, CloseCashRegisterRequest, CashMovementCreate, CashRegisterResponse

router = APIRouter(prefix="/cash", tags=["Cash Register"])

@router.get("/current", response_model=Optional[CashRegisterResponse])
async def get_current_cash_register(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(CashRegisterModel).where(
        CashRegisterModel.company_id == tenant.company_id,
        CashRegisterModel.user_id == tenant.user_id,
        CashRegisterModel.status == "open"
    )
    result = await db.execute(query)
    return result.scalars().first()

@router.post("/open", response_model=CashRegisterResponse)
async def open_cash_register(
    data: OpenCashRegisterRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    existing = await get_current_cash_register(tenant, db)
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una caja registradora abierta para este usuario.")
    
    register_id = f"cash_{uuid.uuid4().hex[:12]}"
    cash_reg = CashRegisterModel(
        id=register_id,
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        name=data.name,
        status="open",
        opening_balance=data.opening_balance
    )
    db.add(cash_reg)
    await db.commit()
    await db.refresh(cash_reg)
    
    await event_bus.publish("CashRegisterOpened", {
        "cash_register_id": cash_reg.id,
        "company_id": tenant.company_id,
        "opening_balance": float(cash_reg.opening_balance)
    })
    
    return cash_reg

@router.post("/close", response_model=CashRegisterResponse)
async def close_cash_register(
    data: CloseCashRegisterRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    cash_reg = await get_current_cash_register(tenant, db)
    if not cash_reg:
        raise HTTPException(status_code=404, detail="No se encontró una caja abierta para cerrar.")
    
    # Calcular balance esperado a partir de movimientos y ventas
    mov_query = select(CashMovementModel).where(
        CashMovementModel.cash_register_id == cash_reg.id,
        CashMovementModel.company_id == tenant.company_id
    )
    mov_result = await db.execute(mov_query)
    movements = mov_result.scalars().all()
    
    total_movements = sum(
        m.amount if m.type in ["sale", "deposit"] else -m.amount
        for m in movements
    )
    
    expected = float(cash_reg.opening_balance) + float(total_movements)
    diff = data.closing_balance - expected
    
    cash_reg.status = "closed"
    cash_reg.closing_balance = data.closing_balance
    cash_reg.expected_balance = expected
    cash_reg.difference = diff
    
    await db.commit()
    await db.refresh(cash_reg)
    
    await event_bus.publish("CashRegisterClosed", {
        "cash_register_id": cash_reg.id,
        "company_id": tenant.company_id,
        "closing_balance": float(cash_reg.closing_balance),
        "expected_balance": expected,
        "difference": diff
    })
    
    return cash_reg

@router.post("/movement")
async def add_cash_movement(
    data: CashMovementCreate,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    mov_id = f"mov_{uuid.uuid4().hex[:12]}"
    movement = CashMovementModel(
        id=mov_id,
        company_id=tenant.company_id,
        cash_register_id=data.cash_register_id,
        user_id=tenant.user_id,
        type=data.type,
        amount=data.amount,
        reason=data.reason
    )
    db.add(movement)
    await db.commit()
    return {"message": "Movimiento registrado correctamente", "id": mov_id}
