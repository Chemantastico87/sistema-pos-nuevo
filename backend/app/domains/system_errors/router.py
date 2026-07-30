import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import Base, get_db
from app.core.tenant import TenantContext, get_current_tenant

class SystemErrorModel(Base):
    __tablename__ = "system_errors"
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36))
    user_id = Column(String(36))
    error_message = Column(Text, nullable=False)
    stack_trace = Column(Text)
    browser = Column(String(100))
    os = Column(String(100))
    status = Column(String(20), default="open") # open, resolved
    created_at = Column(DateTime, default=func.now())

class ErrorReportRequest(BaseModel):
    error_message: str
    stack_trace: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None

router = APIRouter(prefix="/errors", tags=["System Errors"])

@router.get("/list")
async def list_system_errors(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(SystemErrorModel).order_by(desc(SystemErrorModel.created_at)).limit(50)
    result = await db.execute(query)
    errors = result.scalars().all()
    return errors

@router.post("/report")
async def report_error(
    data: ErrorReportRequest,
    tenant: Optional[TenantContext] = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    err_id = f"err_{uuid.uuid4().hex[:12]}"
    err = SystemErrorModel(
        id=err_id,
        company_id=tenant.company_id if tenant else None,
        user_id=tenant.user_id if tenant else None,
        error_message=data.error_message,
        stack_trace=data.stack_trace,
        browser=data.browser,
        os=data.os,
        status="open"
    )
    db.add(err)
    await db.commit()
    return {"message": "Error registrado en la bitácora del sistema", "id": err_id}

@router.patch("/{error_id}/resolve")
async def mark_error_resolved(
    error_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(SystemErrorModel).where(SystemErrorModel.id == error_id))
    err = res.scalars().first()
    if not err:
        raise HTTPException(status_code=404, detail="Error no encontrado")

    err.status = "resolved"
    await db.commit()
    return {"message": "Estado del error actualizado a Resuelto"}
