import os
from pathlib import Path

from dotenv import load_dotenv


# Load backend environment file automatically for local development.
# We try these locations in order, relative to the `backend/` folder:
# 1) backend/.env
# 2) backend/.env.local
# 3) backend/.env.example (only if the above are missing)
backend_dir = Path(__file__).resolve().parent.parent
candidates = [".env", ".env.local", ".env.example"]

# Prefer real secrets from .env / .env.local. Only fall back to .env.example
# if neither .env nor .env.local exists.
preferred = [".env", ".env.local"]
preferred_path = backend_dir / ".env"
if (backend_dir / ".env").exists():
    preferred_path = backend_dir / ".env"

if any((backend_dir / p).exists() for p in preferred):
    for p in preferred:
        pth = backend_dir / p
        if pth.exists():
            load_dotenv(dotenv_path=pth)
            break
else:
    # Fallback: try example file (useful if the user already edited it with their key)
    example_path = backend_dir / ".env.example"
    if example_path.exists():
        load_dotenv(dotenv_path=example_path)


class Settings:
    # Required: set this in backend/.env
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")

    # Optional: choose a model supported by OpenRouter
    openrouter_model: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

    # Optional tuning
    openrouter_temperature: float = float(os.getenv("OPENROUTER_TEMPERATURE", "0.7"))

    # Database file
    sqlite_path: str = os.getenv("SQLITE_PATH", os.path.join(os.path.dirname(__file__), "..", "..", "career_app.sqlite"))


settings = Settings()

