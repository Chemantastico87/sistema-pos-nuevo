# ADR-002: Arquitectura Monolito Modular Delimitado por Dominios

## Estatus
Aceptado

## Contexto
Se requiere evitar la complejidad operativa de despliegue y latencia de red de los microservicios en V1, pero manteniendo alta cohesión y bajo acoplamiento para evolucionar sin deuda técnica.

## Decisión
Adoptar la arquitectura **Modular Monolith** basada en Dominios DDD (Auth, Products, Customers, POS, Cash, Inventory, Tickets, Audit).

### Principios del Monolito Modular
1. **Contextos Delimitados (Bounded Contexts)**: Cada dominio posee sus propios modelos, esquemas, servicios y endpoints.
2. **Acceso entre Dominios**: Queda prohibido importar modelos ORM directos de otros dominios; la comunicación inter-módulo se efectúa mediante interfaces de servicio o el EventBus.
3. **Migración Futura Facil**: Cada dominio puede extraerse a un microservicio independiente en V2/V3 si el tráfico lo requiere.

## Consecuencias
- Estructura limpia y fácil de probar en un solo repositorio backend.
- Menor overhead de infraestructura en comparación con microservicios.
