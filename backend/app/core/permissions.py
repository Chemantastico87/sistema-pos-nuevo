from fastapi import HTTPException, status, Depends
from app.core.tenant import TenantContext, get_current_tenant

ALL_ADMIN_PERMISSIONS = [
    "admin",
    "can_change_price",
    "can_delete_sale",
    "can_open_cash_register",
    "can_reopen_cash_register",
    "can_view_profit",
    "can_manage_inventory",
    "can_manage_users",
    "can_manage_settings",
    "can_export_reports",
    "can_manage_subscriptions",
    "can_access_api"
]

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
