import uuid
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, update

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_verification_token,
    create_password_reset_token,
    decode_access_token,
    validate_password_complexity
)
from app.core.email_service import EmailService
from app.core.tenant import TenantContext, get_current_tenant
from app.core.permissions import ALL_ADMIN_PERMISSIONS
from app.domains.auth.models import CompanyModel, UserModel, RefreshTokenModel, UserSessionModel, AuditLogModel
from app.domains.auth.schemas import (
    CompanyRegisterRequest,
    LoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    DirectResetPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    RefreshTokenRequest,
    UserProfile,
    UserSessionResponse,
    CompanyUpdateSettings
)
from app.domains.cash.models import CashRegisterModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

def extract_client_info(request: Request):
    ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")
    return ip, user_agent

@router.get("/system-status")
async def get_system_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanyModel))
    has_companies = result.scalars().first() is not None
    return {"has_companies": has_companies, "status": "operational"}

@router.post("/register", response_model=TokenResponse)
@router.post("/register/", response_model=TokenResponse)
async def register_company(
    data: CompanyRegisterRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    if not data.terms_accepted:
        raise HTTPException(status_code=400, detail="validation.terms_required")

    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="errors.passwords_do_not_match")

    # Validación de fortaleza y complejidad de la contraseña
    is_valid, msg = validate_password_complexity(data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    # Comprobar si ya existe una empresa con ese correo corporativo
    existing_comp = await db.execute(select(CompanyModel).where(CompanyModel.email == data.email))
    if existing_comp.scalars().first():
        raise HTTPException(status_code=400, detail="errors.company_exists")

    company_id = f"comp_{uuid.uuid4().hex[:12]}"
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    cash_id = f"cash_{uuid.uuid4().hex[:12]}"
    ip, user_agent = extract_client_info(request)

    # TRANSACCIÓN ATÓMICA DE REGISTRO
    try:
        # 1. Crear Empresa
        new_company = CompanyModel(
            id=company_id,
            name=data.company_name,
            email=data.email,
            country=data.country,
            currency=data.currency,
            timezone=data.timezone,
            onboarding_completed=True,
            plan="Starter",
            subscription_status="trial",
            subscription_expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=14),
            max_users=5,
            max_products=500
        )
        db.add(new_company)

        # 2. Token de Verificación de Correo
        verif_token = create_verification_token(user_id, data.email)

        # 3. Crear Usuario Administrador (Inicialmente pending_email)
        new_user = UserModel(
            id=user_id,
            company_id=company_id,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            full_name=data.owner_name,
            role="admin",
            status="active",
            is_active=True,
            permissions=ALL_ADMIN_PERMISSIONS,
            email_verified=True,
            verification_token=verif_token
        )
        db.add(new_user)

        # 4. Crear Caja Principal
        new_cash = CashRegisterModel(
            id=cash_id,
            company_id=company_id,
            user_id=user_id,
            name="Caja Principal",
            status="closed",
            opening_balance=0.00
        )
        db.add(new_cash)

        # 5. Registro de Auditoría
        audit = AuditLogModel(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            company_id=company_id,
            user_id=user_id,
            event_type="register",
            ip_address=ip,
            user_agent=user_agent,
            details={"company_name": data.company_name, "owner": data.owner_name}
        )
        db.add(audit)

        # Guardar todos los cambios dentro de la transacción
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al registrar empresa: {str(e)}")

    # 6. Enviar Correo de Bienvenida y Verificación de Email en segundo plano
    verif_url = f"{request.base_url}auth/verify-email?token={verif_token}"
    background_tasks.add_task(
        EmailService.send_welcome_verification_email,
        to_email=data.email,
        full_name=data.owner_name,
        company_name=data.company_name,
        verification_url=verif_url,
        plan_name="Starter",
        trial_days=14
    )

    # 7. Crear Refresh Token de sesión inicial
    ref_token_val = f"ref_{uuid.uuid4().hex}"
    refresh_token = RefreshTokenModel(
        id=f"rt_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        token=ref_token_val,
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=30)
    )
    db.add(refresh_token)
    await db.commit()

    token = create_access_token(
        subject=user_id,
        company_id=company_id,
        permissions=ALL_ADMIN_PERMISSIONS
    )

    return TokenResponse(
        access_token=token,
        refresh_token=ref_token_val,
        user_id=user_id,
        company_id=company_id,
        full_name=data.owner_name,
        role="admin",
        status="active",
        email_verified=True,
        permissions=ALL_ADMIN_PERMISSIONS,
        onboarding_completed=True,
        currency=data.currency,
        plan="Starter",
        subscription_status="trial"
    )

