import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.auth.models import CompanyModel, UserModel, RefreshTokenModel
from app.domains.cash.models import CashRegisterModel
from app.domains.auth.schemas import (
    LoginRequest, CompanyRegisterRequest, ForgotPasswordRequest, ResetPasswordRequest,
    VerifyEmailRequest, RefreshTokenRequest, TokenResponse, UserProfile, CompanyUpdateSettings
)

router = APIRouter(prefix="/auth", tags=["Auth"])

ALL_ADMIN_PERMISSIONS = [
    "can_change_price", "can_delete_sale", "can_open_cash_register",
    "can_reopen_cash_register", "can_view_profit", "can_manage_inventory",
    "can_manage_users", "can_manage_settings", "can_export_reports",
    "can_manage_subscriptions", "can_access_api"
]

@router.post("/register-company", response_model=TokenResponse)
async def register_company(data: CompanyRegisterRequest, db: AsyncSession = Depends(get_db)):
    if not data.terms_accepted:
        raise HTTPException(status_code=400, detail="Debe aceptar los términos y condiciones.")
    
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden.")

    # Verificar si el correo ya existe
    existing_company = await db.execute(select(CompanyModel).where(CompanyModel.email == data.email))
    if existing_company.scalars().first():
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")

    company_id = f"comp_{uuid.uuid4().hex[:12]}"
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    cash_id = f"cash_{uuid.uuid4().hex[:12]}"

    # 1. Crear Empresa
    new_company = CompanyModel(
        id=company_id,
        name=data.company_name,
        email=data.email,
        country=data.country,
        currency=data.currency,
        timezone=data.timezone,
        onboarding_completed=False,
        plan="Starter",
        subscription_status="trial",
        subscription_expires_at=datetime.now(timezone.utc) + timedelta(days=14),
        max_users=5,
        max_products=500
    )
    db.add(new_company)

    # 2. Crear Usuario Administrador
    new_user = UserModel(
        id=user_id,
        company_id=company_id,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.owner_name,
        role="admin",
        is_active=True,
        permissions=ALL_ADMIN_PERMISSIONS,
        email_verified=True
    )
    db.add(new_user)

    # 3. Crear Caja Principal por defecto
    new_cash = CashRegisterModel(
        id=cash_id,
        company_id=company_id,
        user_id=user_id,
        name="Caja Principal",
        status="closed",
        opening_balance=0.00
    )
    db.add(new_cash)

    # 4. Crear Refresh Token
    ref_token_val = f"ref_{uuid.uuid4().hex}"
    refresh_token = RefreshTokenModel(
        id=f"rt_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        token=ref_token_val,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db.add(refresh_token)

    await db.commit()

    access_token = create_access_token(
        subject=user_id,
        company_id=company_id,
        permissions=ALL_ADMIN_PERMISSIONS
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=ref_token_val,
        user_id=user_id,
        company_id=company_id,
        full_name=new_user.full_name,
        role=new_user.role,
        permissions=ALL_ADMIN_PERMISSIONS,
        onboarding_completed=False,
        currency=data.currency,
        plan="Starter",
        subscription_status="trial"
    )

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == data.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=401, detail="Correo electrónico o contraseña incorrectos.")

    # Control de bloqueo por intentos fallidos (5 intentos -> 15 min de bloqueo)
    if user.locked_until and user.locked_until > datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(status_code=403, detail="Cuenta temporalmente bloqueada por demasiados intentos fallidos. Intente más tarde.")

    if not verify_password(data.password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=15)
        await db.commit()
        raise HTTPException(status_code=401, detail="Correo electrónico o contraseña incorrectos.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="El usuario se encuentra inactivo.")

    # Reset intentos fallidos
    user.failed_login_attempts = 0
    user.locked_until = None

    # Cargar Empresa
    comp_result = await db.execute(select(CompanyModel).where(CompanyModel.id == user.company_id))
    company = comp_result.scalars().first()

    # Generar Refresh Token
    ref_token_val = f"ref_{uuid.uuid4().hex}"
    refresh_token = RefreshTokenModel(
        id=f"rt_{uuid.uuid4().hex[:12]}",
        user_id=user.id,
        token=ref_token_val,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db.add(refresh_token)
    await db.commit()

    token = create_access_token(
        subject=user.id,
        company_id=user.company_id,
        permissions=user.permissions or []
    )

    return TokenResponse(
        access_token=token,
        refresh_token=ref_token_val,
        user_id=user.id,
        company_id=user.company_id,
        full_name=user.full_name,
        role=user.role,
        permissions=user.permissions or [],
        onboarding_completed=company.onboarding_completed if company else True,
        currency=company.currency if company else "EUR",
        plan=company.plan if company else "Starter",
        subscription_status=company.subscription_status if company else "trial"
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RefreshTokenModel).where(RefreshTokenModel.token == data.refresh_token))
    rt = result.scalars().first()
    if not rt:
        raise HTTPException(status_code=401, detail="Token de refresco inválido.")

    user_res = await db.execute(select(UserModel).where(UserModel.id == rt.user_id))
    user = user_res.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario inactivo o inexistente.")

    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == user.company_id))
    company = comp_res.scalars().first()

    new_access_token = create_access_token(
        subject=user.id,
        company_id=user.company_id,
        permissions=user.permissions or []
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=rt.token,
        user_id=user.id,
        company_id=user.company_id,
        full_name=user.full_name,
        role=user.role,
        permissions=user.permissions or [],
        onboarding_completed=company.onboarding_completed if company else True,
        currency=company.currency if company else "EUR",
        plan=company.plan if company else "Starter",
        subscription_status=company.subscription_status if company else "trial"
    )

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == data.email))
    user = result.scalars().first()
    if user:
        user.reset_password_token = f"reset_{uuid.uuid4().hex}"
        await db.commit()
    return {"message": "Si el correo electrónico existe, se ha enviado un enlace de recuperación."}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.reset_password_token == data.token))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="Token de restablecimiento inválido o expirado.")
    
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_password_token = None
    await db.commit()
    return {"message": "Contraseña restablecida exitosamente."}

@router.get("/me", response_model=UserProfile)
async def get_me(tenant: TenantContext = Depends(get_current_tenant), db: AsyncSession = Depends(get_db)):
    user_res = await db.execute(select(UserModel).where(UserModel.id == tenant.user_id))
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == tenant.company_id))
    company = comp_res.scalars().first()

    return UserProfile(
        id=user.id,
        company_id=user.company_id,
        company_name=company.name if company else "Empresa",
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        permissions=user.permissions or [],
        onboarding_completed=company.onboarding_completed if company else True,
        currency=company.currency if company else "EUR",
        country=company.country if company else "España",
        timezone=company.timezone if company else "Europe/Madrid",
        plan=company.plan if company else "Starter",
        subscription_status=company.subscription_status if company else "trial"
    )

@router.put("/company-settings")
async def update_company_settings(
    data: CompanyUpdateSettings,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == tenant.company_id))
    company = comp_res.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada.")

    if data.name is not None: company.name = data.name
    if data.tax_id is not None: company.tax_id = data.tax_id
    if data.phone is not None: company.phone = data.phone
    if data.address is not None: company.address = data.address
    if data.logo_url is not None: company.logo_url = data.logo_url
    if data.currency is not None: company.currency = data.currency
    if data.default_vat_rate is not None: company.default_vat_rate = data.default_vat_rate
    if data.onboarding_completed is not None: company.onboarding_completed = data.onboarding_completed

    await db.commit()
    return {"message": "Configuración de empresa actualizada correctamente."}
