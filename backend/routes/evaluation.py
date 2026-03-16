from fastapi import APIRouter, Depends, HTTPException, status
from models.evaluation import (
    EvaluationCreate, 
    EvaluationResponse, 
    EvaluationCriteria,
    StrengthItem,
    WeaknessItem,
    ImprovementItem
)
from routes.auth import get_current_user
from database.connection import get_database
from services.groq_service import groq_service
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

    # Call enhanced groq service with full debate context
    ai_evaluation = await groq_service.evaluate_debate(
        topic=session["topic"],
        conversation_history=session["messages"],
        candidate_messages=candidate_messages,
        ai_stance=session.get("ai_stance"),
        candidate_stance=session.get("candidate_stance"),
        difficulty=session.get("difficulty"),
        description=session.get("description"),
        category=session.get("category")
    )

    # Build criteria scores
    criteria_scores = EvaluationCriteria(
        argumentation=float(ai_evaluation.get("argumentation", 6.5)),
        clarity=float(ai_evaluation.get("clarity", 6.5)),
        evidence=float(ai_evaluation.get("evidence", 6.5)),
        rebuttal=float(ai_evaluation.get("rebuttal", 6.5)),
        presentation=float(ai_evaluation.get("presentation", 6.5))
    )

    # Calculate overall score
    overall_score = (
        criteria_scores.argumentation +
        criteria_scores.clarity +
        criteria_scores.evidence +
        criteria_scores.rebuttal +
        criteria_scores.presentation
    ) / 5

    # Parse strengths and weaknesses
    strengths = []
    for strength in ai_evaluation.get("strengths", []):
        if isinstance(strength, dict):
            strengths.append(StrengthItem(
                title=strength.get("title", ""),
                description=strength.get("description", "")
            ))

    weaknesses = []
    for weakness in ai_evaluation.get("weaknesses", []):
        if isinstance(weakness, dict):
            weaknesses.append(WeaknessItem(
                title=weakness.get("title", ""),
                description=weakness.get("description", "")
            ))

    # Parse improvements
    improvements = []
    for improvement in ai_evaluation.get("improvements", []):
        if isinstance(improvement, dict):
            improvements.append(ImprovementItem(
                title=improvement.get("title", ""),
                description=improvement.get("description", ""),
                priority=improvement.get("priority", "medium")
            ))

    # Get missed points
    missed_points = ai_evaluation.get("missed_points", [])

    # Prepare evaluation document for database
    evaluation_doc = {
        "session_id": ObjectId(evaluation_data.session_id),
        "user_id": current_user["_id"],
        "criteria_scores": criteria_scores.dict(),
        "overall_score": overall_score,
        "strengths": [s.dict() for s in strengths],
        "weaknesses": [w.dict() for w in weaknesses],
        "improvements": [i.dict() for i in improvements],
        "missed_points": missed_points,
        "feedback": ai_evaluation.get("feedback", ""),
        "ai_analysis": ai_evaluation.get("analysis", ""),
        "created_at": datetime.utcnow()
    }

    result = await evaluations_collection.insert_one(evaluation_doc)
    evaluation_doc["_id"] = result.inserted_id

    # Update session with evaluation_id
    await sessions_collection.update_one(
        {"_id": ObjectId(evaluation_data.session_id)},
        {"$set": {"evaluation_id": result.inserted_id}}
    )

    # Update user statistics
    user = await users_collection.find_one({"_id": current_user["_id"]})
    total_debates = user.get("total_debates", 0) + 1
    current_avg = user.get("avg_score", 0.0)
    new_avg = ((current_avg * (total_debates - 1)) + overall_score) / total_debates
    highest_score = max(user.get("highest_score", 0.0), overall_score)

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "total_debates": total_debates,
                "avg_score": new_avg,
                "highest_score": highest_score
            }
        }
    )

    # Return the evaluation response with all nested objects
    return EvaluationResponse(
        id=str(evaluation_doc["_id"]),
        session_id=str(evaluation_doc["session_id"]),
        user_id=str(evaluation_doc["user_id"]),
        criteria_scores=criteria_scores,
        overall_score=overall_score,
        strengths=strengths,
        weaknesses=weaknesses,
        improvements=improvements,
        missed_points=missed_points,
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

    # Parse nested objects
    strengths = [StrengthItem(**s) for s in evaluation.get("strengths", [])]
    weaknesses = [WeaknessItem(**w) for w in evaluation.get("weaknesses", [])]
    improvements = [ImprovementItem(**i) for i in evaluation.get("improvements", [])]

    return EvaluationResponse(
        id=str(evaluation["_id"]),
        session_id=str(evaluation["session_id"]),
        user_id=str(evaluation["user_id"]),
        criteria_scores=EvaluationCriteria(**evaluation["criteria_scores"]),
        overall_score=evaluation["overall_score"],
        strengths=strengths,
        weaknesses=weaknesses,
        improvements=improvements,
        missed_points=evaluation.get("missed_points", []),
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

    # Parse nested objects
    strengths = [StrengthItem(**s) for s in evaluation.get("strengths", [])]
    weaknesses = [WeaknessItem(**w) for w in evaluation.get("weaknesses", [])]
    improvements = [ImprovementItem(**i) for i in evaluation.get("improvements", [])]

    return EvaluationResponse(
        id=str(evaluation["_id"]),
        session_id=str(evaluation["session_id"]),
        user_id=str(evaluation["user_id"]),
        criteria_scores=EvaluationCriteria(**evaluation["criteria_scores"]),
        overall_score=evaluation["overall_score"],
        strengths=strengths,
        weaknesses=weaknesses,
        improvements=improvements,
        missed_points=evaluation.get("missed_points", []),
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

    result = []
    for evaluation in evaluations:
        strengths = [StrengthItem(**s) for s in evaluation.get("strengths", [])]
        weaknesses = [WeaknessItem(**w) for w in evaluation.get("weaknesses", [])]
        improvements = [ImprovementItem(**i) for i in evaluation.get("improvements", [])]
        
        result.append(
            EvaluationResponse(
                id=str(evaluation["_id"]),
                session_id=str(evaluation["session_id"]),
                user_id=str(evaluation["user_id"]),
                criteria_scores=EvaluationCriteria(**evaluation["criteria_scores"]),
                overall_score=evaluation["overall_score"],
                strengths=strengths,
                weaknesses=weaknesses,
                improvements=improvements,
                missed_points=evaluation.get("missed_points", []),
                feedback=evaluation["feedback"],
                ai_analysis=evaluation["ai_analysis"],
                created_at=evaluation["created_at"]
            )
        )
    
    return result
