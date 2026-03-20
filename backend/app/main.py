from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.db import init_db
from app.routes.ai import router as ai_router
from app.routes.chat import router as chat_router
from app.routes.sessions import router as sessions_router


app = FastAPI(title="Career Guidance AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


app.include_router(ai_router)
app.include_router(chat_router)
app.include_router(sessions_router)

