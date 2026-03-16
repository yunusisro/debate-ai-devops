from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserResponse, UserUpdate
from routes.auth import get_current_user
from database.connection import get_database
from bson import ObjectId

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        username=current_user["username"],
        full_name=current_user.get("full_name"),
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
        created_at=updated_user["created_at"],
        total_debates=updated_user.get("total_debates", 0),
        avg_score=updated_user.get("avg_score", 0.0)
    )
