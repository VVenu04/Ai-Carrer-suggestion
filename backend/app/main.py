from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.db import init_db
from app.routes.ai import router as ai_router
from app.routes.chat import router as chat_router
from app.routes.sessions import router as sessions_router

logger = logging.getLogger(__name__)

app = FastAPI(title="Career Guidance AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    """Fast liveness check for load balancers (Railway, etc.). No DB access."""
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "Career Guidance AI", "docs": "/docs"}


@app.on_event("startup")
def on_startup() -> None:
    try:
        init_db()
    except Exception:
        # Still bind the server so /health works and logs show the real error.
        logger.exception("init_db failed — session/chat DB features may be broken")


app.include_router(ai_router)
app.include_router(chat_router)
app.include_router(sessions_router)

