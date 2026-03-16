from fastapi import APIRouter, Depends
from models.evaluation import LeaderboardEntry
from routes.auth import get_current_user
from database.connection import get_database
from typing import List

router = APIRouter()

@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    users_collection = db["users"]
    evaluations_collection = db["evaluations"]

    users_cursor = users_collection.find({
        "total_debates": {"$gt": 0}
    }).sort("avg_score", -1).limit(limit)

    users = await users_cursor.to_list(length=limit)

    leaderboard = []
    for idx, user in enumerate(users, start=1):
        evaluations_cursor = evaluations_collection.find({
            "user_id": user["_id"]
        }).sort("overall_score", -1).limit(1)

        top_evaluation = await evaluations_cursor.to_list(length=1)
        highest_score = top_evaluation[0]["overall_score"] if top_evaluation else 0.0

        leaderboard.append(
            LeaderboardEntry(
                user_id=str(user["_id"]),
                username=user["username"],
                total_debates=user.get("total_debates", 0),
                average_score=round(user.get("avg_score", 0.0), 2),
                highest_score=round(highest_score, 2),
                rank=idx
            )
        )

    return leaderboard

@router.get("/user/{user_id}", response_model=LeaderboardEntry)
async def get_user_rank(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    users_collection = db["users"]
    evaluations_collection = db["evaluations"]

    from bson import ObjectId

    target_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    users_above = await users_collection.count_documents({
        "avg_score": {"$gt": target_user.get("avg_score", 0.0)},
        "total_debates": {"$gt": 0}
    })

    rank = users_above + 1

    evaluations_cursor = evaluations_collection.find({
        "user_id": ObjectId(user_id)
    }).sort("overall_score", -1).limit(1)

    top_evaluation = await evaluations_cursor.to_list(length=1)
    highest_score = top_evaluation[0]["overall_score"] if top_evaluation else 0.0

    return LeaderboardEntry(
        user_id=str(target_user["_id"]),
        username=target_user["username"],
        total_debates=target_user.get("total_debates", 0),
        average_score=round(target_user.get("avg_score", 0.0), 2),
        highest_score=round(highest_score, 2),
        rank=rank
    )
