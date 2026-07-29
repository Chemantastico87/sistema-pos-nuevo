# ADR-006: Contenerización Docker Multi-Cloud y Pipeline CI/CD

## Estatus
Aceptado

## Contexto
Se requiere un empaquetado homogéneo y un proceso de integración/despliegue continuo que garantice tiempos de build <5 min y despliegues <3 min sin caídas de servicio.

## Decisión
Contenerizar el backend FastAPI y el frontend Nginx PWA con **Docker Multi-Stage Build** y orquestación **Docker Compose** en desarrollo e imágenes OCI para producción.

### CI/CD Pipeline (GitHub Actions)
1. **Lint & Static Analysis**: Ruff (Backend), ESLint (Frontend).
2. **Automated Unit & Integration Tests**: Pytest en backend.
3. **E2E Tests**: Playwright en contenedores sin cabeza (headless).
4. **Build & Release**: Compilación multi-etapa e imagen liviana.

## Consecuencias
- Despliegues deterministas e independientes de la plataforma anfitriona.
