import sys
import os

# Determinar ruta absoluta al directorio backend en Vercel Serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
