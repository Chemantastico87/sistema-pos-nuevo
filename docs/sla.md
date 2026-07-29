# Especificación de Objetivos SLA & Métricas de Éxito

| Métrica / Operación | Objetivo SLA | Mecanismo de Verificación |
| :--- | :--- | :--- |
| **Inicio de Sesión (Auth JWT)** | < 500 ms | Token JWT ligero con PyJWT + Bcrypt/Argon2 optimizado |
| **Carga inicial del Dashboard** | < 1,0 s | Cache local + WebSocket delta update |
| **Carga e inicialización del POS** | < 800 ms | Pre-carga de catálogo Dexie.js en IndexedDB |
| **Búsqueda local (IndexedDB + Fuse.js)** | < 10 ms | Índice en memoria local (<20k productos) |
| **Búsqueda en servidor (PostgreSQL GIN `pg_trgm`)** | < 50 ms | Trigram GIN index en DB Postgres (>20k productos) |
| **Crear y procesar venta** | < 150 ms | Checkout asíncrono + EventBus pub/sub |
| **Impresión de ticket térmico WebDirect** | < 2,0 s | Comandos raw ESC/POS vía WebUSB/WebBluetooth |
| **Sincronización offline al reconectar** | < 5,0 s | Batch sync con cola transaccional idempotente |
| **Disponibilidad del Sistema (Uptime)** | 99.9 % | Healthcheck endpoint `/health` y auto-heal Docker |
| **Cobertura de Pruebas (Unit + Integration + E2E)** | > 80 % | Pytest-cov + Playwright Coverage |
| **Puntuación Lighthouse (PWA & Performance)** | > 95 | Audits automáticos en CI pipeline |
| **Tiempo de Build (CI/CD Pipeline)** | < 5 min | Docker cache & Turbo/Vite bundling |
| **Tiempo de Despliegue (Production Release)** | < 3 min | Continuous Deployment automatizado |
