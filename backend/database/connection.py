# backend/database/connection.py
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import sys
import asyncio

class Database:
    client: AsyncIOMotorClient = None
    _connection_attempted = False

db = Database()

async def get_database():
    if db.client is None:
        if not db._connection_attempted:
            print("⚠️  Database client is None. Attempting initial connection...")
            await connect_to_mongo()
        else:
            print("⚠️  Database client is None. Attempting to reconnect...")
            try:
                await connect_to_mongo()
            except Exception as e:
                print(f"❌ Reconnection failed: {str(e)}")
                raise Exception(
                    f"Database client not initialized. Connection may have failed. "
                    f"Original error: {str(e)}"
                )
    
    if db.client is None:
        raise Exception("Database client is still None after connection attempt")
    
    try:
        return db.client[settings.DATABASE_NAME]
    except AttributeError as e:
        raise Exception(
            f"Database client is not properly initialized. "
            f"Cannot access database '{settings.DATABASE_NAME}'. "
            f"Please ensure MongoDB Atlas is accessible and connection was established."
        ) from e

async def connect_to_mongo():
    db._connection_attempted = True
    
    print("\n" + "=" * 60)
    print("📡 CONNECTING TO MONGODB ATLAS")
    print("=" * 60)
    
    # Mask password in URL for logging
    display_url = settings.MONGODB_URL
    if "@" in display_url and "mongodb+srv://" in display_url:
        try:
            parts = display_url.split("@")
            if len(parts) == 2:
                user_part = parts[0].replace("mongodb+srv://", "")
                if ":" in user_part:
                    username = user_part.split(":")[0]
                    display_url = f"mongodb+srv://{username}:***@{parts[1]}"
        except:
            pass
    
    print(f"   Database Name: {settings.DATABASE_NAME}")
    print("=" * 60)
    
    try:
        # Create client with appropriate timeout for Atlas
        print("   Creating MongoDB client...")
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL, 
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            retryWrites=True
        )
        
        # Test the connection
        print("   Testing connection (pinging server)...")
        await asyncio.wait_for(db.client.admin.command('ping'), timeout=10.0)
        
        # Get server info
        print("   Getting server information...")
        server_info = await db.client.server_info()
        
        print("\n" + "=" * 60)
        print("✅ MONGODB ATLAS CONNECTION SUCCESSFUL!")
        print("=" * 60)
        print(f"   Server Version: {server_info.get('version', 'unknown')}")
        print(f"   Database: {settings.DATABASE_NAME}")
        
        # Verify database access
        database = db.client[settings.DATABASE_NAME]
        collections = await database.list_collection_names()
        print(f"   Collections: {len(collections)} ({', '.join(collections) if collections else 'None'})")
        print("=" * 60 + "\n")
        
    except asyncio.TimeoutError:
        error_msg = "Connection timeout - MongoDB Atlas did not respond within 30 seconds"
        print("\n" + "=" * 60)
        print(f"❌ CONNECTION FAILED: {error_msg}")
        print("=" * 60)
        db.client = None
        raise Exception(error_msg)
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        print("\n" + "=" * 60)
        print(f"❌ MONGODB ATLAS CONNECTION FAILED!")
        print("=" * 60)
        print(f"   Error Type: {error_type}")
        print(f"   Error Message: {error_msg}")
        print("=" * 60)
        print("🔧 TROUBLESHOOTING:")
        print("   1. Check .env file has correct MONGODB_URL")
        print("   2. Verify MongoDB Atlas Network Access (IP whitelist)")
        print("   3. Check Database User credentials")
        print("   4. Ensure cluster is running (not paused)")
        print("=" * 60 + "\n")
        db.client = None
        raise

async def close_mongo_connection():
    if db.client:
        db.client.close()
        db.client = None
        db._connection_attempted = False
        print("✅ MongoDB connection closed")