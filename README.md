# Sistema POS SaaS Comercial v5 (Multi-Tenant, Event-Driven, Clean Architecture)

Sistema Punto de Venta (POS) SaaS comercial ultra-rápido (<15s por venta), multi-tenant, responsive y PWA instalable.

## 🚀 Tecnologías Principales
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0 Async, Pydantic v2, PostgreSQL 16 (con `pg_trgm` & GIN Indexes).
- **Frontend**: React 19, TypeScript, Vite, Dexie.js (IndexedDB Offline-First), Fuse.js (Búsqueda en memoria <10ms), WebUSB/WebBluetooth Direct Thermal Print.
- **Arquitectura**: Monolito Modular Event-Driven, Clean Architecture, SOLID.
- **Calidad & Pruebas**: Pytest (Backend Unit & Integration) + Playwright (Frontend E2E).

## 🛠️ Ejecución con Docker Compose
```bash
docker compose up -d --build
```
- Backend API: http://localhost:8000/docs
- Frontend POS: http://localhost

## 📄 Documentación ADR & Eventos
Consulte la carpeta `docs/adr/` y `docs/events_catalog.md`.
