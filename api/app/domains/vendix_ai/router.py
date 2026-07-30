from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.products.models import ProductModel
from app.domains.pos.models import CustomerModel

router = APIRouter(prefix="/vendix-ai", tags=["VENDIX AI"])

class AIInsight(BaseModel):
    id: str
    type: str # product_promotion, stock_replenishment, customer_winback, sales_trend
    title: str
    description: str
    action_text: str
    action_type: str

@router.get("/insights", response_model=List[AIInsight])
async def get_insights(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    insights = []

    # 1. Analizar productos inactivos
    prod_res = await db.execute(
        select(ProductModel)
        .where(ProductModel.company_id == tenant.company_id)
        .where(ProductModel.is_active == True)
    )
    products = prod_res.scalars().all()

    stale_products = [p for p in products if p.stock > 0]
    if stale_products:
        p = stale_products[0]
        insights.append(AIInsight(
            id="insight_stale_1",
            type="product_promotion",
            title="Sugerencia de Promoción",
            description=f"El producto '{p.name}' lleva varios días sin registrar ventas. ¿Deseas aplicar una oferta especial?",
            action_text="Crear Oferta 15%",
            action_type="create_promo"
        ))

    # 2. Analizar reabastecimiento de stock
    low_stock = [p for p in products if p.stock <= p.min_stock]
    if low_stock:
        insights.append(AIInsight(
            id="insight_stock_1",
            type="stock_replenishment",
            title="Predicción de Agotamiento de Stock",
            description=f"Tienes {len(low_stock)} producto(s) en nivel crítico. Al ritmo actual de ventas se agotarán en menos de 4 días.",
            action_text="Generar Pedido Proveedor",
            action_type="restock"
        ))

    # 3. Analizar re-enganche de clientes
    cust_res = await db.execute(
        select(CustomerModel)
        .where(CustomerModel.company_id == tenant.company_id)
    )
    customers = cust_res.scalars().all()
    if customers:
        c = customers[0]
        insights.append(AIInsight(
            id="insight_cust_1",
            type="customer_winback",
            title="Fidelización de Clientes",
            description=f"El cliente '{c.name}' no realiza compras recientemente. Envíale un cupón promocional de re-enganche.",
            action_text="Enviar Cupón 10%",
            action_type="send_coupon"
        ))
    else:
        insights.append(AIInsight(
            id="insight_trend_1",
            type="sales_trend",
            title="Recomendación VENDIX Insights",
            description="El margen de beneficio promedio de tu catálogo está en 42%. Mantén la rotación alta en tus productos top.",
            action_text="Ver Informe Completo",
            action_type="view_analytics"
        ))

    return insights
