"""
Simple script to run the FastAPI backend server
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Changed from 127.0.0.1 to accept connections from Docker network
        port=8000,
        reload=True
    )
