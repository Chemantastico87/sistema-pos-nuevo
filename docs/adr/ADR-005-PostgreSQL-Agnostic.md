# ADR-005: Abstracción PostgreSQL Agnóstica e Índices GIN pg_trgm

## Estatus
Aceptado

## Contexto
El sistema POS SaaS administra inventarios masivos (>20,000 productos por tenant). Las búsquedas por nombre, código de barras o SKU en servidor deben resolverse en <50 ms.

## Decisión
Usar **PostgreSQL 16** con la extensión `pg_trgm` e índices **GIN (Generalized Inverted Index)** sobre campos trigrama (`name`, `barcode`, `sku`).

### Multi-Tenancy Agnóstico
- El aislamiento de datos se gestiona lógicamente mediante `company_id` en todas las tablas transaccionales.
- Abstracción mediante SQLAlchemy 2.0 Async ORM para permitir migración entre proveedores cloud (AWS RDS, DigitalOcean Managed DB, Railway PostgreSQL, VPS propios).

## Consecuencias
- Búsqueda difusa (fuzzy search) extremadamente rápida en servidor.
- Independencia total del proveedor de nube (cloud agnostic).
