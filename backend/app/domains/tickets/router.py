from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.tickets.models import TicketTemplateModel

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("/template")
async def get_ticket_template(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    query = select(TicketTemplateModel).where(TicketTemplateModel.company_id == tenant.company_id)
    result = await db.execute(query)
    template = result.scalars().first()
    if not template:
        return {
            "header_text": "¡Gracias por su compra!",
            "footer_text": "Conserve su ticket para cambios o devoluciones.",
            "paper_width": "80mm"
        }
    return template
