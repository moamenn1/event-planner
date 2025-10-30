from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="user")  # "user" or "organizer"

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class EventCreate(BaseModel):
    title: str
    date: str   # you can switch to datetime if you parse client date
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class EventOut(EventCreate):
    id: str
    organizer: str  # username of the organizer
    organizer_id: str  # user ID of organizer
    attendees: List[str] = []  # list of usernames invited as attendees
    rsvps: Dict[str, List[str]] = {"going": [], "maybe": [], "pass": []}

class RSVPRequest(BaseModel):
    response: str  # "going", "maybe", "pass"

class InviteRequest(BaseModel):
    usernames: List[str]  # list of usernames to invite
