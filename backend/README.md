# 🚀 Backend Integration Guide für AI Agents

## 📁 Empfohlene Verzeichnisstruktur

```
backend/src/
├── agents/                    # ✨ NEU: Agent-Implementierungen
│   ├── __init__.py
│   ├── base.py               # Base Agent Klasse
│   ├── planner/
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── schema.py
│   │   └── instructions.txt
│   ├── explainer/
│   │   ├── __init__.py  
│   │   ├── agent.py
│   │   └── instructions.txt
│   ├── tester/
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── schema.py
│   │   └── instructions.txt
│   └── utils.py              # Agent utilities
├── services/                  # Business Logic
│   ├── __init__.py
│   ├── agent_service.py      # ✨ NEU: Agent Orchestrierung
│   └── session_service.py    # ✨ NEU: Session Management
├── routers/
│   ├── __init__.py
│   ├── users.py
│   └── courses.py            # ✨ NEU: Course/Agent Endpoints
├── schemas/
│   ├── __init__.py
│   ├── user.py
│   ├── token.py
│   └── course.py             # ✨ NEU: Course Schemas
└── models/
    ├── __init__.py
    ├── db_user.py
    └── course.py             # ✨ NEU: Course Model (optional)
```