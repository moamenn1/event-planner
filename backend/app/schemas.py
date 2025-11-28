from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
<<<<<<< Updated upstream
=======
    role: str = Field(default="user")  

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
>>>>>>> Stashed changes

class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class EventCreate(BaseModel):
    title: str
    date: str   
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class EventOut(EventCreate):
    id: str
<<<<<<< Updated upstream
    organizer: str
    attendees: int
    rsvps: Dict[str, List[str]] = {"going": [], "maybe": [], "pass": []}

class RSVPRequest(BaseModel):
    response: str  # "going", "maybe", "pass"
    username: str
=======
    organizer: str  
    organizer_id: str  
    attendees: List[str] = []  
    rsvps: Dict[str, List[str]] = {"going": [], "maybe": [], "pass": []}

class RSVPRequest(BaseModel):
    response: str 

class InviteRequest(BaseModel):
    usernames: List[str]  
>>>>>>> Stashed changes
