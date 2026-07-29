from typing import Dict, List
from fastapi import WebSocket
import logging

logger = logging.getLogger("WebSocketManager")

class ConnectionManager:
    def __init__(self):
        # Mapeo: company_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, company_id: str, websocket: WebSocket):
        await websocket.accept()
        if company_id not in self.active_connections:
            self.active_connections[company_id] = []
        self.active_connections[company_id].append(websocket)
        logger.info(f"🔌 Cliente WebSocket conectado para empresa {company_id}")

    def disconnect(self, company_id: str, websocket: WebSocket):
        if company_id in self.active_connections:
            if websocket in self.active_connections[company_id]:
                self.active_connections[company_id].remove(websocket)

    async def broadcast_to_tenant(self, company_id: str, message: dict):
        if company_id in self.active_connections:
            for connection in self.active_connections[company_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error enviando WebSocket a tenant {company_id}: {e}")

ws_manager = ConnectionManager()
