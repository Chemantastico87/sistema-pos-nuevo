from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token

security = HTTPBearer()

class TenantContext:
    def __init__(self, user_id: str, company_id: str, permissions: list[str]):
        self.user_id = user_id
        self.company_id = company_id
        self.permissions = permissions

async def get_current_tenant(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TenantContext:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        company_id: str = payload.get("company_id")
        permissions: list[str] = payload.get("permissions", [])
        
        if not user_id or not company_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de autenticación inválido o incompleto."
            )
        return TenantContext(user_id=user_id, company_id=company_id, permissions=permissions)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar las credenciales de acceso."
        )
