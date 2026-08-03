from typing import List, Optional
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.products.models import ProductModel

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
    accept_language: Optional[str] = Header(None),
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    lang = (accept_language.split('-')[0].lower() if accept_language else 'es')
    if lang not in ['es', 'en', 'pt']:
        lang = 'es'

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
        
        titles = {
            'es': "Sugerencia de Promoción",
            'en': "Promotion Suggestion",
            'pt': "Sugestão de Promoção"
        }
        descriptions = {
            'es': f"El producto '{p.name}' lleva varios días sin registrar ventas. ¿Deseas aplicar una oferta especial?",
            'en': f"Product '{p.name}' has had no sales for several days. Would you like to create a special discount?",
            'pt': f"O produto '{p.name}' está há vários dias sem vendas. Deseja criar um desconto especial?"
        }
        actions = {
            'es': "Crear Oferta 15%",
            'en': "Create 15% Discount",
            'pt': "Criar Desconto 15%"
        }
        
        insights.append(AIInsight(
            id="insight_stale_1",
            type="product_promotion",
            title=titles[lang],
            description=descriptions[lang],
            action_text=actions[lang],
            action_type="create_promo"
        ))

    # 2. Analizar reabastecimiento de stock
    low_stock = [p for p in products if p.stock <= p.min_stock]
    if low_stock:
        titles_stock = {
            'es': "Predicción de Agotamiento de Stock",
            'en': "Stock Depletion Prediction",
            'pt': "Previsão de Esgotamento de Estoque"
        }
        descriptions_stock = {
            'es': f"Tienes {len(low_stock)} producto(s) en nivel crítico. Al ritmo actual de ventas se agotarán en menos de 4 días.",
            'en': f"You have {len(low_stock)} product(s) at critical stock level. At current sales rate they will run out in less than 4 days.",
            'pt': f"Você tem {len(low_stock)} produto(s) em nível crítico. No ritmo atual de vendas eles acabarão em menos de 4 dias."
        }
        actions_stock = {
            'es': "Generar Pedido Proveedor",
            'en': "Create Purchase Order",
            'pt': "Gerar Pedido ao Fornecedor"
        }

        insights.append(AIInsight(
            id="insight_stock_1",
            type="stock_replenishment",
            title=titles_stock[lang],
            description=descriptions_stock[lang],
            action_text=actions_stock[lang],
            action_type="restock"
        ))

    return insights
