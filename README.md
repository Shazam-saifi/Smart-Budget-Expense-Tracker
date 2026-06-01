# Smart Budget & Expense Tracker

A full-stack personal finance application for tracking income, expenses, budgets, and monthly financial health. The project includes a FastAPI backend, a React/Vite frontend, JWT authentication, dashboard analytics, and API tests.

## Overview

Smart Budget & Expense Tracker helps users:

- Register and log in securely
- Record income and expense transactions
- Organize spending with predefined and custom categories
- Set monthly budgets for expense categories
- View dashboard summaries, budget status, and recommendations
- Generate monthly financial reports

## Quick run guide

### 1. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs at `http://127.0.0.1:5173`.

### 3. Open the app

- Frontend: `http://127.0.0.1:5173`
- Backend API: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Included features

- User registration and login with JWT authentication
- Predefined and custom transaction categories
- Income and expense tracking with edit/delete-ready API support
- Monthly budget planning per expense category
- Dashboard analytics with summaries, budget health, and recommendations
- Monthly report endpoint
- Pytest API tests
- React frontend dashboard
- SQLite local database with PostgreSQL-ready configuration

## Tech stack

- Backend: FastAPI, SQLAlchemy, JWT, Pytest, Uvicorn
- Frontend: React, Vite
- Database: SQLite by default for local setup, PostgreSQL-ready through `DATABASE_URL`

## Project structure

```text
backend/
  app/
    main.py
  tests/
  requirements.txt
frontend/
  src/
  package.json
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

### Backend environment

Create `backend/.env` from `backend/.env.example`:

```bash
cd backend
cp .env.example .env
```

Typical local values:

```env
DATABASE_URL=sqlite:///./smart_budget.db
SECRET_KEY=change-this-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The React app will run at `http://127.0.0.1:5173`.

### Frontend environment

Create `frontend/.env` from `frontend/.env.example`:

```bash
cd frontend
cp .env.example .env
```

Typical local value:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Switching to PostgreSQL

Update `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/smart_budget
```

Then install/start PostgreSQL locally and restart the backend.

## Test commands

```bash
cd backend
pytest
```

Optional frontend build check:

```bash
cd frontend
npm run build
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

## Development notes

- Do not commit local virtual environments, SQLite database files, or `node_modules`.
- Use `.env.example` files as templates for local configuration.
- Backend API changes should be covered by tests in `backend/tests`.
- Frontend API calls should point to the backend URL configured in `VITE_API_BASE_URL`.
