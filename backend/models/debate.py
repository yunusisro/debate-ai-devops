from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class DebateStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class Speaker(str, Enum):
    AI = "ai"
    CANDIDATE = "candidate"

class DebateMessage(BaseModel):
    speaker: Speaker
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    audio_url: Optional[str] = None

class DebateSessionCreate(BaseModel):
    topic: str
    custom_topic: Optional[bool] = False
    ai_stance: str
    candidate_stance: str

class DebateSessionResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    custom_topic: bool
    ai_stance: str
    candidate_stance: str
    status: DebateStatus
    messages: List[DebateMessage] = []
    created_at: datetime
    ended_at: Optional[datetime] = None
    evaluation_id: Optional[str] = None

class CandidateResponse(BaseModel):
    content: str
    session_id: str

class AIResponseRequest(BaseModel):
    session_id: str
    candidate_message: str

class AIResponseResult(BaseModel):
    ai_message: str
    audio_url: Optional[str] = None
