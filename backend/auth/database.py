import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "pixelforge"

# Create async MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Collections
users_collection = database["users"]

async def create_indexes():
    """Create database indexes"""
    # Create unique index on email
    await users_collection.create_index("email", unique=True)