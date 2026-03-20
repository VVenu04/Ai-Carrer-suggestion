from __future__ import annotations

import json
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from app.models.schemas import (
    CareerSuggestion,
    CareerSuggestionsRequest,
    CareerSuggestionsResponse,
)
from app.services.career_prompt import build_career_suggestions_messages, build_fix_json_messages
from app.services.openrouter_client import create_chat_completion
from app.db.repositories import create_session_record
from app.config import settings


router = APIRouter(prefix="/api", tags=["ai"])


def _extract_json_object(text: str) -> Dict[str, Any]:
    """
    Extracts the first {...} JSON object from a model response.
    """
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Could not find JSON object boundaries in model output.")
    candidate = text[start : end + 1]
    return json.loads(candidate)


def _parse_careers(text: str) -> List[CareerSuggestion]:
    raw = _extract_json_object(text)
    if not isinstance(raw, dict) or "careers" not in raw:
        raise ValueError("JSON object missing required key: careers")
    careers_raw = raw["careers"]
    if not isinstance(careers_raw, list):
        raise ValueError("careers must be an array")

    careers: List[CareerSuggestion] = [CareerSuggestion.model_validate(c) for c in careers_raw]
    return careers


@router.post("/career-suggestions", response_model=CareerSuggestionsResponse)
async def career_suggestions(req: CareerSuggestionsRequest) -> CareerSuggestionsResponse:
    language = req.language
    student_answers = req.studentAnswers.model_dump()

    try:
        messages = build_career_suggestions_messages(student_answers, language)
        output = await create_chat_completion(messages=messages, max_tokens=1400)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI call failed: {e}")

    # Parse + validate JSON.
    try:
        careers = _parse_careers(output)
        ai_response = {"raw_output": output, "careers": [c.model_dump() for c in careers]}
    except Exception:
        # One retry with fix-JSON instructions.
        try:
            fix_messages = build_fix_json_messages(language, output)
            fixed_output = await create_chat_completion(messages=fix_messages, max_tokens=1400)
            careers = _parse_careers(fixed_output)
            ai_response = {"raw_output": fixed_output, "careers": [c.model_dump() for c in careers]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse/validate AI JSON: {e}")

    # Enforce 3–5 careers for UI simplicity.
    if len(careers) > 5:
        careers = careers[:5]

    session_id = create_session_record(
        language=language,
        student_answers=student_answers,
        ai_response=ai_response,
    )

    return CareerSuggestionsResponse(sessionId=session_id, careers=careers)

