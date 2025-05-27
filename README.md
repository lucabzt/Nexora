# Nexora

## Übersicht

Nexora ist eine modulare Plattform zur Unterstützung von Lernprozessen mit KI-gestützten Agenten. Das Projekt besteht aus einem Python-Backend (FastAPI) und einem modernen React-Frontend (Vite).

## Projektstruktur

- `backend/` – Backend-Logik, API, Datenbank, Containerisierung
- `frontend/` – Web-Frontend (React, Vite)
- `server/` – Zusätzliche Server-Komponenten und Agenten

## Schnellstart

### Voraussetzungen

- Node.js & npm (für das Frontend)
- Python 3.10+ (für das Backend)
- Docker (optional, für Containerbetrieb)

### Backend starten

```bash
cd backend
pip install -r requirements.txt
python run_dev.py
```

### Frontend starten

```bash
cd frontend/debug_frontend
npm install
npm run dev
```

### Mit Docker (Backend)

```bash
cd backend
docker-compose up --build
```
