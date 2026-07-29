# ADR-003: Bus de Eventos Interno para Arquitectura Event-Driven

## Estatus
Aceptado

## Contexto
Operaciones como la creación de una venta (`SaleCreated`) desencadenan efectos secundarios en múltiples dominios (descontar inventario, crear movimiento de caja, generar ticket, registrar auditoría, transmitir actualización por WebSocket y registrar telemetría). Acoplar estas llamadas de forma síncrona degradaría la latencia por debajo del SLA (<150ms).

## Decisión
Implementar un **EventBus asíncrono en memoria** dentro del núcleo de FastAPI.

### Mecanismo
- Publicación no bloqueante con `await event_bus.publish(event_name, payload)`.
- Manejadores de eventos registrados por suscripción en cada dominio durante la inicialización de la app.
- En V2/V3, la interfaz `EventBus` puede conectar internamente con RabbitMQ o Redis Streams sin cambiar el código de los dominios.

## Consecuencias
- Desacoplamiento total entre el checkout POS y las tareas secundarias.
- Procesamiento ultra-rápido de ventas.
