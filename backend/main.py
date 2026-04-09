from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routes import auth, ingest, stream, events, explain, settings

init_db()

app = FastAPI(title="AgentLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["auth"])
app.include_router(ingest.router, tags=["ingest"])
app.include_router(stream.router, tags=["stream"])
app.include_router(events.router, tags=["events", "sessions"])
app.include_router(explain.router, tags=["explain"])
app.include_router(settings.router, tags=["settings", "metrics"])

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(frontend_dist):
    assets_path = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        path = os.path.join(frontend_dist, full_path)
        if os.path.exists(path) and os.path.isfile(path):
            return FileResponse(path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
