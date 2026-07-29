from fastapi import HTTPException, status, Depends
from app.core.tenant import TenantContext, get_current_tenant

def require_permission(permission_name: str):
    def permission_checker(tenant: TenantContext = Depends(get_current_tenant)):
        # El rol de admin posee todos los permisos automáticamente
        if "admin" in tenant.permissions or permission_name in tenant.permissions:
            return tenant
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permiso denegado: se requiere '{permission_name}'"
        )
    return permission_checker
