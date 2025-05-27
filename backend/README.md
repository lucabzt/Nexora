# Nexora Backend

## Übersicht

Das Backend von Nexora ist in Python entwickelt und stellt die Kernlogik sowie die API-Endpunkte bereit. Es nutzt FastAPI und ist für den produktiven Einsatz in Containern vorbereitet.

## Projektstruktur

- `src/` – Hauptquellcode (Agents, Services, Datenbank, Routen)
- `config/` – Konfigurationen
- `db/` – Datenbankmodelle und -zugriff
- `models/` – Datenmodelle
- `routers/` – API-Routen
- `services/` – Geschäftslogik
- `utils/` – Hilfsfunktionen
- `Dockerfile` & `docker-compose.yml` – Containerisierung

## Installation & Start

1. Navigiere ins Backend-Verzeichnis:

   ```bash
   cd backend
   ```

2. Installiere die Abhängigkeiten:

   ```bash
   pip install -r requirements.txt
   ```

3. Starte den Entwicklungsserver:

   ```bash
   python run_dev.py
   ```

## Mit Docker starten

```bash
docker-compose up --build
```

## Hinweise

- Die Umgebungsvariablen können in `config/settings.py` angepasst werden.
- Für die Admin-Erstellung kann `create_admin.py` genutzt werden.
