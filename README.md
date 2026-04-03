# Smart Budget & Expense Tracker

A full-stack personal finance project built from the requirements in `DLMCSPE01_Shazam_saifi_Project_Software_Engineering_10249076.docx`.

## Included features

- User registration and login with JWT authentication
- Predefined and custom transaction categories
- Income and expense tracking with edit/delete-ready API support
- Monthly budget planning per expense category
- Dashboard analytics with summaries, budget health, and recommendations
- Monthly report endpoint
- Pytest API tests
- React frontend dashboard

## Tech stack

- Backend: FastAPI, SQLAlchemy, JWT, Pytest
- Frontend: React + Vite
- Database: SQLite by default for local setup, PostgreSQL-ready through `DATABASE_URL`

## Project structure

```text
backend/
  app/
  tests/
frontend/
  src/
README.md
```

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API will start at `http://127.0.0.1:8000` and docs will be available at `http://127.0.0.1:8000/docs`.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The React app will run at `http://127.0.0.1:5173`.

## Switching to PostgreSQL

Update `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/smart_budget
```

## Test command

```bash
cd backend
pytest
```

## Core API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`
- `GET /api/budgets`
- `POST /api/budgets`
- `GET /api/budgets/status?month=4&year=2026`
- `GET /api/analytics/dashboard?month=4&year=2026`
- `GET /api/reports/monthly?month=4&year=2026`
