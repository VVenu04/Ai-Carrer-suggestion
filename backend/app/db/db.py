from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from typing import Iterator

from app.config import settings


def _ensure_parent_dir(db_path: str) -> None:
    # SQLite may need parent directories; keep it simple for beginners.
    import os

    parent = os.path.dirname(db_path)
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)


def init_db() -> None:
    _ensure_parent_dir(settings.sqlite_path)

    conn = sqlite3.connect(settings.sqlite_path)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS career_sessions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                language TEXT NOT NULL,
                student_answers_json TEXT NOT NULL,
                ai_response_json TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES career_sessions(id)
            );
            """
        )
        conn.commit()
    finally:
        conn.close()


@contextmanager
def get_conn() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(settings.sqlite_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

