from fastapi import APIRouter, Depends, HTTPException, status
from models.evaluation import EvaluationCreate, EvaluationResponse, EvaluationCriteria
from routes.auth import get_current_user
from database.connection import get_database
from services.gemini_service import gemini_service
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/", response_model=EvaluationResponse)
async def create_evaluation(
    evaluation_data: EvaluationCreate,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    sessions_collection = db["debate_sessions"]
    evaluations_collection = db["evaluations"]
    users_collection = db["users"]

    session = await sessions_collection.find_one({
        "_id": ObjectId(evaluation_data.session_id),
        "user_id": current_user["_id"]
    })

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )

    if session.get("evaluation_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This debate session has already been evaluated"
        )

    candidate_messages = [
        msg["content"] for msg in session["messages"]
        if msg["speaker"] == "candidate"
    ]

    if not candidate_messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No candidate messages to evaluate"
        )

    ai_evaluation = await gemini_service.evaluate_debate(
        topic=session["topic"],
        conversation_history=session["messages"],
        candidate_messages=candidate_messages
    )

    criteria_scores = EvaluationCriteria(
        argumentation=ai_evaluation.get("argumentation", 7.0),
        clarity=ai_evaluation.get("clarity", 7.0),
        evidence=ai_evaluation.get("evidence", 7.0),
        rebuttal=ai_evaluation.get("rebuttal", 7.0),
        presentation=ai_evaluation.get("presentation", 7.0)
    )

    overall_score = (
        criteria_scores.argumentation +
        criteria_scores.clarity +
        criteria_scores.evidence +
        criteria_scores.rebuttal +
        criteria_scores.presentation
    ) / 5

    evaluation_doc = {
        "session_id": ObjectId(evaluation_data.session_id),
        "user_id": current_user["_id"],
        "criteria_scores": criteria_scores.dict(),
        "overall_score": overall_score,
        "strengths": ai_evaluation.get("strengths", []),
        "weaknesses": ai_evaluation.get("weaknesses", []),
        "feedback": ai_evaluation.get("feedback", ""),
        "ai_analysis": ai_evaluation.get("analysis", ""),
        "created_at": datetime.utcnow()
    }

    result = await evaluations_collection.insert_one(evaluation_doc)
    evaluation_doc["_id"] = result.inserted_id

    await sessions_collection.update_one(
        {"_id": ObjectId(evaluation_data.session_id)},
        {"$set": {"evaluation_id": result.inserted_id}}
    )

    user = await users_collection.find_one({"_id": current_user["_id"]})
    total_debates = user.get("total_debates", 0) + 1
    current_avg = user.get("avg_score", 0.0)
    new_avg = ((current_avg * (total_debates - 1)) + overall_score) / total_debates

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "total_debates": total_debates,
                "avg_score": new_avg
            }
        }
    )

    return EvaluationResponse(
        id=str(evaluation_doc["_id"]),
        session_id=str(evaluation_doc["session_id"]),
        user_id=str(evaluation_doc["user_id"]),
        criteria_scores=criteria_scores,
        overall_score=overall_score,
        strengths=evaluation_doc["strengths"],
        weaknesses=evaluation_doc["weaknesses"],
        feedback=evaluation_doc["feedback"],
        ai_analysis=evaluation_doc["ai_analysis"],
        created_at=evaluation_doc["created_at"]
    )

@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(
    evaluation_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    evaluations_collection = db["evaluations"]

    evaluation = await evaluations_collection.find_one({
        "_id": ObjectId(evaluation_id),
        "user_id": current_user["_id"]
    })

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    return EvaluationResponse(
        id=str(evaluation["_id"]),
        session_id=str(evaluation["session_id"]),
        user_id=str(evaluation["user_id"]),
        criteria_scores=EvaluationCriteria(**evaluation["criteria_scores"]),
        overall_score=evaluation["overall_score"],
        strengths=evaluation["strengths"],
        weaknesses=evaluation["weaknesses"],
        feedback=evaluation["feedback"],
        ai_analysis=evaluation["ai_analysis"],
        created_at=evaluation["created_at"]
    )

@router.get("/session/{session_id}", response_model=EvaluationResponse)
async def get_evaluation_by_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    evaluations_collection = db["evaluations"]

    evaluation = await evaluations_collection.find_one({
        "session_id": ObjectId(session_id),
        "user_id": current_user["_id"]
    })

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found for this session"
        )

    return EvaluationResponse(
        id=str(evaluation["_id"]),
        session_id=str(evaluation["session_id"]),
        user_id=str(evaluation["user_id"]),
        criteria_scores=EvaluationCriteria(**evaluation["criteria_scores"]),
        overall_score=evaluation["overall_score"],
        strengths=evaluation["strengths"],
        weaknesses=evaluation["weaknesses"],
        feedback=evaluation["feedback"],
        ai_analysis=evaluation["ai_analysis"],
        created_at=evaluation["created_at"]
    )

@router.get("/user/all", response_model=List[EvaluationResponse])
async def get_user_evaluations(
    limit: int = 10,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    evaluations_collection = db["evaluations"]

    cursor = evaluations_collection.find({
        "user_id": current_user["_id"]
    }).sort("created_at", -1).skip(skip).limit(limit)

    evaluations = await cursor.to_list(length=limit)

    return [
        EvaluationResponse(
            id=str(evaluation["_id"]),
            session_id=str(evaluation["session_id"]),
            user_id=str(evaluation["user_id"]),
            criteria_scores=EvaluationCriteria(**evaluation["criteria_scores"]),
            overall_score=evaluation["overall_score"],
            strengths=evaluation["strengths"],
            weaknesses=evaluation["weaknesses"],
            feedback=evaluation["feedback"],
            ai_analysis=evaluation["ai_analysis"],
            created_at=evaluation["created_at"]
        )
        for evaluation in evaluations
    ]
