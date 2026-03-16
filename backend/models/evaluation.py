from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class EvaluationCriteria(BaseModel):
    argumentation: float = Field(ge=0, le=10)
    clarity: float = Field(ge=0, le=10)
    evidence: float = Field(ge=0, le=10)
    rebuttal: float = Field(ge=0, le=10)
    presentation: float = Field(ge=0, le=10)

class EvaluationCreate(BaseModel):
    session_id: str

class EvaluationResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    criteria_scores: EvaluationCriteria
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    feedback: str
    ai_analysis: str
    created_at: datetime

class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    total_debates: int
    average_score: float
    highest_score: float
    rank: int
