import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.websockets import ws_manager
from app.api.v1.router import api_v1_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("POS_SaaS_Main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    logger.info("🚀 Inicializando base de datos y creando tablas en segundo plano...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Base de datos inicializada correctamente.")

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}

@app.websocket("/ws/{company_id}")
async def websocket_endpoint(websocket: WebSocket, company_id: str):
    await ws_manager.connect(company_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Escucha nativa de mensajes WebSocket
    except WebSocketDisconnect:
        ws_manager.disconnect(company_id, websocket)

app.include_router(api_v1_router)
