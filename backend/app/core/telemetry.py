import time
import logging

logger = logging.getLogger("Telemetry")

def capture_sale_latency(sale_id: str, duration_ms: float):
    logger.info(f"⏱️ Telemetría Venta [{sale_id}]: Checkout completado en {duration_ms:.2f} ms")
