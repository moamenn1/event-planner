# Event Planner

A full-stack event planning application built with React (Vite) frontend and FastAPI backend.

## Tech Stack

### Frontend
- **React** with **Vite** for fast development and HMR
- **ESLint** for code quality
- Modern React features and components

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** with **Motor** - Async MongoDB driver
- **PyJWT** - JWT authentication
- **Passlib** with **bcrypt** - Password hashing
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## Project Structure
event-planner/
├── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── components/
│ │ └── assets/
│ └── package.json
│
└── backend/ # FastAPI backend
├── app/
│ ├── main.py # FastAPI application
│ ├── config.py # Configuration settings
│ ├── database.py # MongoDB connection
│ ├── models.py # Database models
│ ├── schemas.py # Pydantic schemas
│ ├── security.py # Auth & JWT utilities
│ └── routes/ # API routes
│ ├── auth.py
│ ├── events.py
│ └── users.py
├── venv/ # Python virtual environment
└── requirements.txt

## Setup & Installation

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend

2. **Create and activate virtual environment:**

python -m venv venv
venv\Scripts\activate    # Windows
source venv/bin/activate # Linux/Mac

3. **Install dependencies:**
pip install -r requirements.txt

4. **Configure environment variables:**

Create a .env file in the backend directory with:
MONGODB_URL=your_mongodb_connection_string
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30

5. **Run the backend server:**
cd app
uvicorn main:app --reload --host 127.0.0.1 --port 8000

Or use the VS Code task: Run FastAPI Backend

The API will be available at http://127.0.0.1:8000

API documentation at http://127.0.0.1:8000/docs

### Frontend Setup

1. **Navigate to the frontend directory:**
cd frontend

2. **Install dependencies:**
npm install

3. **Run the development server:**
npm run dev

The frontend will be available at http://localhost:5173

**API Endpoints**
Auth:

POST /auth/signup - User registration
POST /auth/login - User login
Users:

GET /users/me - Get current user profile
Events:

GET /events - List all events
POST /events - Create new event
GET /events/{id} - Get event details
PUT /events/{id} - Update event
DELETE /events/{id} - Delete event
Development
Vite Plugins
Currently, two official plugins are available:

@vitejs/plugin-react uses Babel for Fast Refresh
@vitejs/plugin-react-swc uses SWC for Fast Refresh
ESLint Configuration
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the TS template for information on how to integrate TypeScript and typescript-eslint in your project. ``````
