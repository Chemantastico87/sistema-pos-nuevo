from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

from sqlalchemy.pool import NullPool

# Forzar driver asíncrono según el dialecto (SQLite / PostgreSQL)
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite://"):
    db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://")
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")

# En SQLite o entornos serverless (Vercel Lambdas), desactivar pool global (NullPool)
# para evitar errores de hilos u objetos SQLite compartidos entre event loops distintos.
engine_kwargs = {"echo": False, "future": True}
if "sqlite" in db_url:
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(
    db_url,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

_db_initialized = False

async def ensure_db_initialized():
    global _db_initialized
    if _db_initialized:
        return
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        from app.domains.auth.models import CompanyModel, UserModel
        from app.domains.cash.models import CashRegisterModel
        from app.core.security import get_password_hash
        from sqlalchemy.future import select

        ALL_ADMIN_PERMISSIONS = [
            "admin", "can_change_price", "can_delete_sale", "can_open_cash_register",
            "can_reopen_cash_register", "can_view_profit", "can_manage_inventory",
            "can_manage_users", "can_manage_settings", "can_export_reports",
            "can_manage_subscriptions", "can_access_api"
        ]

        async with AsyncSessionLocal() as session:
            result = await session.execute(select(CompanyModel).where(CompanyModel.id == "comp_demo_vendix"))
            if not result.scalars().first():
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

        _db_initialized = True
    except Exception as e:
        print(f"DB lazy init warning: {e}")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    await ensure_db_initialized()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
