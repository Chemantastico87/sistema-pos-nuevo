import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import Base, get_db
from app.core.tenant import TenantContext, get_current_tenant

class NotificationModel(Base):
    __tablename__ = "notifications"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    user_id = Column(String(36))
    type = Column(String(50), nullable=False) # stock_low, backup_success, sync_error, version_update, invoice_ready, subscription_expiring
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def list_notifications(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Lista notificaciones activas excluyendo las eliminadas (deleted_at IS NULL)."""
    query = select(NotificationModel).where(
        NotificationModel.company_id == tenant.company_id,
        NotificationModel.deleted_at.is_(None)
    ).order_by(desc(NotificationModel.created_at)).limit(30)
    result = await db.execute(query)
    notifs = result.scalars().all()
    return notifs

@router.patch("/{notif_id}/read")
async def mark_as_read(
    notif_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Marca una notificación como leída guardando el timestamp read_at."""
    res = await db.execute(select(NotificationModel).where(
        NotificationModel.id == notif_id,
        NotificationModel.company_id == tenant.company_id,
        NotificationModel.deleted_at.is_(None)
    ))
    notif = res.scalars().first()
    if notif:
        notif.read = True
        notif.read_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()
    return {"message": "Notificación marcada como leída"}

@router.delete("/{notif_id}")
async def delete_notification(
    notif_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Elimina lógicamente una notificación mediante deleted_at."""
    res = await db.execute(select(NotificationModel).where(
        NotificationModel.id == notif_id,
        NotificationModel.company_id == tenant.company_id
    ))
    notif = res.scalars().first()
    if notif:
        notif.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()
    return {"message": "Notificación eliminada de forma permanente"}

@router.delete("")
async def clear_all_notifications(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Elimina lógicamente todas las notificaciones del tenant."""
    res = await db.execute(select(NotificationModel).where(
        NotificationModel.company_id == tenant.company_id,
        NotificationModel.deleted_at.is_(None)
    ))
    notifs = res.scalars().all()
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    for n in notifs:
        n.deleted_at = now_utc
    await db.commit()
    return {"message": "Todas las notificaciones han sido eliminadas"}
