from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserResponse, UserUpdate
from routes.auth import get_current_user
from database.connection import get_database
from bson import ObjectId
from typing import List, Dict, Any

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        username=current_user["username"],
        full_name=current_user.get("full_name"),
        bio=current_user.get("bio"),
        created_at=current_user["created_at"],
        total_debates=current_user.get("total_debates", 0),
        avg_score=current_user.get("avg_score", 0.0)
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    users_collection = db["users"]

    update_data = {}
    if user_update.username is not None:
        existing = await users_collection.find_one({
            "username": user_update.username,
            "_id": {"$ne": current_user["_id"]}
        })
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        update_data["username"] = user_update.username

    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name

    if user_update.bio is not None:
        update_data["bio"] = user_update.bio

    if update_data:
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )

    updated_user = await users_collection.find_one({"_id": current_user["_id"]})

    return UserResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        username=updated_user["username"],
        full_name=updated_user.get("full_name"),
        bio=updated_user.get("bio"),
        created_at=updated_user["created_at"],
        total_debates=updated_user.get("total_debates", 0),
        avg_score=updated_user.get("avg_score", 0.0)
    )

@router.get("/debate-history", response_model=List[Dict[str, Any]])
async def get_user_debate_history(
    limit: int = 20,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's debate history with evaluations.
    Returns sessions with their associated evaluations.
    """
    db = await get_database()
    sessions_collection = db["debate_sessions"]
    evaluations_collection = db["evaluations"]

    # Get user's debate sessions
    cursor = sessions_collection.find({
        "user_id": current_user["_id"],
        "status": "completed"  # Only completed debates
    }).sort("created_at", -1).skip(skip).limit(limit)

    sessions = await cursor.to_list(length=limit)
    
    debate_history = []
    for session in sessions:
        # Get evaluation for this session if it exists
        evaluation = None
        if session.get("evaluation_id"):
            evaluation = await evaluations_collection.find_one({
                "_id": session["evaluation_id"]
            })
            
            if evaluation:
                # Parse nested objects
                from models.evaluation import StrengthItem, WeaknessItem, ImprovementItem
                evaluation = {
                    "id": str(evaluation["_id"]),
                    "session_id": str(evaluation["session_id"]),
                    "user_id": str(evaluation["user_id"]),
                    "criteria_scores": evaluation["criteria_scores"],
                    "overall_score": evaluation["overall_score"],
                    "strengths": [StrengthItem(**s).dict() for s in evaluation.get("strengths", [])],
                    "weaknesses": [WeaknessItem(**w).dict() for w in evaluation.get("weaknesses", [])],
                    "improvements": [ImprovementItem(**i).dict() for i in evaluation.get("improvements", [])],
                    "missed_points": evaluation.get("missed_points", []),
                    "feedback": evaluation["feedback"],
                    "ai_analysis": evaluation["ai_analysis"],
                    "created_at": evaluation["created_at"]
                }

        # Calculate duration
        from models.debate import DebateMessage
        messages = [DebateMessage(**msg) for msg in session["messages"]]
        duration_seconds = 0
        if messages:
            first_msg_time = messages[0].timestamp
            last_msg_time = messages[-1].timestamp
            duration_seconds = int((last_msg_time - first_msg_time).total_seconds())

        debate_history.append({
            "session": {
                "id": str(session["_id"]),
                "topic": session["topic"],
                "category": session.get("category", "General"),
                "difficulty": session.get("difficulty", "intermediate"),
                "candidate_stance": session["candidate_stance"],
                "created_at": session["created_at"],
                "ended_at": session.get("ended_at"),
                "duration_seconds": duration_seconds,
                "candidate_message_count": len([m for m in messages if m.speaker == "candidate"]),
                "total_message_count": len(messages)
            },
            "evaluation": evaluation
        })

    return debate_history
