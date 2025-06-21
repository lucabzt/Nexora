# Nexora AI Project

<img src="https://github.com/M4RKUS28/Nexora/blob/main/doc/logo.png?raw=true" alt="Logo" width="200"/>

Welcome to Nexora AI! This project is a full-stack application designed to deliver cutting-edge AI solutions for personalized learning assistance. It leverages a Python backend and a modern React frontend.

**Try it out yourself:** [nexora-ai.de](https://nexora-ai.de)

---

## ✨ Features

*   **Feature 1:** [Describe a key feature]
*   **Feature 2:** [Describe another key feature]
*   **User Authentication:** Secure login and registration.
*   **Interactive UI:** Modern and responsive user interface built with React.
*   **AI-Powered Capabilities:** [Mention specific AI functionalities if applicable]
*   ... [Add more features as relevant]

<!-- Optional: Add a screenshot of your application -->
<!-- <p align="center">
  <img src="link_to_screenshot.png" alt="Nexora Application Screenshot" width="700"/>
</p> -->

---

## 🛠️ Tech Stack

### Backend
*   **Language:** Python (3.12)
*   **Framework:** FastAPI
*   **Database:** [MySQL + ChromaDB]
*   **Environment Management:** Python `venv`
*   **Containerization:** Docker (Dockerfile, docker-compose.yml)

### Frontend
*   **Library:** React
*   **Build Tool:** Vite
*   **Package Manager:** npm
*   **Language:** JavaScript
*   **Styling:** [Tailwind CSS, Mantine]

## Current Software Architecture

![Software Architecture](https://github.com/M4RKUS28/Nexora/blob/main/doc/Editor%20_%20Mermaid%20Chart-2025-06-18-210221.png?raw=true)



---

## 🚀 Getting Started

Follow these instructions to set up the Nexora AI project for local development.

### Prerequisites

*   **Python:** Version 3.10+
*   **Node.js:** Version 18.x or later (Check `frontend/package.json` engines field if specified)
*   **npm:** Version 8.x or later (Usually comes with Node.js)
*   **Git:** For cloning the repository.
*   **(Optional) Docker:** If you plan to use Docker for running the backend.

### Development Installation & Setup

Have a look at our [wiki](https://github.com/M4RKUS28/Nexora/wiki/How-to-run-locally)

---

## 📁 Project Structure

The project is organized into main directories:

*   `backend/`: Contains all the Python (FastAPI) server-side code, API logic, database interactions, and Docker configurations.
*   `frontend//`: Contains the client-side React application code, built with Vite.
*   The existing README also mentioned a `server/` directory for "Zusätzliche Server-Komponenten und Agenten". You may want to detail its contents here if it's a key part of the project.

```
nexora-project/
├── backend/
│   ├── src/                  # Main backend source code
│   ├── venv/                 # Python virtual environment (ignored by git)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── run.sh                # Script to run backend
│   └── ...
├── frontend/
│   ├── src/                  # Main frontend source code (components, pages, etc.)
│   ├── public/               # Static assets
│   ├── node_modules/         # Node.js dependencies (ignored by git)
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── README.md                 # This file
...
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please make sure to update tests as appropriate.


---

## 📞 Contact

If you have any questions, feedback, or issues, please open an issue on GitHub.

---
