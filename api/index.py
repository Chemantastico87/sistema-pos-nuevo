import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for d in [backend_dir, root_dir, current_dir]:
    if os.path.exists(d) and d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.main import app
except Exception:
    try:
        from backend.app.main import app
    except Exception:
        import app.main as app_main
        app = app_main.app
