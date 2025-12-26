from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import ssl
import certifi

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Motor client with serverSelectionTimeoutMS to prevent hanging
client = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,  # 5 second timeout
    tlsCAFile=certifi.where()  # Use certifi CA bundle
)
db = client["event_planner"]
