from fastapi import APIRouter, Depends, HTTPException, status
from models.debate import (
    DebateSessionCreate,
    DebateSessionResponse,
    CandidateResponse,
    AIResponseRequest,
    AIResponseResult,
    DebateStatus,
    Speaker,
    DebateMessage
)
from routes.auth import get_current_user
from database.connection import get_database
from services.groq_service import groq_service
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/session", response_model=DebateSessionResponse)
async def create_debate_session(
    session_data: DebateSessionCreate,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    sessions_collection = db["debate_sessions"]
    topics_collection = db["topics"]

    topic_obj_id = None
    if session_data.topic_id:
        try:
            topic_obj_id = ObjectId(session_data.topic_id)
        except:
            topic_obj_id = None

    if not session_data.custom_topic:
        if topic_obj_id:
            await topics_collection.update_one(
                {"_id": topic_obj_id},
                {"$inc": {"usage_count": 1, "participants": 1}}
            )
        else:
            await topics_collection.update_one(
                {"title": session_data.topic},
                {"$inc": {"usage_count": 1, "participants": 1}}
            )

    opening_statement = await groq_service.generate_opening_statement(
        session_data.topic,
        session_data.ai_stance,
        session_data.description,
        session_data.category,
        session_data.difficulty
    )

    ai_message = DebateMessage(
        speaker=Speaker.AI,
        content=opening_statement,
        timestamp=datetime.utcnow()
    )

    session_doc = {
        "user_id": current_user["_id"],
        "topic_id": topic_obj_id,
        "topic": session_data.topic,
        "custom_topic": session_data.custom_topic,
        "ai_stance": session_data.ai_stance,
        "description": session_data.description,
        "category": session_data.category,
        "difficulty": session_data.difficulty,
        "candidate_stance": session_data.candidate_stance,
        "status": DebateStatus.ACTIVE,
        "messages": [ai_message.dict()],
        "created_at": datetime.utcnow(),
        "ended_at": None,
        "evaluation_id": None
    }

    result = await sessions_collection.insert_one(session_doc)
    session_doc["_id"] = result.inserted_id

    return DebateSessionResponse(
        id=str(session_doc["_id"]),
        user_id=str(session_doc["user_id"]),
        topic=session_doc["topic"],
        custom_topic=session_doc["custom_topic"],
        ai_stance=session_doc["ai_stance"],
        candidate_stance=session_doc["candidate_stance"],
        status=session_doc["status"],
        messages=[ai_message],
        created_at=session_doc["created_at"],
        ended_at=session_doc["ended_at"],
        evaluation_id=session_doc["evaluation_id"]
    )

@router.post("/respond", response_model=AIResponseResult)
async def submit_candidate_response(
    response_data: CandidateResponse,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    sessions_collection = db["debate_sessions"]

    session = await sessions_collection.find_one({
        "_id": ObjectId(response_data.session_id),
        "user_id": current_user["_id"]
    })

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )

    if session["status"] != DebateStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debate session is not active"
        )

    candidate_message = DebateMessage(
        speaker=Speaker.CANDIDATE,
        content=response_data.content,
        timestamp=datetime.utcnow()
    )

    await sessions_collection.update_one(
        {"_id": ObjectId(response_data.session_id)},
        {"$push": {"messages": candidate_message.dict()}}
    )

    ai_response = await groq_service.generate_ai_argument(
        topic=session["topic"],
        ai_stance=session["ai_stance"],
        conversation_history=session["messages"],
        candidate_message=response_data.content,
        description=session.get("description"),
        category=session.get("category"),
        difficulty=session.get("difficulty")
    )

    ai_message = DebateMessage(
        speaker=Speaker.AI,
        content=ai_response,
        timestamp=datetime.utcnow()
    )

    await sessions_collection.update_one(
        {"_id": ObjectId(response_data.session_id)},
        {"$push": {"messages": ai_message.dict()}}
    )

    return AIResponseResult(
        ai_message=ai_response,
        audio_url=None
    )

@router.get("/session/{session_id}", response_model=DebateSessionResponse)
async def get_debate_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    sessions_collection = db["debate_sessions"]

    session = await sessions_collection.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user["_id"]
    })

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )

    messages = [
        DebateMessage(**msg) for msg in session["messages"]
    ]

    return DebateSessionResponse(
        id=str(session["_id"]),
        user_id=str(session["user_id"]),
        topic=session["topic"],
        custom_topic=session["custom_topic"],
        ai_stance=session["ai_stance"],
        candidate_stance=session["candidate_stance"],
        status=session["status"],
        messages=messages,
        created_at=session["created_at"],
        ended_at=session.get("ended_at"),
        evaluation_id=str(session["evaluation_id"]) if session.get("evaluation_id") else None
    )

