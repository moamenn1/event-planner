from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import auth, users, events
from .config import settings

app = FastAPI(title="Event Planner API", version="1.0")

# CORS: restrict to your frontend in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])


@app.get("/")
def root():
    return {"message": "Event Planner Backend running"}
