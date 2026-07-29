# ADR-001: FastAPI para el Backend Asíncrono Multi-Tenant

## Estatus
Aceptado

## Contexto
El sistema POS SaaS requiere un backend de alto rendimiento capaz de procesar transacciones en menos de 150 ms, manejar conexiones WebSocket en tiempo real para dashboards multi-tenant y validar contratos de datos de manera estricta.

## Decisión
Adoptar **FastAPI** con **Python 3.12+**, **SQLAlchemy 2.0 Async** y **Pydantic v2**.

### Razones
1. **Rendimiento Asíncrono**: Basado en Starlette y `asyncio`, alcanzando latencias mínimas aptas para POS comercial.
2. **Validación Automática Pydantic v2**: Serialización rápida en C (Rust underlying Pydantic V2 engine) y validación de tipos estricta.
3. **OpenAPI Nativo**: Generación automática de especificación Swagger/OpenAPI v1 para consumo por el frontend en TypeScript.
4. **WebSocket Nativo**: Soporte nativo para WebSockets sin necesidad de proxies adicionales en desarrollo.

## Consecuencias
- Todo el I/O a base de datos y servicios externos debe ser asíncrono (`async`/`await`).
- Los modelos Pydantic v2 se usan para DTOs y schemas REST.
