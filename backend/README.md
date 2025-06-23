# Nexora AI - Backend

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/M4RKUS28/Nexora/blob/main/frontend/public/logo_white.png?raw=true">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/M4RKUS28/Nexora/blob/main/doc/logo_black.png?raw=true">
  <img alt="Nexora AI Logo" src="https://github.com/M4RKUS28/Nexora/blob/main/frontend/public/logo_white.png?raw=true">
</picture>

Welcome to the backend of **Nexora AI**! This powerful server-side application is built with Python and FastAPI, providing the core business logic, AI-powered services, and the main API for the Nexora platform.

---

## 🛠️ Tech Stack

- **Language:** Python (3.12)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Databases:** MySQL & [ChromaDB](https://www.trychroma.com/) (for vector storage)
- **Containerization:** [Docker](https://www.docker.com/) & Docker Compose
- **Authentication:** JWT (JSON Web Tokens)
- **AI/ML:** Integrations with Google Vertex AI and other machine learning libraries.

---

## 🚀 Getting Started

Follow these instructions to set up and run the backend application on your local machine.

### Prerequisites

- [Python](https://www.python.org/) (3.12 or newer)
- [Docker](https://www.docker.com/products/docker-desktop/) (for containerized setup)
- A running MySQL instance.

### Local Development Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    -   Create a `.env` file from the existing `.env` file.
    -   Fill in the required values (database credentials, API keys, etc.).

5.  **Run the development server:**
    The `run.sh` script starts the application using uvicorn.
    ```bash
    # For macOS/Linux
    ./run.sh

    # Alternatively, for development on any OS:
    uvicorn src.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### Docker Setup

1.  **Ensure Docker is running.**
2.  **Navigate to the backend directory.**
3.  **Build and run the containers:**
    ```bash
    docker-compose up --build
    ```
    This will start the FastAPI application and any associated services defined in the `docker-compose.yml` file.

---

## 📁 Project Structure

```bash
backend/
├── src/                  # Main source code
│   ├── agents/           # AI agent implementations
│   ├── api/              # API router definitions
│   ├── core/             # Core application logic (config, security)
│   ├── crud/             # CRUD operations for database models
│   ├── database/         # Database session and model definitions
│   ├── schemas/          # Pydantic schemas for data validation
│   ├── services/         # Business logic services
│   └── main.py           # Main application entry point
├── test/                 # Unit and integration tests
├── .env                  # Environment variable definitions (ignored by git)
├── create_admin.py       # Script to create an initial admin user
├── Dockerfile            # Docker configuration for the application
├── docker-compose.yml    # Docker Compose configuration
├── requirements.txt      # Python dependencies
└── run.sh                # Script to run the application
```

---

> For more information about the entire project, please see the [main README.md](../README.md).
