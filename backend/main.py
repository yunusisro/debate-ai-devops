# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import logging

from routes import auth, debate, topics, user, evaluation, leaderboard
from database.connection import connect_to_mongo, close_mongo_connection, db

# Configure logging to show print statements
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("=" * 60)
    logger.info("🚀 FASTAPI LIFESPAN: STARTUP")
    logger.info("=" * 60)
    
    try:
        await connect_to_mongo()
        
        # Verify connection
        if db.client is None:
            raise Exception("Connection function returned but db.client is still None")
        
        # Final verification ping
        await db.client.admin.command('ping')
        logger.info("✅ MongoDB Atlas connection verified and ready!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error("=" * 60)
        logger.error("❌ CRITICAL: Failed to connect to MongoDB Atlas!")
        logger.error(f"   Error: {str(e)}")
        logger.error("=" * 60)
        logger.error("🔧 Please check:")
        logger.error("   1. MongoDB Atlas connection string in .env")
        logger.error("   2. Network Access IP whitelist in Atlas")
        logger.error("   3. Database user credentials")
        logger.error("=" * 60)
        sys.exit(1)
    
    yield
    
    # Shutdown
    logger.info("=" * 60)
    logger.info("🛑 FASTAPI LIFESPAN: SHUTDOWN")
    await close_mongo_connection()
    logger.info("=" * 60)


app = FastAPI(
    title="Debate Assistant AI API",
    description="Backend API for AI-powered debate assistant",
    version="1.0.0",
    lifespan=lifespan
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://3.108.209.181:3000",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(topics.router, prefix="/api/topics", tags=["Topics"])
app.include_router(debate.router, prefix="/api/debate", tags=["Debate"])
app.include_router(evaluation.router, prefix="/api/evaluation", tags=["Evaluation"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])

@app.get("/")
async def root():
    return {"message": "Debate Assistant AI API is running"}

@app.get("/health")
async def health_check():
    from database.connection import db
    status_info = {
        "status": "healthy",
        "database": "connected" if db.client is not None else "not connected"
    }
    
    if db.client is None:
        status_info["status"] = "unhealthy"
        return status_info
    
    try:
        await db.client.admin.command('ping')
        status_info["database"] = "connected"
        return status_info
    except Exception as e:
        status_info["status"] = "unhealthy"
        status_info["database"] = "error"
        status_info["error"] = str(e)
        return status_info