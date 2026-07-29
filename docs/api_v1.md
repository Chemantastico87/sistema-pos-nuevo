# Especificación REST OpenAPI v1

Todos los endpoints requieren la cabecera `Authorization: Bearer <token>` excepto `/api/v1/auth/login`.

## Endpoints Principales

### Auth
- `POST /api/v1/auth/login`: Autenticación de usuario, retorna JWT token y permisos.
- `GET /api/v1/auth/me`: Perfil de usuario autenticado y empresa activa.

### Productos
- `GET /api/v1/products`: Lista paginada con filtro trigrama `?search=...`.
- `POST /api/v1/products`: Alta de producto.
- `PUT /api/v1/products/{id}`: Edición de producto y actualización de stock/precio.

### Clientes
- `GET /api/v1/customers`: Búsqueda de clientes por teléfono/nombre.
- `POST /api/v1/customers`: Alta de cliente.

### POS & Ventas
- `POST /api/v1/pos/checkout`: Creación de venta en tiempo real.
- `POST /api/v1/pos/sync`: Sincronización batch de ventas creadas offline.

### Caja Registradora
- `GET /api/v1/cash/current`: Estado actual de caja abierta.
- `POST /api/v1/cash/open`: Apertura de caja con monto inicial.
- `POST /api/v1/cash/close`: Arqueo y cierre de caja registradora.

### Auditoría & Tickets
- `GET /api/v1/audit/logs`: Historial de logs de auditoría con diff tracking.
- `GET /api/v1/tickets/template`: Plantilla de ticket para formateo ESC/POS.
