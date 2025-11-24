"""Top-level shim to re-export FastAPI `app` from the backend package.

This allows running `uvicorn voice_server:app` from the project root.
"""
from backend.voice_server import app

__all__ = ["app"]
