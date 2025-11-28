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

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- MongoDB running on `mongodb://localhost:27017`

### Backend Setup

#### Windows (cmd)

1. **Navigate to the backend directory:**
   ```cmd
   cd backend
   ```

2. **Create virtual environment (one-time):**
   ```cmd
   python -m venv .venv
   ```

3. **Activate virtual environment:**
   ```cmd
   .venv\Scripts\activate.bat
   ```
   You should see `(.venv)` in your prompt.

4. **Upgrade pip and install dependencies:**
   ```cmd
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   
   Create a `.env` file in the backend directory (or copy from `.env.example`):
   ```cmd
   copy .env.example .env
   notepad .env
   ```
   
   Edit the `.env` file with your settings:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=event_planner
   SECRET_KEY=your-secret-key-change-this-in-production
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ALLOWED_ORIGINS=http://localhost:5173
   ```

6. **Run the backend server:**
   
   **Option A - Using run.py (recommended):**
   ```cmd
   python run.py
   ```
   
   **Option B - Direct uvicorn:**
   ```cmd
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

7. **Verify backend is running:**
   - API Root: http://127.0.0.1:8000
   - Swagger UI: http://127.0.0.1:8000/docs
   - ReDoc: http://127.0.0.1:8000/redoc

#### macOS/Linux

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv .venv
   ```

3. **Activate virtual environment:**
   ```bash
   source .venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```

6. **Run the backend:**
   ```bash
   python run.py
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```cmd
   cd frontend
   ```

2. **Install dependencies:**
   ```cmd
   npm install
   ```

3. **Run the development server:**
   ```cmd
   npm run dev
   ```

4. **Access the frontend:**
   
   The frontend will be available at http://localhost:5173
   
   (If port 5173 is in use, Vite will try 5174 automatically)

## Testing with Postman

1. **Import the Postman collection:**
   - Open Postman
   - Click "Import"
   - Select `Event_Planner_API.postman_collection.json` from the repository root
   
2. **Set the base URL:**
   - Collection variables should have `base_url` = `http://127.0.0.1:8000`

3. **Test the endpoints:**
   - Use "Sign Up" to create a user (role: "user" or "organizer")
   - Use "Login" to authenticate (token is auto-saved to `auth_token` variable)

## Troubleshooting

### Backend Issues

**ModuleNotFoundError:**
- Make sure virtual environment is activated (you should see `(.venv)` in prompt)
- Reinstall dependencies: `pip install -r requirements.txt`

**MongoDB Connection Error:**
- Ensure MongoDB is running on `mongodb://localhost:27017`
- Start MongoDB with Docker: `docker run --name event-planner-mongo -p 27017:27017 -d mongo:7`
- Or start your local MongoDB service

**Email Validator Error:**
- Install: `pip install "pydantic[email]"`

**JWT/PyJWT Error:**
- Install: `pip install PyJWT`

### Frontend Issues

**Port 5173 already in use:**
- Vite will automatically try another port (5174, etc.)
- Update CORS in backend `.env` if using different port

**Cannot connect to backend:**
- Ensure backend is running at http://127.0.0.1:8000
- Check browser console for CORS errors
- Verify `ALLOWED_ORIGINS` in backend `.env` includes your frontend URL

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/me` - Get current user profile

### Events
- `GET /api/events/` - List all events
- `POST /api/events/` - Create new event (organizer only)
- `GET /api/events/{id}` - Get event details
- `DELETE /api/events/{id}` - Delete event (organizer only)
- `POST /api/events/{id}/rsvp` - RSVP to event
- `POST /api/events/{id}/invite` - Invite users (organizer only)
- `GET /api/events/{id}/attendees` - View attendees (organizer only)
- `GET /api/events/my/organized` - Get my organized events
- `GET /api/events/my/invited` - Get events I'm invited to
- `GET /api/events/search` - Search events (keyword, date, role)
## Features

### User Management
- ✅ User registration with email and password
- ✅ User authentication with JWT tokens
- ✅ Role-based access (user/organizer)

### Event Management (Organizer Role)
- ✅ Create events with title, date, time, location, description
- ✅ View all organized events
- ✅ View all invited events
- ✅ Invite users to events
- ✅ Delete own events
- ✅ Users marked as "organizer" or "attendee"

### Response Management
- ✅ Attendees can RSVP (Going/Maybe/Not Going)
- ✅ Organizers view attendees and their statuses

### Search and Filtering
- ✅ Advanced search by keywords (title/description)
- ✅ Filter by date
- ✅ Filter by organizer

## Development

### Vite Plugins
Currently, two official plugins are available:
- `@vitejs/plugin-react` uses Babel for Fast Refresh
- `@vitejs/plugin-react-swc` uses SWC for Fast Refresh

### ESLint Configuration
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled.

## Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Email validation
- ✅ MongoDB injection prevention
- ✅ CORS configuration

## Project Deliverables
- ✅ Backend API with FastAPI
- ✅ Frontend with React + Vite
- ✅ Postman collection (`Event_Planner_API.postman_collection.json`)
- ✅ Complete error handling
- ✅ Authentication and authorization
- ✅ MongoDB integration ``````
