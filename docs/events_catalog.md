# Catálogo de Eventos del Sistema (Event-Driven Architecture)

## 1. Ciclo de Vida de Venta: `SaleCreated`
**Emisor:** `POS Module`  
**Momento:** Inmediatamente después de validar el pago e insertar la venta.

```json
{
  "event_id": "evt_987654321",
  "event_name": "SaleCreated",
  "company_id": "comp_12345",
  "timestamp": "2026-07-29T16:45:00Z",
  "payload": {
    "sale_id": "sale_abc123",
    "invoice_number": "INV-000102",
    "total": 150.50,
    "payment_method": "cash",
    "cash_register_id": "cash_001",
    "user_id": "usr_99",
    "items": [
      {
        "product_id": "prod_1",
        "quantity": 2,
        "unit_price": 50.00
      },
      {
        "product_id": "prod_2",
        "quantity": 1,
        "unit_price": 50.50
      }
    ]
  }
}
```

### Suscriptores y Acciones
1. `[Inventory Module]`: Ejecuta `UpdatesStock` para cada producto vendido.
2. `[Cash Module]`: Ejecuta `CreatesCashMovement` asociando la entrada de dinero a la caja abierta.
3. `[Ticket Module]`: Prepara `GeneratesReceipt` para comando térmico ESC/POS.
4. `[Audit Module]`: Ejecuta `RecordsAuditDiff` guardando el resumen transaccional.
5. `[WebSocket Core]`: Ejecuta `BroadcastsDashboardUpdate` a la sala del tenant.
6. `[Telemetry Module]`: Captura latencia de checkout `CapturesSaleLatency`.

---

## 2. Ciclo de Vida de Producto: `ProductUpdated`
**Emisor:** `Product Module`  
**Momento:** Al modificar precio, datos o stock inicial de un producto.

### Suscriptores y Acciones
1. `[Index Core]`: Reconstruye índice en memoria local Dexie/Fuse y PostgreSQL `pg_trgm`.
2. `[Cache Core]`: Invalida caché de catálogo de productos.
3. `[Audit Module]`: Registra la diferencia de precio o datos (`RecordsPriceOrStockDiff`).

---

## 3. Ciclo de Vida de Caja: `CashRegisterOpened` / `CashRegisterClosed`
**Emisor:** `Cash Module`  
**Momento:** Al realizar la apertura o el arqueo/cierre de la caja registradora.

### Suscriptores y Acciones
1. `[Audit Module]`: Registra la diferencia de arqueo (sobrante/faltante) (`RecordsRegisterCloseDiff`).
2. `[Notification Core]`: Dispara alerta si la discrepancia supera el umbral configurado.
3. `[WebSocket Core]`: Actualiza el widget de estado de caja en el Dashboard en vivo.
