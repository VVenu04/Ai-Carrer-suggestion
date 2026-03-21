from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from app.config import settings


OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"


async def create_chat_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: int = 1200,
) -> str:
    """
    Calls OpenRouter chat-completions and returns assistant message content.
    """
    api_key = settings.openrouter_api_key
    if not api_key:
        raise RuntimeError(
            "Missing OPENROUTER_API_KEY. Expected it in one of: "
            "backend/.env, backend/.env.local, or (if you edited it) backend/.env.example."
        )

    # Lightweight sanity check to help users diagnose "401 User not found".
    # OpenRouter keys usually start with "sk-or-".
    if not str(api_key).startswith("sk-or-"):
        raise RuntimeError(
            "OPENROUTER_API_KEY does not look like an OpenRouter key (expected prefix 'sk-or-'). "
            "If you pasted the wrong key/account, update it and restart the backend."
        )

    payload: Dict[str, Any] = {
        "model": model or settings.openrouter_model,
        "messages": messages,
        "temperature": settings.openrouter_temperature if temperature is None else temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # Helpful for OpenRouter attribution; safe to omit.
        "HTTP-Referer": "http://localhost",
        "X-OpenRouter-Title": "Career Guidance AI",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(OPENROUTER_CHAT_URL, json=payload, headers=headers)

    if resp.status_code < 200 or resp.status_code >= 300:
        raise RuntimeError(f"OpenRouter error {resp.status_code}: {resp.text}")

    data = resp.json()
    # OpenRouter follows OpenAI-like structure.
    try:
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        raise RuntimeError(f"Unexpected OpenRouter response shape: {data}") from e

