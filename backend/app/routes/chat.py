from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.db.repositories import add_chat_message, get_chat_history, get_session
from app.models.schemas import ChatRequest, ChatResponse
from app.services.career_prompt import build_chat_messages
from app.services.openrouter_client import create_chat_completion


router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    session = get_session(req.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    student_answers: Dict[str, Any] = session.get("student_answers", {})
    ai_response: Dict[str, Any] = session.get("ai_response", {})

    # Load prior chat history for context (do not duplicate the new user message).
    chat_history: List[Dict[str, Any]] = get_chat_history(req.sessionId, limit=12)

    # Persist user message (used for future requests + UI).
    add_chat_message(req.sessionId, role="user", content=req.message)

    messages = build_chat_messages(
        language=req.language,
        student_answers=student_answers,
        careers_json=ai_response,
        chat_history=chat_history,
        user_message=req.message,
    )

    try:
        reply = await create_chat_completion(messages=messages, max_tokens=700)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI call failed: {e}")

    # Store assistant reply.
    add_chat_message(req.sessionId, role="assistant", content=reply)

    return ChatResponse(sessionId=req.sessionId, reply=reply)

