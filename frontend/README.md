# Nexora AI - Frontend

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/M4RKUS28/Nexora/blob/main/frontend/public/logo_white.png?raw=true">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/M4RKUS28/Nexora/blob/main/doc/logo_black.png?raw=true">
  <img alt="Nexora AI Logo" src="https://github.com/M4RKUS28/Nexora/blob/main/frontend/public/logo_white.png?raw=true">
</picture>

Welcome to the frontend of **Nexora AI**! This is a modern, responsive, and feature-rich user interface for our personalized learning platform, built with React and Vite.

**🌐 Live Application:** [nexora-ai.de](https://nexora-ai.de)

---

## 🛠️ Tech Stack

- **Library:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Mantine UI](https://mantine.dev/)
- **Language:** JavaScript (ES6+)
- **State Management:** React Context + Hooks
- **Routing:** [React Router](https://reactrouter.com/)
- **Internationalization:** [i18next](https://www.i18next.com/)

---

## 🚀 Getting Started

Follow these instructions to set up and run the frontend application on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/M4RKUS28/Nexora.git
    cd Nexora/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Available Scripts

- `npm run dev`: Starts the development server with Hot Module Replacement (HMR).
- `npm run build`: Bundles the application for production.
- `npm run lint`: Lints the code using ESLint.
- `npm run preview`: Serves the production build locally for preview.

---

## 📁 Project Structure

```bash
frontend/
├── public/               # Static assets (images, logos, etc.)
├── src/
│   ├── api/              # API service definitions
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization & localization files
│   ├── pages/            # Top-level page components
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component with routing
│   └── main.jsx          # Application entry point
├── .eslintrc.cjs         # ESLint configuration
├── index.html            # Main HTML template
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite configuration
```

---

> For more information about the entire project, please see the [main README.md](../README.md).