@router.post("/session/{session_id}/end")
async def end_debate_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    sessions_collection = db["debate_sessions"]

    session = await sessions_collection.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user["_id"]
    })

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )

    await sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": DebateStatus.COMPLETED,
                "ended_at": datetime.utcnow()
            }
        }
    )

    return {"message": "Debate session ended successfully"}

@router.get("/sessions", response_model=List[DebateSessionResponse])
async def get_user_debate_sessions(
    limit: int = 10,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    sessions_collection = db["debate_sessions"]

    cursor = sessions_collection.find({
        "user_id": current_user["_id"]
    }).sort("created_at", -1).skip(skip).limit(limit)

    sessions = await cursor.to_list(length=limit)

    return [
        DebateSessionResponse(
            id=str(session["_id"]),
            user_id=str(session["user_id"]),
            topic=session["topic"],
            custom_topic=session["custom_topic"],
            ai_stance=session["ai_stance"],
            candidate_stance=session["candidate_stance"],
            status=session["status"],
            messages=[DebateMessage(**msg) for msg in session["messages"]],
            created_at=session["created_at"],
            ended_at=session.get("ended_at"),
            evaluation_id=str(session["evaluation_id"]) if session.get("evaluation_id") else None
        )
        for session in sessions
    ]

@router.get("/session/{session_id}/with-evaluation")
async def get_session_with_evaluation(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get debate session with its evaluation details and metrics.
    Used by DebateReportPage to display comprehensive results.
    """
    db = await get_database()
    sessions_collection = db["debate_sessions"]
    evaluations_collection = db["evaluations"]

    session = await sessions_collection.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user["_id"]
    })

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )

    # Get evaluation if exists
    evaluation = None
    if session.get("evaluation_id"):
        evaluation = await evaluations_collection.find_one({
            "_id": session["evaluation_id"]
        })

    messages = [DebateMessage(**msg) for msg in session["messages"]]
    
    # Count candidate messages
    candidate_messages = [m for m in messages if m.speaker == Speaker.CANDIDATE]
    
    # Calculate duration
    duration_seconds = 0
    if messages:
        first_msg_time = messages[0].timestamp
        last_msg_time = messages[-1].timestamp
        duration_seconds = int((last_msg_time - first_msg_time).total_seconds())

    response = {
        "session": {
            "id": str(session["_id"]),
            "user_id": str(session["user_id"]),
            "topic": session["topic"],
            "custom_topic": session["custom_topic"],
            "ai_stance": session["ai_stance"],
            "candidate_stance": session["candidate_stance"],
            "status": session["status"],
            "messages": messages,
            "created_at": session["created_at"],
            "ended_at": session.get("ended_at"),
            "category": session.get("category", "General"),
            "difficulty": session.get("difficulty", "intermediate"),
            "description": session.get("description", ""),
            "duration_seconds": duration_seconds,
            "candidate_message_count": len(candidate_messages),
            "total_message_count": len(messages)
        },
        "evaluation": None
    }

    if evaluation:
        from models.evaluation import (
            EvaluationResponse,
            EvaluationCriteria,
            StrengthItem,
            WeaknessItem,
            ImprovementItem
        )
        
        strengths = [StrengthItem(**s) for s in evaluation.get("strengths", [])]
        weaknesses = [WeaknessItem(**w) for w in evaluation.get("weaknesses", [])]
        improvements = [ImprovementItem(**i) for i in evaluation.get("improvements", [])]

        response["evaluation"] = {
            "id": str(evaluation["_id"]),
            "session_id": str(evaluation["session_id"]),
            "user_id": str(evaluation["user_id"]),
            "criteria_scores": evaluation["criteria_scores"],
            "overall_score": evaluation["overall_score"],
            "strengths": [s.dict() for s in strengths],
            "weaknesses": [w.dict() for w in weaknesses],
            "improvements": [i.dict() for i in improvements],
            "missed_points": evaluation.get("missed_points", []),
            "feedback": evaluation["feedback"],
            "ai_analysis": evaluation["ai_analysis"],
            "created_at": evaluation["created_at"]
        }

    return response