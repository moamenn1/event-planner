from fastapi import APIRouter, Depends, Header, HTTPException
from security import decode_access_token
from database import db
from bson import ObjectId

router = APIRouter()

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    token = parts[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = str(user["_id"])
    return user

@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    current_user.pop("password", None)
    current_user["id"] = str(current_user.get("_id"))
    return {"id": current_user["id"], "username": current_user["username"], "email": current_user["email"]}
