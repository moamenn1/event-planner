from fastapi import APIRouter, HTTPException, Depends, Header, Query
from bson import ObjectId
from database import db
from schemas import EventCreate, EventOut, RSVPRequest, InviteRequest
from security import decode_access_token
from typing import Optional

router = APIRouter()

# simple auth helper
async def require_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.split(" ")[-1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user_id, "username": user["username"], "role": user.get("role", "user")}

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
    from datetime import datetime
    user_info = await require_user(authorization)
    
    # Only organizers can create events
    if user_info["role"] != "organizer":
        raise HTTPException(status_code=403, detail="Only organizers can create events")
    
    event_doc = event.dict()
    event_doc.update({
        "organizer": user_info["username"],
        "organizer_id": user_info["id"],
        "attendees": [],  # list of invited usernames
        "rsvps": {"going": [], "maybe": [], "pass": []},
        "created_at": datetime.utcnow()
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
    user_info = await require_user(authorization)
    
    # allow delete if organizer
    doc = await db.events.find_one({"_id": ObjectId(event_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if user_info["username"] != doc.get("organizer"):
        raise HTTPException(status_code=403, detail="Only organizer can delete")
    
    await db.events.delete_one({"_id": ObjectId(event_id)})
    return {"message": "Event deleted"}

# RSVP endpoint
@router.post("/{event_id}/rsvp")
async def rsvp(event_id: str, payload: RSVPRequest, authorization: str = Header(None)):
    user_info = await require_user(authorization)
    username = user_info["username"]
    
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
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": {"rsvps": rsvps}})
    return {"message": f"RSVP set to {payload.response}"}

# Invite users to event (organizer only)
@router.post("/{event_id}/invite")
async def invite(event_id: str, payload: InviteRequest, authorization: str = Header(None)):
    user_info = await require_user(authorization)
    
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Only organizer can invite
    if event.get("organizer") != user_info["username"]:
        raise HTTPException(status_code=403, detail="Only organizer can invite")
    
    # Verify all usernames exist
    for username in payload.usernames:
        user = await db.users.find_one({"username": username})
        if not user:
            raise HTTPException(status_code=404, detail=f"User {username} not found")
    
    # Add to attendees list
    attendees = event.get("attendees", [])
    for username in payload.usernames:
        if username not in attendees:
            attendees.append(username)
    
    await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": {"attendees": attendees}})
    return {"message": f"Invited {len(payload.usernames)} user(s)"}

# Get attendee list with their RSVP statuses for a specific event (organizer only)
@router.get("/{event_id}/attendees")
async def get_event_attendees(event_id: str, authorization: str = Header(None)):
    user_info = await require_user(authorization)
    
    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Only organizer can view attendee list
    if event.get("organizer") != user_info["username"]:
        raise HTTPException(status_code=403, detail="Only organizer can view attendee list")
    
    # Compile attendee list with statuses
    rsvps = event.get("rsvps", {"going": [], "maybe": [], "pass": []})
    invited = event.get("attendees", [])
    
    attendee_list = []
    
    # Add all invited users with their status
    for username in invited:
        status = "no response"
        if username in rsvps.get("going", []):
            status = "going"
        elif username in rsvps.get("maybe", []):
            status = "maybe"
        elif username in rsvps.get("pass", []):
            status = "not going"
        
        attendee_list.append({
            "username": username,
            "status": status
        })
    
    return {
        "event_id": event_id,
        "event_title": event.get("title"),
        "organizer": event.get("organizer"),
        "total_invited": len(invited),
        "total_going": len(rsvps.get("going", [])),
        "total_maybe": len(rsvps.get("maybe", [])),
        "total_not_going": len(rsvps.get("pass", [])),
        "attendees": attendee_list
    }

# Get events organized by current user
@router.get("/my/organized")
async def my_organized_events(authorization: str = Header(None)):
    user_info = await require_user(authorization)
    
    items = []
    async for doc in db.events.find({"organizer": user_info["username"]}).sort("date", -1):
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(doc)
    return items

# Get events where current user is invited (attendee)
@router.get("/my/invited")
async def my_invited_events(authorization: str = Header(None)):
    user_info = await require_user(authorization)
    
    items = []
    async for doc in db.events.find({"attendees": user_info["username"]}).sort("date", -1):
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(doc)
    return items

# Advanced search endpoint
@router.get("/search")
async def search_events(
    keyword: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    role: Optional[str] = Query(None),  # filter by organizer username
    authorization: str = Header(None)
):
    user_info = await require_user(authorization)
    
    query = {}
    
    # Keyword search (title or description)
    if keyword:
        query["$or"] = [
            {"title": {"$regex": keyword, "$options": "i"}},
            {"description": {"$regex": keyword, "$options": "i"}}
        ]
    
    # Date filter
    if date:
        query["date"] = date
    
    # Role/organizer filter
    if role:
        query["organizer"] = role
    
    items = []
    async for doc in db.events.find(query).sort("date", -1):
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(doc)
    
    return items
