# DrainPulse AI Architecture

## System overview
DrainPulse AI is a full-stack urban drainage intelligence platform focused on detecting vulnerable drainage points, simulating rainfall impacts, and prioritising maintenance work. The solution is intentionally modular so it can be extended to PostgreSQL/PostGIS in production while remaining fully runnable in a local development environment.

## Runtime stack
- Frontend: Next.js 15 + TypeScript + Tailwind CSS + Framer Motion + Recharts + MapLibre GL
- Backend: FastAPI + Pydantic v2 + SQLAlchemy + SQLite for local persistence
- Data layer: local SQLite database, with a schema designed to be compatible with a future PostgreSQL/PostGIS migration
- Business logic: interpretable risk scoring engine, maintenance prioritisation, and simulation components
- Storage: file-based SQLite database plus generated sample data for panning and inspection workflows

## Key modules
1. `frontend/` – dashboard, map, inspection forms, maintenance board, and report management screens.
2. `backend/` – FastAPI service with REST endpoints for assets, incidents, rainfall scenarios, and maintenance prioritisation.
3. `shared/` – domain models and scoring logic shared by both layers in the form of a Python-compatible schema and app data contracts.

## Data model
The core entities are:
- Drain asset: location, status, terrain, clogging score, capacity, and confidence.
- Incident report: citizen or inspector submission including location, photograph references, description, and status.
- Rainfall scenario: intensity, duration, and region-specific modifiers.
- Maintenance work order: recommended response, due time, crew type, and priority.

## Validation strategy
- Python: pytest for API-level validation of risk scoring and core endpoints
- Frontend: `next build` to validate compile-time correctness and route generation
- Manual smoke tests: run the backend API and fetch the main dashboard data from the browser or curl

## Limitations
The local implementation uses SQLite instead of PostgreSQL/PostGIS to keep the app runnable in the current environment. The geospatial logic is therefore represented as lat/long coordinate-based risk overlay rather than heavy GIS queries.
