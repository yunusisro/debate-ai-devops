import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from config import settings

PREDEFINED_TOPICS = [
    {
        "title": "Artificial Intelligence will replace most human jobs",
        "description": "Debate whether AI and automation will make most current jobs obsolete",
        "category": "Technology"
    },
    {
        "title": "Social media does more harm than good",
        "description": "Discuss the overall impact of social media on society",
        "category": "Social Issues"
    },
    {
        "title": "Climate change is the most pressing global issue",
        "description": "Debate the priority and urgency of addressing climate change",
        "category": "Environment"
    },
    {
        "title": "Remote work is better than office work",
        "description": "Compare the benefits and drawbacks of remote vs office work",
        "category": "Work Culture"
    },
    {
        "title": "University education is necessary for success",
        "description": "Debate whether formal higher education is essential for career success",
        "category": "Education"
    },
    {
        "title": "Privacy is more important than security",
        "description": "Discuss the balance between individual privacy and collective security",
        "category": "Ethics"
    },
    {
        "title": "Electric vehicles are the future of transportation",
        "description": "Debate the viability and sustainability of electric vehicles",
        "category": "Technology"
    },
    {
        "title": "Space exploration is worth the investment",
        "description": "Discuss whether space programs justify their costs",
        "category": "Science"
    },
    {
        "title": "Cryptocurrency will replace traditional currency",
        "description": "Debate the future of digital currencies in the financial system",
        "category": "Finance"
    },
    {
        "title": "Vegetarianism is ethically superior",
        "description": "Discuss the ethical implications of dietary choices",
        "category": "Ethics"
    },
    {
        "title": "Online learning is as effective as in-person education",
        "description": "Compare the effectiveness of online vs traditional education",
        "category": "Education"
    },
    {
        "title": "Free speech should have limits",
        "description": "Debate the boundaries of freedom of expression",
        "category": "Social Issues"
    }
]

async def init_topics():
    """Initialize database with predefined debate topics"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    topics_collection = db["topics"]

    existing_count = await topics_collection.count_documents({})

    if existing_count > 0:
        print(f"Database already contains {existing_count} topics. Skipping initialization.")
        return

    topics_to_insert = []
    for topic in PREDEFINED_TOPICS:
        topic["created_at"] = datetime.utcnow()
        topic["usage_count"] = 0
        topics_to_insert.append(topic)

    result = await topics_collection.insert_many(topics_to_insert)

    print(f"Successfully initialized {len(result.inserted_ids)} debate topics!")

    client.close()

if __name__ == "__main__":
    print("Initializing debate topics...")
    asyncio.run(init_topics())
    print("Done!")
