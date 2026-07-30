import uuid
from typing import Optional
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
    created_at = Column(DateTime, default=func.now())

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def list_notifications(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(NotificationModel).where(NotificationModel.company_id == tenant.company_id).order_by(desc(NotificationModel.created_at)).limit(30)
    result = await db.execute(query)
    notifs = result.scalars().all()

    if not notifs:
        return [
            {"id": "notif_1", "type": "version_update", "title": "Nueva Versión Disponible (v5.0.0)", "message": "Tu POS SaaS ha sido actualizado a la versión comercial v5.0.0 con motor de inventario extendido.", "read": False, "created_at": "Ahora mismo"},
            {"id": "notif_2", "type": "subscription_expiring", "title": "Período de Prueba Activo", "message": "Tu cuenta se encuentra en período de prueba gratuito Starter de 14 días.", "read": False, "created_at": "Hoy"}
        ]
    return notifs

@router.patch("/{notif_id}/read")
async def mark_as_read(
    notif_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(NotificationModel).where(NotificationModel.id == notif_id, NotificationModel.company_id == tenant.company_id))
    notif = res.scalars().first()
    if notif:
        notif.read = True
        await db.commit()
    return {"message": "Notificación marcada como leída"}
