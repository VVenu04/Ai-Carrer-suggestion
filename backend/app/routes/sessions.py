from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.db.repositories import get_session


router = APIRouter(prefix="/api", tags=["sessions"])


@router.get("/sessions/{session_id}")
async def fetch_session(session_id: str) -> Dict[str, Any]:
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session

