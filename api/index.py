import sys
import os

# Añadir directorio backend al PATH de Python en Vercel
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
