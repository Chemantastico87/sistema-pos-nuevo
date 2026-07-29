from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.core.tenant import TenantContext, get_current_tenant
from app.domains.auth.models import UserModel
from app.domains.auth.schemas import LoginRequest, TokenResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == data.email))
    user = result.scalars().first()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo."
        )
    
    token = create_access_token(
        subject=user.id,
        company_id=user.company_id,
        permissions=user.permissions or []
    )
    
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        company_id=user.company_id,
        full_name=user.full_name,
        role=user.role,
        permissions=user.permissions or []
    )

@router.get("/me", response_model=UserProfile)
async def get_me(tenant: TenantContext = Depends(get_current_tenant), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.id == tenant.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UserProfile(
        id=user.id,
        company_id=user.company_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        permissions=user.permissions or []
    )
