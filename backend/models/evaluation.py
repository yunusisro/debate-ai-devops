from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class EvaluationCriteria(BaseModel):
    argumentation: float = Field(ge=0, le=10)
    clarity: float = Field(ge=0, le=10)
    evidence: float = Field(ge=0, le=10)
    rebuttal: float = Field(ge=0, le=10)
    presentation: float = Field(ge=0, le=10)

class StrengthItem(BaseModel):
    title: str
    description: str

class WeaknessItem(BaseModel):
    title: str
    description: str

class ImprovementItem(BaseModel):
    title: str
    description: str
    priority: str = Field(default="medium")  # high, medium, low

class EvaluationCreate(BaseModel):
    session_id: str

class EvaluationResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    criteria_scores: EvaluationCriteria
    overall_score: float
    strengths: List[StrengthItem]
    weaknesses: List[WeaknessItem]
    improvements: List[ImprovementItem]
    missed_points: List[str]
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
