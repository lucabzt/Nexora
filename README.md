# Nexora AI

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/M4RKUS28/Nexora/blob/main/frontend/public/logo_white.png?raw=true">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/M4RKUS28/Nexora/blob/main/frontend/public/logo_black.png?raw=true">
  <img alt="Nexora AI Logo" src="https://github.com/M4RKUS28/Nexora/blob/main/frontend/public/logo_white.png?raw=true">
</picture>

#### Welcome to **Nexora AI**!

This project is a full-stack application designed to deliver cutting-edge **AI solutions for personalized learning assistance**. It leverages a powerful Python backend and a modern React frontend to offer an innovative educational platform.

**🌐 Try it live:** [nexora-ai.de](https://nexora-ai.de)


---

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=https://github.com/M4RKUS28/Nexora/blob/main/doc/dashboard_dark.png?raw=true">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/M4RKUS28/Nexora/blob/main/doc/dashboard_white.png?raw=true">
  <img alt="Nexora AI Logo" src="https://github.com/M4RKUS28/Nexora/blob/main/doc/logo.png?raw=true">
</picture>


---

## ✨ Features

- **Smart Course Creation:**  
  Create interactive courses from documents, images, and notes with ease.

- **AI-Assisted Learning:**  
  - Course generation powered by AI agents  
  - Quizzes (MCQs & Fill-in-the-Blank) with AI-based validation  
  - Personalized study plans based on time availability  
  - AI chatbot per chapter trained on relevant knowledge  

- **Interactive Tools:**  
  Includes timers, plotters, notes, and more to support diverse learning styles.

- **Visualization & Media:**  
  - Image search via Unsplash API  
  - Google Vertex AI integration for course logos  
  - Future integration of flashcards and progress/statistics tracking

- **Multilingual & Theming Support:**  
  Fully supports multiple languages and light/dark themes.

- **User Authentication:**  
  Secure and robust registration and login system.

- **Responsive UI:**  
  Built with React, Tailwind CSS, and Mantine for a seamless user experience.

---

## 🛠️ Tech Stack

### Backend
- **Language:** Python (3.12)
- **Framework:** FastAPI
- **Databases:** MySQL + ChromaDB (vector storage)
- **Containerization:** Docker, Docker Compose
- **Other:** Python `venv`, AI/ML integrations, server agents

### Frontend
- **Library:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, Mantine
- **Language:** JavaScript (ES6+)
- **State Management:** React Context + Hooks

---

## Course Creation process

![Course Creation Process](https://github.com/M4RKUS28/Nexora/blob/main/doc/final_diagram.png?raw=true)



## 📐 Software Architecture

![Software Architecture](https://github.com/M4RKUS28/Nexora/blob/main/doc/Editor%20_%20Mermaid%20Chart-2025-06-18-210221.png?raw=true)

---

## 🧪 Development Installation & Setup

To run the project locally, follow the instructions in our [🛠️ Wiki - How to Run Locally](https://github.com/M4RKUS28/Nexora/wiki/How-to-run-locally)

> Make sure you have Docker, Node.js, and Python 3.12+ installed.

---

## 📁 Project Structure

```bash
nexora-project/
├── backend/
│   ├── src/                  # Main backend source code
│   ├── venv/                 # Python virtual environment (ignored by git)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── run.sh
│   └── ...
├── frontend/
│   ├── src/                  # React components, routes, utils
│   ├── public/               # Static assets (images, logo, etc.)
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── server/                   # Additional backend services & agents
│   └── ...
├── README.md
└── ...
---
```

## 🗓️ Roadmap

- [x] Course Creation from Mixed Media
- [x] AI Quizzes (MCQs, Fill-in-the-Gap)
- [x] Chapter-Based AI Chat Assistant
- [X] Flashcards Generator
- [ ] Progress/Statistics Dashboard
- [ ] Offline Mode
- [ ] Collaborative Course Editing

---

## 🧠 Built With

- 🧬 **AI & ML:** Google Vertex AI, custom vector embeddings with ChromaDB
- 🖼️ **Image API:** Unsplash
- ⚙️ **Backend Services:** FastAPI, Docker, Gunicorn
- 💻 **Frontend Frameworks:** React, Vite, Tailwind CSS, Mantine

---

## 📞 Contact

Have questions or feedback?  
Feel free to [open an issue](https://github.com/M4RKUS28/Nexora/issues) or contact the maintainer directly via GitHub.

---

> Made with 💡 and 🧠 by the Nexora AI Team.
