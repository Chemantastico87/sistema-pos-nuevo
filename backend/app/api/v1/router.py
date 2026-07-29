from fastapi import APIRouter
from app.domains.auth.router import router as auth_router
from app.domains.products.router import router as products_router
from app.domains.customers.router import router as customers_router
from app.domains.pos.router import router as pos_router
from app.domains.cash.router import router as cash_router
from app.domains.inventory.router import router as inventory_router
from app.domains.tickets.router import router as tickets_router
from app.domains.audit.router import router as audit_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(customers_router)
api_v1_router.include_router(pos_router)
api_v1_router.include_router(cash_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(tickets_router)
api_v1_router.include_router(audit_router)
