from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "General"

class TopicResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    created_at: datetime
    usage_count: int = 0

class TopicsList(BaseModel):
    topics: List[TopicResponse]
    total: int
