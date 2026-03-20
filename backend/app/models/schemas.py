from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class StudentAnswers(BaseModel):
    # Premium wizard inputs (frontend sends structured selections converted to summary strings)
    interests: str
    skills: str
    personality: str
    workstyle: str
    risk: str
    learningStyle: str
    motivation: str
    educationLevel: str

    # Backward-compatible optional fields (older frontend versions)
    subjects: Optional[str] = None
    goals: Optional[str] = None


class CareerSuggestion(BaseModel):
    name: str
    icon: Optional[str] = None
    description: str
    required_skills: List[str] = Field(default_factory=list)
    confidence_percent: Optional[int] = Field(default=None, ge=0, le=100)
    future_demand: str
    learning_path: List[str] = Field(default_factory=list)
    why_this_fits_you: Optional[str] = None


class CareerSuggestionsRequest(BaseModel):
    language: Literal["en", "ta"] = "en"
    studentAnswers: StudentAnswers


class CareerSuggestionsResponse(BaseModel):
    sessionId: str
    careers: List[CareerSuggestion]


class CareerSessionRecord(BaseModel):
    id: str
    createdAt: datetime
    language: str
    studentAnswers: Dict[str, Any]
    aiResponse: Dict[str, Any]


class ChatRequest(BaseModel):
    sessionId: str
    language: Literal["en", "ta"] = "en"
    message: str


class ChatResponse(BaseModel):
    sessionId: str
    reply: str


class ChatMessageRecord(BaseModel):
    id: str
    sessionId: str
    role: Literal["user", "assistant"]
    content: str
    createdAt: datetime

