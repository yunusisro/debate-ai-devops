from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import UserCreate, UserLogin, Token, UserResponse
from services.auth_service import get_password_hash, verify_password, create_access_token, decode_access_token
from database.connection import get_database
from datetime import datetime
from bson import ObjectId
import logging

router = APIRouter()
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    try:
        logger.info(f"Signup request received for email: {user.email}, username: {user.username}")
        
        db = await get_database()
        users_collection = db["users"]
        
        logger.info("Checking for existing user...")
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            logger.warning(f"Email {user.email} already registered")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        existing_username = await users_collection.find_one({"username": user.username})
        if existing_username:
            logger.warning(f"Username {user.username} already taken")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        # Validate password length for bcrypt
        if len(user.password.encode("utf-8")) > 72:
            raise HTTPException(
            status_code=400,
            detail="Password must not exceed 72 characters"
        )

        logger.info("Creating new user...")
        hashed_password = get_password_hash(user.password)

        user_doc = {
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
            "total_debates": 0,
            "avg_score": 0.0
        }

        result = await users_collection.insert_one(user_doc)
        logger.info(f"User created successfully with ID: {result.inserted_id}")

        access_token = create_access_token(data={"sub": user.email})
        logger.info(f"Access token generated for user: {user.email}")

        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    try:
        logger.info(f"Login request received for email: {user.email}")
        
        db = await get_database()
        users_collection = db["users"]

        db_user = await users_collection.find_one({"email": user.email})
        if not db_user or not verify_password(user.password, db_user["hashed_password"]):
            logger.warning(f"Login failed for email: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        access_token = create_access_token(data={"sub": user.email})
        logger.info(f"Login successful for email: {user.email}")

        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    email = decode_access_token(token)

    db = await get_database()
    users_collection = db["users"]
    user = await users_collection.find_one({"email": email})

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
