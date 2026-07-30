from fastapi import APIRouter
from app.domains.auth.router import router as auth_router
from app.domains.products.router import router as products_router
from app.domains.customers.router import router as customers_router
from app.domains.pos.router import router as pos_router
from app.domains.cash.router import router as cash_router
from app.domains.inventory.router import router as inventory_router
from app.domains.tickets.router import router as tickets_router
from app.domains.audit.router import router as audit_router
from app.domains.superadmin.router import router as superadmin_router
from app.domains.subscriptions.router import router as subscriptions_router
from app.domains.system_health.router import router as health_router
from app.domains.system_errors.router import router as errors_router
from app.domains.backups.router import router as backups_router
from app.domains.activity.router import router as activity_router
from app.domains.notifications.router import router as notifications_router
from app.domains.import_export.router import router as import_export_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(customers_router)
api_v1_router.include_router(pos_router)
api_v1_router.include_router(cash_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(tickets_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(superadmin_router)
api_v1_router.include_router(subscriptions_router)
api_v1_router.include_router(health_router)
api_v1_router.include_router(errors_router)
api_v1_router.include_router(backups_router)
api_v1_router.include_router(activity_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(import_export_router)
