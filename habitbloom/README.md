# HabitBloom — Vite + MERN Stack

Converted from Create React App to **Vite**.

---

## What Changed (CRA → Vite)

| CRA (old)                          | Vite (new)                          |
|------------------------------------|--------------------------------------|
| `public/index.html`                | `index.html` (project root)          |
| `src/index.js`                     | `src/main.jsx`                       |
| `App.js`, `*.js` components        | `App.jsx`, `*.jsx` components        |
| `react-scripts start`              | `vite` (dev server)                  |
| `react-scripts build`              | `vite build`                         |
| `"proxy"` in package.json         | `server.proxy` in `vite.config.js`   |
| `%PUBLIC_URL%` in HTML             | Absolute `/` paths in index.html     |

---

## Project Structure

```
habitbloom/
├── backend/          ← Express + MongoDB (unchanged)
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/         ← React + Vite
    ├── index.html    ← Entry HTML (Vite style)
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx  ← Entry point (replaces index.js)
        ├── App.jsx
        ├── context/
        ├── pages/
        ├── components/
        ├── utils/
        └── styles/
```

---

## Setup & Run Commands

### 1. Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:3000
```

### Both terminals must be running at the same time.

---

## Available Scripts (Frontend)

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start dev server (hot reload)      |
| `npm run build`   | Build for production               |
| `npm run preview` | Preview production build locally   |

## Available Scripts (Backend)

| Command       | Description                        |
|---------------|------------------------------------|
| `npm run dev` | Start with nodemon (auto-restart)  |
| `npm start`   | Start without nodemon              |

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```
