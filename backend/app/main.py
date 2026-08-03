import logging
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.websockets import ws_manager
from app.api.v1.router import (
    api_v1_router,
    auth_router, products_router, customers_router, pos_router,
    cash_router, inventory_router, tickets_router, audit_router,
    superadmin_router, subscriptions_router, health_router,
    errors_router, backups_router, activity_router, notifications_router,
    import_export_router, plans_router, coupons_router, vendix_ai_router
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("POS_SaaS_Main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json",
    redirect_slashes=False
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"❌ Excepción no capturada en {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error del servidor ({type(exc).__name__}): {str(exc)}"}
    )

# Middleware de CORS nativo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware ASGI para responder siempre a peticiones OPTIONS preflight con cabeceras CORS
@app.middleware("http")
async def cors_preflight_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

@app.on_event("startup")
async def startup():
    logger.info("🚀 Inicializando base de datos y creando tablas en segundo plano...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # Crear cuentas demo iniciales con hashes de contraseña seguros si no existen
        from app.core.database import AsyncSessionLocal
        from app.domains.auth.models import CompanyModel, UserModel
        from app.domains.cash.models import CashRegisterModel
        from app.core.security import get_password_hash
        from sqlalchemy.future import select

        ALL_ADMIN_PERMISSIONS = ["admin", "can_open_cash_register", "can_manage_inventory", "can_manage_users", "can_manage_settings"]

        async with AsyncSessionLocal() as session:
            result = await session.execute(select(CompanyModel).where(CompanyModel.id == "comp_demo_vendix"))
            demo_company = result.scalars().first()
            if not demo_company:
                demo_company = CompanyModel(
                    id="comp_demo_vendix",
                    name="Comercio VENDIX Demo",
                    email="admin@vendixpos.com",
                    country="España",
                    currency="EUR",
                    timezone="Europe/Madrid",
                    onboarding_completed=True,
                    plan="Enterprise",
                    subscription_status="active"
                )
                session.add(demo_company)

                demo_users = [
                    ("usr_demo_admin", "admin@vendixpos.com", get_password_hash("admin123"), "Administrador Demo", "admin", ALL_ADMIN_PERMISSIONS),
                    ("usr_demo_cashier", "cajero@vendixpos.com", get_password_hash("cajero123"), "Carlos Cajero", "cashier", ["can_open_cash_register"]),
                    ("usr_demo_supervisor", "supervisor@vendixpos.com", get_password_hash("super123"), "María Supervisora", "supervisor", ALL_ADMIN_PERMISSIONS),
                ]

                for u_id, email, pass_hash, name, role, perms in demo_users:
                    u_res = await session.execute(select(UserModel).where(UserModel.id == u_id))
                    if not u_res.scalars().first():
                        user_obj = UserModel(
                            id=u_id,
                            company_id="comp_demo_vendix",
                            email=email,
                            hashed_password=pass_hash,
                            full_name=name,
                            role=role,
                            status="active",
                            is_active=True,
                            email_verified=True,
                            permissions=perms
                        )
                        session.add(user_obj)

                cash_res = await session.execute(select(CashRegisterModel).where(CashRegisterModel.id == "cash_demo_main"))
                if not cash_res.scalars().first():
                    cash_obj = CashRegisterModel(
                        id="cash_demo_main",
                        company_id="comp_demo_vendix",
                        user_id="usr_demo_admin",
                        name="Caja Principal",
                        status="closed",
                        opening_balance=0.00
                    )
                    session.add(cash_obj)

                await session.commit()
                logger.info("✅ Cuentas Demo inicializadas con contraseñas cifradas.")

        logger.info("✅ Base de datos inicializada correctamente.")
    except Exception as e:
        logger.warning(f"⚠️ Nota de inicialización BD: {e}")

@app.get("/health")
@app.get("/health/")
@app.get("/api/health")
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}

@app.websocket("/ws/{company_id}")
async def websocket_endpoint(websocket: WebSocket, company_id: str):
    await ws_manager.connect(company_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(company_id, websocket)

# Registrar rutas principales API v1 de forma única y limpia
app.include_router(api_v1_router)