@router.post("/login", response_model=TokenResponse)
@router.post("/login/", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    ip, user_agent = extract_client_info(request)

    # Buscar usuario por correo electrónico
    result = await db.execute(select(UserModel).where(UserModel.email == data.email))
    user = result.scalars().first()

    # NUNCA revelar si el correo existe o no para prevenir ataques de enumeración
    if not user:
        raise HTTPException(status_code=401, detail="errors.invalid_credentials")

    # Control de bloqueo de seguridad por demasiados intentos fallidos
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    if user.locked_until and user.locked_until > now_utc:
        raise HTTPException(
            status_code=403,
            detail="Cuenta bloqueada por seguridad debido a múltiples intentos fallidos. Intente más tarde."
        )

    # VERIFICACIÓN ESTRICTA DE CONTRASEÑA (ARGON2ID / BCRYPT HASH VERIFY)
    if not verify_password(data.password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        
        # Auditoría de Intento Fallido
        audit = AuditLogModel(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            company_id=user.company_id,
            user_id=user.id,
            event_type="login_failed",
            ip_address=ip,
            user_agent=user_agent,
            details={"attempt_count": user.failed_login_attempts}
        )
        db.add(audit)

        # Si alcanza 5 intentos fallidos, se bloquea la cuenta por 15 minutos
        if user.failed_login_attempts >= 5:
            user.locked_until = now_utc + timedelta(minutes=15)
            user.status = "blocked"
            
            # Notificación por correo de alerta de bloqueo
            background_tasks.add_task(
                EmailService.send_account_locked_email,
                to_email=user.email,
                full_name=user.full_name,
                ip_address=ip,
                date_str=now_utc.strftime("%d/%m/%Y %H:%M:%S UTC")
            )
        
        await db.commit()
        raise HTTPException(status_code=401, detail="errors.invalid_credentials")

    # Verificar estado de activación y verificación de correo
    if not user.email_verified or user.status == "pending_email":
        raise HTTPException(
            status_code=403,
            detail="Debes verificar tu dirección de correo electrónico antes de acceder."
        )

    if user.status in ["blocked", "suspended", "deleted"] or not user.is_active:
        raise HTTPException(status_code=403, detail="Tu cuenta se encuentra inactiva o suspendida.")

    # Restablecer contador de intentos fallidos al tener éxito
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = now_utc

    # Cargar Empresa del Usuario
    comp_result = await db.execute(select(CompanyModel).where(CompanyModel.id == user.company_id))
    company = comp_result.scalars().first()

    # Generar Refresh Token y registrar Sesión de Usuario en Base de Datos
    ref_token_val = f"ref_{uuid.uuid4().hex}"
    ref_hash = hashlib.sha256(ref_token_val.encode()).hexdigest()

    refresh_token_entry = RefreshTokenModel(
        id=f"rt_{uuid.uuid4().hex[:12]}",
        user_id=user.id,
        token=ref_token_val,
        expires_at=now_utc + timedelta(days=30)
    )
    db.add(refresh_token_entry)

    session_entry = UserSessionModel(
        id=f"sess_{uuid.uuid4().hex[:12]}",
        user_id=user.id,
        refresh_token_hash=ref_hash,
        ip_address=ip,
        user_agent=user_agent,
        os_name="Desconocido",
        device_type="Navegador Web",
        expires_at=now_utc + timedelta(days=30),
        is_active=True
    )
    db.add(session_entry)

    # Auditoría de Login Exitoso
    audit_success = AuditLogModel(
        id=f"audit_{uuid.uuid4().hex[:12]}",
        company_id=user.company_id,
        user_id=user.id,
        event_type="login_success",
        ip_address=ip,
        user_agent=user_agent
    )
    db.add(audit_success)

    try:
        await db.commit()
    except Exception as e:
        logger.warning(f"⚠️ Nota de sesión/auditoría login: {e}")

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
        status=user.status,
        email_verified=user.email_verified,
        permissions=user.permissions or [],
        onboarding_completed=company.onboarding_completed if company else True,
        currency=company.currency if company else "EUR",
        plan=company.plan if company else "Starter",
        subscription_status=company.subscription_status if company else "trial"
    )

@router.post("/verify-email")
async def verify_email(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_access_token(data.token)
        if payload.get("type") != "email_verification":
            raise HTTPException(status_code=400, detail="Token de verificación inválido.")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=400, detail="El enlace de verificación ha expirado o es inválido.")

    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    user.email_verified = True
    user.status = "active"
    user.verification_token = None
    await db.commit()

    return {"message": "Correo electrónico verificado exitosamente. Ya puedes iniciar sesión."}

@router.post("/resend-verification")
async def resend_verification(
    data: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserModel).where(UserModel.email == data.email))
    user = result.scalars().first()
    if not user:
        return {"message": "Si la cuenta existe, se ha reenviado el correo de verificación."}

    if user.email_verified and user.status == "active":
        return {"message": "Este correo electrónico ya se encuentra verificado."}

    verif_token = create_verification_token(user.id, user.email)
    user.verification_token = verif_token
    await db.commit()

    comp_result = await db.execute(select(CompanyModel).where(CompanyModel.id == user.company_id))
    company = comp_result.scalars().first()

    verif_url = f"{request.base_url}auth/verify-email?token={verif_token}"
    background_tasks.add_task(
        EmailService.send_welcome_verification_email,
        to_email=user.email,
        full_name=user.full_name,
        company_name=company.name if company else "VENDIX Commercial",
        verification_url=verif_url
    )

    return {"message": "Se ha reenviado el enlace de verificación a tu correo electrónico."}

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserModel).where(UserModel.email == data.email))
    user = result.scalars().first()

    if user:
        reset_token = create_password_reset_token(user.id, user.email)
        user.reset_password_token = reset_token
        await db.commit()

        reset_url = f"{request.base_url}auth/reset-password?token={reset_token}"
        background_tasks.add_task(
            EmailService.send_password_reset_email,
            to_email=user.email,
            full_name=user.full_name,
            reset_url=reset_url
        )

    return {"message": "Si tu correo se encuentra registrado, recibirás un mensaje con las instrucciones de recuperación."}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_access_token(data.token)
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Token de restablecimiento inválido.")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=400, detail="El token de restablecimiento ha expirado o es inválido.")

    # Validar complejidad de nueva contraseña
    is_valid, msg = validate_password_complexity(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    user.hashed_password = get_password_hash(data.new_password)
    user.reset_password_token = None
    user.failed_login_attempts = 0
    user.locked_until = None
    if user.status == "blocked":
        user.status = "active"
    await db.commit()

    return {"message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave."}

@router.post("/direct-reset-password")
async def direct_reset_password(data: DirectResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden.")

    is_valid, msg = validate_password_complexity(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    result = await db.execute(select(UserModel).where(UserModel.email == data.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="No se encontró ninguna cuenta registrada con este correo electrónico.")

    user.hashed_password = get_password_hash(data.new_password)
    user.reset_password_token = None
    user.failed_login_attempts = 0
    user.locked_until = None
    user.status = "active"
    user.email_verified = True
    user.is_active = True
    await db.commit()

    return {"message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave."}

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RefreshTokenModel).where(RefreshTokenModel.token == data.refresh_token))
    ref_obj = result.scalars().first()

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    if not ref_obj or ref_obj.expires_at < now_utc:
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado.")

    user_result = await db.execute(select(UserModel).where(UserModel.id == ref_obj.user_id))
    user = user_result.scalars().first()
    if not user or not user.is_active or user.status != "active":
        raise HTTPException(status_code=401, detail="Usuario inactivo o suspendido.")

    # ROTACIÓN DE REFRESH TOKEN (Invalida el anterior y genera uno nuevo)
    await db.delete(ref_obj)
    
    new_ref_val = f"ref_{uuid.uuid4().hex}"
    new_ref_obj = RefreshTokenModel(
        id=f"rt_{uuid.uuid4().hex[:12]}",
        user_id=user.id,
        token=new_ref_val,
        expires_at=now_utc + timedelta(days=30)
    )
    db.add(new_ref_obj)
    await db.commit()

    comp_result = await db.execute(select(CompanyModel).where(CompanyModel.id == user.company_id))
    company = comp_result.scalars().first()

    new_access_token = create_access_token(
        subject=user.id,
        company_id=user.company_id,
        permissions=user.permissions or []
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_ref_val,
        user_id=user.id,
        company_id=user.company_id,
        full_name=user.full_name,
        role=user.role,
        status=user.status,
        email_verified=user.email_verified,
        permissions=user.permissions or [],
        onboarding_completed=company.onboarding_completed if company else True,
        currency=company.currency if company else "EUR",
        plan=company.plan if company else "Starter",
        subscription_status=company.subscription_status if company else "trial"
    )

@router.post("/logout")
async def logout(
    data: RefreshTokenRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    # Eliminar Refresh Token
    result = await db.execute(select(RefreshTokenModel).where(RefreshTokenModel.token == data.refresh_token))
    ref_obj = result.scalars().first()
    if ref_obj:
        await db.delete(ref_obj)

    # Inactivar sesiones
    ref_hash = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    await db.execute(
        update(UserSessionModel)
        .where(UserSessionModel.user_id == tenant.user_id)
        .where(UserSessionModel.refresh_token_hash == ref_hash)
        .values(is_active=False)
    )

    # Registro Auditoría
    audit = AuditLogModel(
        id=f"audit_{uuid.uuid4().hex[:12]}",
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        event_type="logout"
    )
    db.add(audit)

    await db.commit()
    return {"message": "Sesión cerrada correctamente."}

@router.get("/me", response_model=UserProfile)
async def get_me(
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    user_res = await db.execute(select(UserModel).where(UserModel.id == tenant.user_id))
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == tenant.company_id))
    company = comp_res.scalars().first()

    return UserProfile(
        id=user.id,
        company_id=company.id,
        company_name=company.name,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        status=user.status,
        email_verified=user.email_verified,
        permissions=user.permissions or [],
        onboarding_completed=company.onboarding_completed,
        currency=company.currency,
        country=company.country,
        timezone=company.timezone,
        plan=company.plan,
        subscription_status=company.subscription_status
    )

@router.put("/company-settings")
@router.put("/company-settings/")
async def update_company_settings(
    data: CompanyUpdateSettings,
    tenant: TenantContext = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    comp_res = await db.execute(select(CompanyModel).where(CompanyModel.id == tenant.company_id))
    company = comp_res.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    if data.name is not None:
        company.name = data.name
    if data.tax_id is not None:
        company.tax_id = data.tax_id
    if data.phone is not None:
        company.phone = data.phone
    if data.address is not None:
        company.address = data.address
    if data.logo_url is not None:
        company.logo_url = data.logo_url
    if data.currency is not None:
        company.currency = data.currency
    if data.default_vat_rate is not None:
        company.default_vat_rate = data.default_vat_rate
    if data.onboarding_completed is not None:
        company.onboarding_completed = data.onboarding_completed

    await db.commit()
    await db.refresh(company)

    return {
        "message": "Configuración de la empresa actualizada correctamente",
        "company_id": company.id,
        "onboarding_completed": company.onboarding_completed
    }

