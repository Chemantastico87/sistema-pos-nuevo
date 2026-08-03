import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.database import AsyncSessionLocal, engine, Base
from app.domains.auth.models import CompanyModel, UserModel
from app.domains.cash.models import CashRegisterModel
from app.core.security import get_password_hash
from sqlalchemy.future import select

ALL_ADMIN_PERMISSIONS = ["admin", "can_open_cash_register", "can_manage_inventory", "can_manage_users", "can_manage_settings"]

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check company
        res = await session.execute(select(CompanyModel).where(CompanyModel.id == "comp_demo_vendix"))
        company = res.scalars().first()
        if not company:
            company = CompanyModel(
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
            session.add(company)

        demo_users = [
            ("usr_demo_admin", "admin@vendixpos.com", "admin123", "Administrador Demo", "admin", ALL_ADMIN_PERMISSIONS),
            ("usr_demo_cashier", "cajero@vendixpos.com", "cajero123", "Carlos Cajero", "cashier", ["can_open_cash_register"]),
            ("usr_demo_supervisor", "supervisor@vendixpos.com", "super123", "María Supervisora", "supervisor", ALL_ADMIN_PERMISSIONS),
        ]

        for u_id, email, raw_pass, name, role, perms in demo_users:
            u_res = await session.execute(select(UserModel).where(UserModel.email == email))
            user_obj = u_res.scalars().first()
            if not user_obj:
                user_obj = UserModel(
                    id=u_id,
                    company_id="comp_demo_vendix",
                    email=email,
                    hashed_password=get_password_hash(raw_pass),
                    full_name=name,
                    role=role,
                    status="active",
                    is_active=True,
                    email_verified=True,
                    permissions=perms
                )
                session.add(user_obj)
            else:
                user_obj.hashed_password = get_password_hash(raw_pass)
                user_obj.status = "active"
                user_obj.is_active = True
                user_obj.email_verified = True

        await session.commit()
        print("[OK] Demo users seeded successfully with hashed passwords!")

if __name__ == "__main__":
    asyncio.run(seed())
