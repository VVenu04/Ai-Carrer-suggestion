from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class StudentAnswers(BaseModel):
    interests: str
    subjects: str
    skills: str
    personality: str
    workstyle: str
    goals: str
    educationLevel: str


class CareerSuggestion(BaseModel):
    name: str
    description: str
    required_skills: List[str] = Field(default_factory=list)
    future_demand: str
    learning_path: List[str] = Field(default_factory=list)


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

