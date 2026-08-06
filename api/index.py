import sys
import os
from urllib.parse import urlparse

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for d in [backend_dir, root_dir, current_dir]:
    if os.path.exists(d) and d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.main import app as fastapi_app
except Exception:
    try:
        from backend.app.main import app as fastapi_app
    except Exception:
        import app.main as app_main
        fastapi_app = app_main.app

class VercelURLNormalizerMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            current_path = scope.get("path", "")
            
            raw_url = None
            for key in [b"x-real-url", b"x-forwarded-uri", b"x-matched-path", b"x-invoke-path"]:
                if key in headers:
                    val = headers[key].decode("utf-8", errors="ignore")
                    if val and "[...path]" not in val and val != "/api/index.py":
                        raw_url = val
                        break

            if raw_url:
                parsed_path = urlparse(raw_url).path
                if parsed_path:
                    scope["path"] = parsed_path

        await self.app(scope, receive, send)

app = VercelURLNormalizerMiddleware(fastapi_app)
