from fastapi import APIRouter, Depends, HTTPException, status
from models.topic import TopicCreate, TopicResponse, TopicsList
from routes.auth import get_current_user
from database.connection import get_database
from datetime import datetime
from bson import ObjectId
from typing import Optional

router = APIRouter()

@router.post("/", response_model=TopicResponse)
async def create_topic(
    topic: TopicCreate,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    topics_collection = db["topics"]

    topic_doc = {
        "title": topic.title,
        "description": topic.description,
        "category": topic.category,
        "created_at": datetime.utcnow(),
        "usage_count": 0,
        "created_by": current_user["_id"]
    }

    result = await topics_collection.insert_one(topic_doc)
    topic_doc["_id"] = result.inserted_id

    return TopicResponse(
        id=str(topic_doc["_id"]),
        title=topic_doc["title"],
        description=topic_doc["description"],
        category=topic_doc["category"],
        created_at=topic_doc["created_at"],
        usage_count=topic_doc["usage_count"]
    )

@router.get("/", response_model=TopicsList)
async def get_topics(
    category: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    topics_collection = db["topics"]

    query = {}
    if category:
        query["category"] = category

    cursor = topics_collection.find(query).sort("usage_count", -1).skip(skip).limit(limit)
    topics = await cursor.to_list(length=limit)

    total = await topics_collection.count_documents(query)

    topics_list = [
        TopicResponse(
            id=str(topic["_id"]),
            title=topic["title"],
            description=topic.get("description"),
            category=topic["category"],
            created_at=topic["created_at"],
            usage_count=topic.get("usage_count", 0)
        )
        for topic in topics
    ]

    return TopicsList(topics=topics_list, total=total)

@router.get("/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    topics_collection = db["topics"]

    topic = await topics_collection.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )

    return TopicResponse(
        id=str(topic["_id"]),
        title=topic["title"],
        description=topic.get("description"),
        category=topic["category"],
        created_at=topic["created_at"],
        usage_count=topic.get("usage_count", 0)
    )
