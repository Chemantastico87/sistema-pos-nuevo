import asyncio
import logging
from typing import Callable, Dict, List, Any

logger = logging.getLogger("EventBus")

class EventBus:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventBus, cls).__new__(cls)
            cls._instance.subscribers: Dict[str, List[Callable]] = {}
        return cls._instance

    def subscribe(self, event_name: str, handler: Callable):
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        self.subscribers[event_name].append(handler)
        logger.info(f"📢 suscripción a evento: {event_name} -> {handler.__name__}")

    async def publish(self, event_name: str, payload: Dict[str, Any]):
        handlers = self.subscribers.get(event_name, [])
        logger.info(f"🚀 Publicando evento '{event_name}' a {len(handlers)} suscriptores.")
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    asyncio.create_task(handler(payload))
                else:
                    handler(payload)
            except Exception as e:
                logger.error(f"❌ Error en manejador de evento {event_name}: {e}")

event_bus = EventBus()
