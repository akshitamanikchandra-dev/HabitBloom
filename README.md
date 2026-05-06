# HabitBloom

> A kawaii habit tracker built with the MERN stack and Vite.

---

## 🔗 Links

| | |
|---|---|
| 📹 **Code Explanation Video** | `[https://drive.google.com/file/d/1nNvT38iyq3LwGSpiMXNHDdlH7K5EGlEL/view?usp=sharing]` |
| 🚀 **Live Project Demo** | `[https://drive.google.com/file/d/1_tch593y1oSx_2v7T1zHoCEkYkv3re5B/view?usp=sharing]` |

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Render Deployment](#render-deployment)
- [CRA → Vite Migration Notes](#cra--vite-migration-notes)

---

## 🌿 About the Project

HabitBloom is a full-stack habit tracking web application that helps users build and maintain daily habits. It features a warm, earthy UI with dark mode support, streak tracking, analytics charts, and a GitHub-style habit calendar.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |

---

## ✨ Features

- 🔐 **Auth** — Signup / Login with JWT, protected routes
- 📋 **Habits** — Create custom habits with icons, colors, frequency, and tracking types (checkbox / number / slider)
- 🏠 **Dashboard** — Today's habits with streak stats, completion rate, and motivational messages
- 📊 **Analytics** — Weekly bar chart, per-habit area charts, month-over-month comparison insights
- 📅 **Habit Calendar** — GitHub-style yearly heatmap grid
- 🌙 **Dark Mode** — Full light/dark theme toggle persisted to localStorage
- 🔔 **EOD Reminder** — End-of-day popup if habits are incomplete after 8 PM
- 🔥 **Streak Popup** — Celebration animation when a habit is completed

---

## 📁 Project Structure

```
habitbloom/
├── package.json              # Root package.json (Render build scripts)
├── render.yaml               # Render deployment blueprint
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Habit.js
│   │   └── HabitLog.js
│   ├── routes/
│   │   ├── auth.js              # /api/auth
│   │   ├── habits.js            # /api/habits
│   │   └── logs.js              # /api/logs
│   ├── server.js
│   ├── .env                     # Local env (git-ignored)
│   ├── .env.example             # Template for env vars
│   └── package.json
│
└── frontend/
    ├── index.html               # Vite entry HTML (project root)
    ├── vite.config.js           # Vite config + API proxy
    ├── package.json
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Routes + providers
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── HabitsPage.jsx
        │   ├── AnalyticsPage.jsx
        │   └── ProfilePage.jsx
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.jsx
        │   │   └── Sidebar.jsx
        │   ├── habits/
        │   │   ├── HabitCard.jsx
        │   │   └── AddHabitModal.jsx
        │   ├── analytics/
        │   │   └── CalendarGrid.jsx
        │   └── common/
        │       ├── LoadingSpinner.jsx
        │       ├── StreakPopup.jsx
        │       ├── ThemeToggle.jsx
        │       ├── Toast.jsx
        │       └── EodReminder.jsx
        ├── utils/
        │   ├── api.js           # Axios instance + interceptors
        │   └── helpers.js       # Greetings, avatars, constants
        └── styles/
            └── globals.css      # CSS variables, themes, layout
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/akshitamanikchandra-dev/HabitBloom.git
cd HabitBloom
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev        # starts on http://localhost:5000
```

### 3. Set up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:3000
```

### 4. Open the app

Visit **http://localhost:3000** in your browser.

> Both terminals (backend + frontend) must be running simultaneously.

---

## ⚙️ Environment Variables

Create a file at `backend/.env` with the following:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/habitbloom
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `PORT` | Port the backend server listens on |
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | Token expiry duration (e.g. `30d`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL (used for CORS in production) |

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/signup` | Register a new user | ❌ |
| POST | `/login` | Login with username/email + password | ❌ |
| GET | `/me` | Get current logged-in user | ✅ |
| PUT | `/update-profile` | Update display name, avatar, gender | ✅ |
| PUT | `/change-password` | Change user password | ✅ |

### Habits — `/api/habits`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Get all active habits | ✅ |
| POST | `/` | Create a new custom habit | ✅ |
| PUT | `/:id` | Update a habit | ✅ |
| DELETE | `/:id` | Soft-delete a habit | ✅ |
| GET | `/stats/overview` | Get streak + completion stats | ✅ |

### Logs — `/api/logs`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Toggle a habit log (create or undo) | ✅ |
| PUT | `/` | Upsert a quantified habit log | ✅ |
| GET | `/` | Get logs for a date range | ✅ |
| GET | `/calendar` | Get yearly calendar data | ✅ |
| GET | `/analytics` | Get analytics + chart data | ✅ |

---

## 🚀 Render Deployment

This project includes a `render.yaml` blueprint for one-click deployment to [Render](https://render.com).

### Quick Deploy

1. Push your code to GitHub
2. Go to the [Render Dashboard](https://dashboard.render.com)
3. Click **New → Blueprint** and connect your GitHub repo
4. Render will auto-detect `render.yaml` and set up the service
5. Add your environment variables (`MONGODB_URI`, `JWT_SECRET`, etc.) in the Render dashboard

### How It Works

- The backend serves the frontend production build as static files
- A single Render **Web Service** handles both API routes and the React SPA
- Build command: `npm install && npm run build`
- Start command: `npm start`

---

## 🔄 CRA → Vite Migration Notes

This project was originally built with **Create React App** and converted to **Vite**.

| | CRA (original) | Vite (current) |
|---|---|---|
| Entry HTML | `public/index.html` | `index.html` (project root) |
| Entry JS | `src/index.js` | `src/main.jsx` |
| Components | `*.js` | `*.jsx` |
| Dev command | `react-scripts start` | `vite` |
| Build command | `react-scripts build` | `vite build` |
| API proxy | `"proxy"` in `package.json` | `server.proxy` in `vite.config.js` |
| Image refs in HTML | `%PUBLIC_URL%/img.png` | `/img.png` |
| Config file | None (CRA handles it) | `vite.config.js` |

---

## 📜 Available Scripts

### Frontend (`/frontend`)

```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run preview   # Preview the production build locally
```

### Backend (`/backend`)

```bash
npm run dev       # Start with nodemon (auto-restart on changes)
npm start         # Start without nodemon
```

### Root (for Render deployment)

```bash
npm install       # Install all dependencies (backend + frontend)
npm run build     # Build the frontend for production
npm start         # Start the backend (serves frontend in production)
```

---

## 👩‍💻 Author

Built as a full-stack MERN project.
