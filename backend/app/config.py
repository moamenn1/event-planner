import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "event_planner")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ALLOWED_ORIGINS: List[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()
