import os
from pathlib import Path

from dotenv import load_dotenv


# Load backend/.env automatically for local development.
# (So users don't need to set environment variables in PowerShell.)
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path)


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

