from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from app.db.db import get_conn


def create_session_record(language: str, student_answers: Dict[str, Any], ai_response: Dict[str, Any]) -> str:
    session_id = str(uuid4())
    created_at = datetime.utcnow().isoformat() + "Z"

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO career_sessions (id, created_at, language, student_answers_json, ai_response_json)
            VALUES (?, ?, ?, ?, ?);
            """,
            (
                session_id,
                created_at,
                language,
                json.dumps(student_answers, ensure_ascii=False),
                json.dumps(ai_response, ensure_ascii=False),
            ),
        )
    return session_id


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT id, created_at, language, student_answers_json, ai_response_json
            FROM career_sessions
            WHERE id = ?;
            """,
            (session_id,),
        ).fetchone()

    if not row:
        return None

    return {
        "id": row["id"],
        "created_at": row["created_at"],
        "language": row["language"],
        "student_answers": json.loads(row["student_answers_json"]),
        "ai_response": json.loads(row["ai_response_json"]),
    }


def add_chat_message(session_id: str, role: str, content: str) -> None:
    from uuid import uuid4

    message_id = str(uuid4())
    created_at = datetime.utcnow().isoformat() + "Z"

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO chat_messages (id, session_id, role, content, created_at)
            VALUES (?, ?, ?, ?, ?);
            """,
            (message_id, session_id, role, content, created_at),
        )


def get_chat_history(session_id: str, limit: int = 12) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT role, content, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY created_at DESC
            LIMIT ?;
            """,
            (session_id, limit),
        ).fetchall()

    # Reverse to chronological order
    history = [{"role": r["role"], "content": r["content"], "created_at": r["created_at"]} for r in rows]
    history.reverse()
    return history

