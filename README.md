# Event Approval System

Production-grade event proposal and approval workflow for students and faculty.

## Project status

The repository includes a secure authentication system, database schema for proposals and reviews, and a clean monorepo structure with React frontend and FastAPI backend.

**Current capabilities:**
- Architecture: monorepo with `/frontend` (React) and `/backend` (FastAPI)
- Database schema: users, proposals, budget_items, review_decisions
- Authentication: JWT with role-based access (Student/Faculty)
- Workflow: Authentication → Proposal Management → Faculty Review

For detailed development phases and roadmap, see [`docs/roadmap.txt`](docs/roadmap.txt).

## What this project is for

Students need to submit event proposals with budget details, and faculty members need to efficiently review and approve or reject them. This repository provides the foundation for an application that:

- allows students to create and track event proposals,
- captures budget item details with server-side calculations,
- enables faculty to review proposals with remarks and decisions,
- enforces role-based access throughout the workflow,
- provides a production-ready backend and frontend scaffold.

## Current repository scope

This version gives you a strong foundation with working authentication and database infrastructure. It includes:

- FastAPI service with JWT authentication and role-based endpoints,
- SQLAlchemy models for users, proposals, budget items, and review decisions,
- automatic table creation with seed user data on startup,
- React + Vite + Tailwind frontend starter,
- environment configuration templates,
- demo login credentials for testing.

## Repository structure

```text
backend/
  app/
    api/            FastAPI routes (auth, proposals, reviews)
    core/           configuration and security utilities
    models/         SQLAlchemy database models
    schemas/        Pydantic request/response schemas
    services/       business logic and auth services
    db/             database session and initialization
  requirements.txt
  .env.example
  run.py

frontend/
  src/
    components/     reusable UI components
    pages/          route pages
    hooks/          custom React hooks
    services/       API integration
    store/          state management
  package.json
  .env.example
  vite.config.js
  tailwind.config.js

docs/               documentation and architecture notes
tests/              backend tests
```

## Quick start

### 1. Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and update `DATABASE_URL` if needed.

Run the backend:

```powershell
python run.py
```

The API will be available at `http://localhost:8000`.

### 2. Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Demo login credentials

- Email: `student@university.edu` / Password: `Student@123`
- Email: `faculty@university.edu` / Password: `Faculty@123`

## API endpoints

### Authentication

- `POST /api/auth/login` – JWT token generation
- `GET /api/auth/me` – authenticated user lookup

### Role-guarded examples

- `GET /api/auth/student` – student-only endpoint
- `GET /api/auth/faculty` – faculty-only endpoint

### Proposals (to be implemented)

- `POST /api/proposals` – create proposal
- `GET /api/proposals/mine` – list student's proposals
- `GET /api/proposals/{id}` – get proposal details

### Reviews (to be implemented)

- `GET /api/reviews/pending` – list pending proposals for faculty
- `POST /api/reviews/{id}/approve` – approve proposal
- `POST /api/reviews/{id}/reject` – reject proposal

## Example login response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@university.edu",
    "role": "student"
  }
}
```

## Environment files

Copy these templates before local development:

- `frontend/.env.example` -> `frontend/.env`
- `backend/.env.example` -> `backend/.env`

### Backend environment

```env
DATABASE_URL=sqlite:///./event_approval.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
```

For MySQL:

```env
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/event_approval_system
```

## Database

The backend automatically creates tables on startup using SQLAlchemy models. To use MySQL instead of SQLite, update `DATABASE_URL` in `.env`.

## Frontend authentication

The React app stores the authenticated session in `localStorage` and protects routes for logged-in student and faculty users.

## Troubleshooting

If PowerShell blocks script execution:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

## Suggested next steps

1. Implement proposal management APIs.
2. Build complete student dashboard UI.
3. Implement faculty review workflow.
4. Add state management and UX polish.
5. Security hardening and input validation.
6. Deployment configuration and production readiness.

Refer to [`docs/roadmap.txt`](docs/roadmap.txt) for detailed phase descriptions and implementation details.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, JWT
- **Database:** SQLite (development) / MySQL (production)
- **Auth:** JWT tokens with bcrypt password hashing
