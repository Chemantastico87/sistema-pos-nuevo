"""
Generador de Contrato OpenAPI (JSON) a partir de la app FastAPI.
"""
import json
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app

def generate():
    openapi_schema = app.openapi()
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "openapi.json"))
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2, ensure_ascii=False)
    print(f"[OK] Esquema OpenAPI exportado correctamente en: {output_path}")

if __name__ == "__main__":
    generate()
