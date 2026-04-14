# Event Approval System

Phases 2 and 3 introduce a clean monorepo-style setup with:

- `frontend/`: React + Vite + Tailwind starter
- `backend/`: FastAPI starter with SQLAlchemy, Pydantic, and JWT-ready auth utilities
- MySQL-ready relational schema for users, proposals, budget items, and review decisions

## Frontend

Expected structure:

- `src/components`
- `src/pages`
- `src/hooks`
- `src/services`
- `src/store`

Run after installing Node.js:

```powershell
cd frontend
npm install
npm run dev
```

## Backend

Create and activate the virtual environment:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Demo login credentials:

- `student@university.edu` / `Student@123`
- `faculty@university.edu` / `Faculty@123`

The backend now includes:

- `POST /api/auth/login` for JWT login
- `GET /api/auth/me` for authenticated user lookup
- role-guard examples at `GET /api/auth/student` and `GET /api/auth/faculty`
- SQLAlchemy models for `users`, `proposals`, `budget_items`, and `review_decisions`
- automatic table creation plus seed users on startup

If PowerShell blocks activation, use:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

## Environment files

Copy these templates before local development:

- `frontend/.env.example` -> `frontend/.env`
- `backend/.env.example` -> `backend/.env`

## Database

The backend reads `DATABASE_URL` from `backend/.env`. For MySQL, use:

```powershell
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/event_approval_system
```

For local fallback testing without MySQL, you can still use:

```powershell
DATABASE_URL=sqlite:///./event_approval.db
```

## Frontend auth

The React app stores the authenticated session in `localStorage` and protects the
dashboard route for logged-in student and faculty users.
