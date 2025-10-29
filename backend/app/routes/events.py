from fastapi import APIRouter, HTTPException, Depends, Header
from bson import ObjectId
from database import db
from schemas import EventCreate, EventOut, RSVPRequest
from security import decode_access_token

router = APIRouter()

# simple auth helper
async def require_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.split(" ")[-1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub")  # user id

@router.get("/", response_model=list)
async def list_events():
    items = []
    async for doc in db.events.find().sort("date", -1):
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(doc)
    return items

@router.post("/", status_code=201)
async def create_event(event: EventCreate, authorization: str = Header(None)):
    user_id = await require_user(authorization)
    # fetch organizer username
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    organizer = user.get("username") if user else "unknown"
    event_doc = event.dict()
    event_doc.update({
        "organizer": organizer,
        "attendees": 0,
        "rsvps": {"going": [], "maybe": [], "pass": []}
    })
    res = await db.events.insert_one(event_doc)
    return {"id": str(res.inserted_id), "message": "Event created"}

@router.get("/{event_id}")
async def get_event(event_id: str):
    doc = await db.events.find_one({"_id": ObjectId(event_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    doc["id"] = str(doc["_id"]); doc.pop("_id", None)
    return doc

@router.delete("/{event_id}")
async def delete_event(event_id: str, authorization: str = Header(None)):
    user_id = await require_user(authorization)
    # allow delete if organizer
    doc = await db.events.find_one({"_id": ObjectId(event_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user and user.get("username") != doc.get("organizer"):
        raise HTTPException(status_code=403, detail="Only organizer can delete")
    await db.events.delete_one({"_id": ObjectId(event_id)})
    return {"message": "Event deleted"}

# RSVP endpoint
@router.post("/{event_id}/rsvp")
async def rsvp(event_id: str, payload: RSVPRequest, authorization: str = Header(None)):
    user_id = await require_user(authorization)
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    username = user["username"]
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    # remove from all lists then add to chosen
    rsvps = event.get("rsvps", {"going": [], "maybe": [], "pass": []})
    for k in rsvps:
        if username in rsvps[k]:
            rsvps[k].remove(username)
    if payload.response not in rsvps:
        raise HTTPException(status_code=400, detail="Invalid response")
    rsvps[payload.response].append(username)
    attendees = len(rsvps.get("going", []))
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": {"rsvps": rsvps, "attendees": attendees}})
    return {"message": f"RSVP set to {payload.response}"}

# Invite endpoint (store invites in invites collection)
@router.post("/{event_id}/invite")
async def invite(event_id: str, body: dict, authorization: str = Header(None)):
    user_id = await require_user(authorization)
    inviter = await db.users.find_one({"_id": ObjectId(user_id)})
    target_username = body.get("username")
    message = body.get("message", "")
    target_user = await db.users.find_one({"username": target_username})
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    invite_doc = {
        "event_id": event_id,
        "from": inviter["username"],
        "to": target_username,
        "message": message,
        "created_at": None
    }
    await db.invites.insert_one(invite_doc)
    return {"message": "Invite recorded"}
