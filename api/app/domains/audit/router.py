import uuid
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy import Column, String, JSON, ForeignKey, DateTime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import Base, AsyncSessionLocal, get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.core.events import event_bus

logger = logging.getLogger("AuditDomain")

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=False)
    entity_id = Column(String(36))
    diff = Column(JSON)

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

async def record_sale_audit(payload: Dict[str, Any]):
    logger.info(f"📜 Audit: Registrando auditoría para venta {payload.get('sale_id')}")
    async with AsyncSessionLocal() as db:
        log = AuditLogModel(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            company_id=payload.get("company_id"),
            user_id=payload.get("user_id"),
            action="SaleCreated",
            entity="Sale",
            entity_id=payload.get("sale_id"),
            diff=payload
        )
        db.add(log)
        await db.commit()

event_bus.subscribe("SaleCreated", record_sale_audit)

@router.get("/logs")
async def list_audit_logs(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(AuditLogModel).where(AuditLogModel.company_id == tenant.company_id)
    result = await db.execute(query)
    return result.scalars().all()
