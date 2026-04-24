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
    })

    users = await users_cursor.to_list(length=1000)

    leaderboard_entries = []
    for user in users:
        evaluations_cursor = evaluations_collection.find({
            "user_id": user["_id"]
        })
        evaluations = await evaluations_cursor.to_list(length=1000)

        total_debates = len(evaluations)
        wins = sum(1 for ev in evaluations if float(ev.get("overall_score", 0.0)) == 10.0)
        total_score = sum(float(ev.get("overall_score", 0.0)) for ev in evaluations)
        highest_score = max((float(ev.get("overall_score", 0.0)) for ev in evaluations), default=0.0)

        leaderboard_entries.append({
            "user_id": str(user["_id"]),
            "username": user.get("full_name") or user.get("username"),
            "total_debates": total_debates,
            "average_score": round(user.get("avg_score", 0.0), 2),
            "highest_score": round(highest_score, 2),
            "wins": wins,
            "points": int(round(total_score * 10)),
        })

    leaderboard_entries.sort(
        key=lambda entry: (
            -entry["wins"],
            -entry["average_score"],
            -entry["highest_score"],
        )
    )

    leaderboard = [
        LeaderboardEntry(
            user_id=entry["user_id"],
            username=entry["username"],
            total_debates=entry["total_debates"],
            average_score=entry["average_score"],
            highest_score=entry["highest_score"],
            wins=entry["wins"],
            points=entry["points"],
            rank=index + 1,
        )
        for index, entry in enumerate(leaderboard_entries[:limit])
    ]

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

    users_cursor = users_collection.find({
        "total_debates": {"$gt": 0}
    })

    all_users = await users_cursor.to_list(length=1000)
    leaderboard_entries = []

    for user in all_users:
        evaluations_cursor = evaluations_collection.find({
            "user_id": user["_id"]
        })
        evaluations = await evaluations_cursor.to_list(length=1000)

        total_debates = len(evaluations)
        wins = sum(1 for ev in evaluations if float(ev.get("overall_score", 0.0)) == 10.0)
        total_score = sum(float(ev.get("overall_score", 0.0)) for ev in evaluations)
        highest_score = max((float(ev.get("overall_score", 0.0)) for ev in evaluations), default=0.0)

        leaderboard_entries.append({
            "user_id": str(user["_id"]),
            "username": user.get("full_name") or user.get("username"),
            "total_debates": total_debates,
            "average_score": round(user.get("avg_score", 0.0), 2),
            "highest_score": round(highest_score, 2),
            "wins": wins,
            "points": int(round(total_score * 10)),
        })

    leaderboard_entries.sort(
        key=lambda entry: (
            -entry["wins"],
            -entry["average_score"],
            -entry["highest_score"],
        )
    )

    target_entry = next(
        (entry for entry in leaderboard_entries if entry["user_id"] == str(target_user["_id"])),
        None,
    )

    if not target_entry:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User leaderboard entry not found"
        )

    rank = leaderboard_entries.index(target_entry) + 1

    return LeaderboardEntry(
        user_id=target_entry["user_id"],
        username=target_entry["username"],
        total_debates=target_entry["total_debates"],
        average_score=target_entry["average_score"],
        highest_score=target_entry["highest_score"],
        wins=target_entry["wins"],
        points=target_entry["points"],
        rank=rank
    )
