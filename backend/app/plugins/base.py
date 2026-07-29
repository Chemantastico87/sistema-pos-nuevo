from abc import ABC, abstractmethod
from typing import Dict, List, Any
from fastapi import FastAPI
from app.core.events import EventBus

class PluginManifest:
    def __init__(self, plugin_id: str, name: str, version: str, description: str, dependencies: List[str] = []):
        self.plugin_id = plugin_id
        self.name = name
        self.version = version
        self.description = description
        self.dependencies = dependencies

class PluginInterface(ABC):
    @property
    @abstractmethod
    def manifest(self) -> PluginManifest:
        pass

    @abstractmethod
    def register_routes(self, app: FastAPI):
        """Inyección de endpoints REST bajo /api/v1/plugins/{plugin_id}/"""
        pass

    @abstractmethod
    def register_permissions(self) -> List[str]:
        """Declaración de permisos específicos asignables en RBAC"""
        pass

    @abstractmethod
    def register_menu_items(self) -> List[Dict[str, Any]]:
        """Elementos dinámicos de menú para la interfaz de React"""
        pass

    @abstractmethod
    def subscribe_events(self, event_bus: EventBus):
        """Escucha de eventos del núcleo"""
        pass

    @abstractmethod
    def safe_uninstall(self):
        """Desactivación segura ocultando rutas y menús sin eliminar datos"""
        pass
