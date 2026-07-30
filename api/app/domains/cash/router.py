import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus
from app.core.permissions import require_permission
from app.domains.cash.models import CashRegisterModel, CashMovementModel
from app.domains.pos.models import SaleModel
from app.domains.auth.models import UserModel
from app.domains.cash.schemas import (
    OpenCashRegisterRequest, CloseCashRegisterRequest, CashMovementCreate,
    CashRegisterResponse, CashClosureSummaryResponse
)

router = APIRouter(prefix="/cash", tags=["Cash Register"])

@router.get("/current")
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
    reg = result.scalars().first()
    if not reg:
        return None
    return reg

@router.get("/summary/{cash_register_id}")
async def get_cash_closure_summary(
    cash_register_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    reg_res = await db.execute(
        select(CashRegisterModel).where(
            CashRegisterModel.id == cash_register_id,
            CashRegisterModel.company_id == tenant.company_id
        )
    )
    reg = reg_res.scalars().first()
    if not reg:
        raise HTTPException(status_code=404, detail="Caja registradora no encontrada")

    user_res = await db.execute(select(UserModel).where(UserModel.id == reg.user_id))
    user = user_res.scalars().first()

    # Ventas asociadas a esta caja
    sales_res = await db.execute(
        select(SaleModel).where(
            SaleModel.cash_register_id == reg.id,
            SaleModel.company_id == tenant.company_id,
            SaleModel.status == "completed"
        )
    )
    sales = sales_res.scalars().all()

    sales_cash = sum(float(s.total) for s in sales if s.payment_method == "cash")
    sales_card = sum(float(s.total) for s in sales if s.payment_method == "card")
    sales_bizum = sum(float(s.total) for s in sales if s.payment_method == "bizum")
    sales_transfer = sum(float(s.total) for s in sales if s.payment_method == "transfer")
    sales_voucher = sum(float(s.total) for s in sales if s.payment_method == "voucher")
    sales_mixed = sum(float(s.total) for s in sales if s.payment_method == "mixed")
    total_sales = sum(float(s.total) for s in sales)
    discounts = sum(float(s.discount or 0) for s in sales)
    taxes = sum(float(s.tax or 0) for s in sales)
    change_given = sum(float(s.change_given or 0) for s in sales)

    # Movimientos manuales
    movs_res = await db.execute(
        select(CashMovementModel).where(
            CashMovementModel.cash_register_id == reg.id,
            CashMovementModel.company_id == tenant.company_id
        )
    )
    movs = movs_res.scalars().all()

    manual_deposits = sum(float(m.amount) for m in movs if m.type == "deposit")
    manual_withdrawals = sum(float(m.amount) for m in movs if m.type == "withdrawal")
    returns = sum(float(m.amount) for m in movs if m.type == "return")

    expected_balance = float(reg.opening_balance) + sales_cash + manual_deposits - manual_withdrawals - returns

    return {
        "cash_register_id": reg.id,
        "opened_at": str(reg.opened_at),
        "closed_at": str(reg.closed_at) if reg.closed_at else None,
        "user_name": user.full_name if user else "Usuario",
        "opening_balance": float(reg.opening_balance),
        "sales_cash": sales_cash,
        "sales_card": sales_card,
        "sales_bizum": sales_bizum,
        "sales_transfer": sales_transfer,
        "sales_voucher": sales_voucher,
        "sales_mixed": sales_mixed,
        "total_sales": total_sales,
        "manual_deposits": manual_deposits,
        "manual_withdrawals": manual_withdrawals,
        "returns": returns,
        "discounts": discounts,
        "taxes": taxes,
        "change_given": change_given,
        "expected_balance": expected_balance,
        "closing_balance": float(reg.closing_balance) if reg.closing_balance is not None else None,
        "difference": float(reg.difference) if reg.difference is not None else None,
        "status": reg.status,
        "closing_notes": reg.closing_notes,
        "signed_by": reg.signed_by
    }

@router.post("/open")
async def open_cash_register(
    data: OpenCashRegisterRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    existing_query = select(CashRegisterModel).where(
        CashRegisterModel.company_id == tenant.company_id,
        CashRegisterModel.user_id == tenant.user_id,
        CashRegisterModel.status == "open"
    )
    existing_res = await db.execute(existing_query)
    if existing_res.scalars().first():
        raise HTTPException(status_code=400, detail="Ya existe una caja registradora abierta para este usuario.")
    
    register_id = f"cash_{uuid.uuid4().hex[:12]}"
    cash_reg = CashRegisterModel(
        id=register_id,
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        name=data.name,
        status="open",
        opening_balance=data.opening_balance,
        opened_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(cash_reg)
    await db.commit()

    return cash_reg

@router.post("/close")
async def close_cash_register(
    data: CloseCashRegisterRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(CashRegisterModel).where(
        CashRegisterModel.company_id == tenant.company_id,
        CashRegisterModel.user_id == tenant.user_id,
        CashRegisterModel.status == "open"
    )
    res = await db.execute(query)
    cash_reg = res.scalars().first()
    if not cash_reg:
        raise HTTPException(status_code=404, detail="No se encontró una caja abierta para cerrar.")
    
    # Resumen para balance esperado
    summary = await get_cash_closure_summary(cash_reg.id, tenant, db)
    expected = summary["expected_balance"]
    diff = data.closing_balance - expected
    
    cash_reg.status = "closed"
    cash_reg.closing_balance = data.closing_balance
    cash_reg.expected_balance = expected
    cash_reg.difference = diff
    cash_reg.closed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    cash_reg.closing_notes = data.closing_notes
    cash_reg.signed_by = data.signed_by
    
    await db.commit()
    return cash_reg

@router.post("/reopen/{cash_register_id}")
async def reopen_cash_register(
    cash_register_id: str,
    tenant: TenantContext = Depends(require_permission("can_reopen_cash_register")),
    db: AsyncSession = Depends(get_db)
):
    reg_res = await db.execute(
        select(CashRegisterModel).where(
            CashRegisterModel.id == cash_register_id,
            CashRegisterModel.company_id == tenant.company_id
        )
    )
    reg = reg_res.scalars().first()
    if not reg:
        raise HTTPException(status_code=404, detail="Caja registradora no encontrada")

    reg.status = "open"
    reg.closed_at = None
    await db.commit()
    return {"message": "Caja reabierta exitosamente."}

@router.get("/history")
async def list_cash_history(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(CashRegisterModel).where(
        CashRegisterModel.company_id == tenant.company_id
    ).order_by(desc(CashRegisterModel.opened_at))
    result = await db.execute(query)
    return result.scalars().all()

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
    return {"message": "Movimiento de caja registrado correctamente", "id": mov_id}
