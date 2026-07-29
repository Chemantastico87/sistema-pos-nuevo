# ADR-004: Modo Offline Real con IndexedDB (Dexie.js) y Búsqueda Local (Fuse.js)

## Estatus
Aceptado

## Contexto
Los terminales POS en tiendas físicas pueden experimentar caídas de conexión a Internet. El sistema no debe detener la operación de venta bajo ninguna circunstancia.

## Decisión
Adoptar un enfoque **Offline-First** utilizando **Dexie.js** (IndexedDB) para persistencia local de catálogo de productos, clientes y cola de ventas offline, combinado con **Fuse.js** para búsquedas de productos en local en <10 ms.

### Mecanismo de Sincronización
1. **Lectura**: Al iniciar sesión se descarga el catálogo activo y se almacena en Dexie.js.
2. **Venta Offline**: Si no hay conexión HTTP, la venta se firma con UUID v4 y se guarda en la tabla `sync_queue` de Dexie.
3. **Reconexión**: Un listener de red detecta la vuelta a línea y procesa la cola enviando peticiones batch al endpoint `/api/v1/pos/sync` (<5.0s SLA).

## Consecuencias
- Operación ininterrumpida a 0 ms de latencia de red durante contingencias.
- Manejo idempotente de UUIDs en backend para prevenir duplicidad de ventas.
