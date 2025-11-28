from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas import UserCreate, UserLogin, UserOut, Token
from ..database import db
from ..security import hash_password, verify_password, create_access_token
from bson import ObjectId

router = APIRouter()

@router.post("/signup", response_model=UserOut)
async def signup(payload: UserCreate):
    from datetime import datetime
    users = db.users
    # check username or email exists
    if await users.find_one({"username": payload.username}) or await users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="username or email already exists")
    user_doc = {
        "username": payload.username,
        "email": payload.email,
        "password": hash_password(payload.password),
        "role": payload.role,
        "created_at": datetime.utcnow(),
    }
    result = await users.insert_one(user_doc)
    return {"id": str(result.inserted_id), "username": payload.username, "email": payload.email, "role": payload.role}

@router.post("/login", response_model=Token)
async def login(form_data: UserLogin):
    users = db.users
    user = await users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user.get("password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(subject=str(user["_id"]))
    return {"access_token": access_token, "token_type": "bearer"}
