# Construction AI Platform

A state-of-the-art Construction Management Platform with integrated AI features, Gantt charts, role-specific portals, and real-time contractor coordination.

## Tech Stack
- **Frontend Web**: React, TypeScript, Tailwind CSS, Vite.
- **Backend Services**: Django, Django REST Framework, SimpleJWT.
- **Database / Cache**: PostgreSQL, Redis.
- **Orchestration**: Docker, Docker Compose.

## Directory Structure
- `backend/`: Django core REST API application.
- `frontend-web/`: React single-page application with dashboard shells.

## Running Locally (Docker Compose)
To spin up all services including Postgres, Redis, Django API, and Vite dev server:
```bash
docker-compose up --build
```

Access the frontend dashboard at `http://localhost:5173`.
Access the backend API documentation at `http://localhost:8000`.
