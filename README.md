# 🌱 Habit Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) application for building and tracking daily habits — with streaks, a GitHub-style contribution heatmap, rich analytics, CSV/JSON/PDF/print export, light & dark mode, and a clean, responsive UI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Environment Variables](#environment-variables)
- [Running in Development](#running-in-development)
- [Building for Production](#building-for-production)
- [Deployment Notes](#deployment-notes)
- [API Endpoints](#api-endpoints)
- [Seeding Demo Data](#seeding-demo-data)

---

## Overview

Habit Tracker lets a user register, create habits (with an emoji icon, color, frequency, and goal), check them off day by day, and see their progress through a dashboard, a calendar heatmap, and detailed analytics — including per-habit and overall streaks, weekly/monthly completion charts, and exportable reports.

## Features

- **Authentication** — JWT-based register/login, protected routes, profile editing, password change
- **Habit management** — create/edit/delete habits with icon, color, frequency (Daily/Weekdays/Weekends/Custom), goal, start date, reminder time
- **Daily check-ins** — one-tap "Mark Complete" with optimistic UI updates and toast feedback
- **Dashboard** — greeting header, today's progress, current & best streak, total habits, 14-day trend chart
- **Custom-built calendar heatmap** — GitHub-style contribution grid (plain CSS grid, no external calendar library), month navigation, click-a-day side panel
- **Analytics** — weekly & monthly completion charts, per-habit performance comparison, streak statistics table
- **Export** — download your report as CSV, JSON, or PDF, or open a dedicated print-friendly view
- **Dark mode** — real `dark:` Tailwind theming, persisted and applied before paint (no flash)
- **Preferences** — start-of-week, default habit view, stored per-browser
- **Fully responsive** — sidebar nav on desktop, slide-out drawer + bottom nav on mobile
- **Polished UX** — loading skeletons, empty states, confirmation dialogs, animated progress bars, toast notifications throughout

## Tech Stack

**Frontend:** React 18, Vite, React Router DOM, Tailwind CSS v4, lucide-react, Axios, Recharts, react-hot-toast, jsPDF

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT (jsonwebtoken), bcryptjs, dotenv, cors, helmet, morgan, express-async-handler, express-validator

## Folder Structure

```
habit-tracker/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # common/, habits/, dashboard/, calendar/, analytics/
│   │   ├── pages/               # Login, Register, Dashboard, Habits, Calendar, Analytics, Profile, Settings, ...
│   │   ├── layouts/              # DashboardLayout (sidebar/mobile nav)
│   │   ├── services/             # api.js + habitService/completionService/analyticsService/authService
│   │   ├── context/               # AuthContext (useAuth)
│   │   ├── hooks/                  # useTheme, useLocalStorage
│   │   ├── utils/                   # dateUtils, exportUtils, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                      # Node/Express backend
│   ├── models/                   # User, Habit, HabitCompletion
│   ├── routes/                    # authRoutes, habitRoutes, completionRoutes, analyticsRoutes
│   ├── controllers/                # matching controllers, all asyncHandler-wrapped
│   ├── middleware/                  # authMiddleware (protect), errorMiddleware (notFound + errorHandler)
│   ├── utils/                        # analyticsUtils.js (streak/completion math), generateToken.js, seed.js
│   ├── config/db.js
│   ├── .env.example
│   └── server.js
├── .gitignore
├── README.md
└── package.json                  # root convenience scripts (concurrently runs both apps)
```

## Installation

Requires **Node.js 18+** and either a local MongoDB instance or a free MongoDB Atlas cluster.

```bash
git clone <your-repo-url> habit-tracker
cd habit-tracker
npm run install:all   # installs both client/ and server/ dependencies
```

(Or install each individually — see below.)

## Backend Setup

```bash
cd server
npm install
cp .env.example .env      # then fill in your real values
npm run dev                # starts the API on http://localhost:5000 with nodemon
```

## Frontend Setup

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL should point at your running backend
npm run dev                 # starts Vite dev server on http://localhost:5173
```

> If you ever hit a peer-dependency conflict with any package, install with `npm install --legacy-peer-deps`. This project pins `react`/`react-dom` to `^18.3.1` specifically to avoid the React 19 peer-dependency issues some chart/calendar libraries have.

## MongoDB Atlas Setup

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Cluster** (the free M0 tier is enough).
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add your current IP (or `0.0.0.0/0` for quick testing — not recommended for production).
5. Click **Connect → Drivers**, copy the connection string, and replace `<username>`, `<password>`, and add a database name, e.g.:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/habit-tracker?retryWrites=true&w=majority
   ```
6. Paste that into `server/.env` as `MONGO_URI`.

## Environment Variables

**server/.env**

| Variable     | Description                                   | Example                                    |
|--------------|------------------------------------------------|---------------------------------------------|
| `MONGO_URI`  | MongoDB connection string                      | `mongodb+srv://user:pass@cluster.../habit-tracker` |
| `JWT_SECRET` | Secret used to sign JWT auth tokens             | a long random string                        |
| `PORT`       | Port the Express server listens on              | `5000`                                       |
| `NODE_ENV`   | `development` or `production`                   | `development`                                |

**client/.env**

| Variable        | Description                  | Example                         |
|-----------------|-------------------------------|----------------------------------|
| `VITE_API_URL`  | Base URL of the backend API   | `http://localhost:5000/api`     |

## Running in Development

In two terminals (or one, using the root `npm run dev` which runs both via `concurrently`):

```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```

Visit `http://localhost:5173`.

## Building for Production

```bash
cd client
npm run build      # outputs static assets to client/dist
```

The Express server (`server/server.js`) will also serve `client/dist` automatically when `NODE_ENV=production`, so a single Node process can host both the API and the built frontend if you prefer a single-server deployment.

## Deployment Notes

A typical approach: deploy the `server/` folder to a Node host (Render, Railway, or a small VM) with your Atlas `MONGO_URI` and `JWT_SECRET` set as environment variables, and deploy `client/` to **Vercel** (or Netlify) as a static site, setting `VITE_API_URL` in the Vercel project's environment variables to your deployed API's URL; alternatively, build the client and let the Express server serve it directly (as described above) and deploy the whole app as one Node service.

## API Endpoints

All routes are prefixed with `/api`. Routes marked 🔒 require `Authorization: Bearer <token>`.

| Method | Endpoint                    | Description                                          |
|--------|------------------------------|-------------------------------------------------------|
| POST   | `/auth/register`             | Register a new user                                   |
| POST   | `/auth/login`                | Log in, returns a JWT                                  |
| GET    | `/auth/me` 🔒                | Get the current user's profile                          |
| PUT    | `/auth/me` 🔒                | Update name and/or change password                       |
| GET    | `/habits` 🔒                 | List the current user's habits                            |
| POST   | `/habits` 🔒                 | Create a habit                                              |
| GET    | `/habits/:id` 🔒             | Get a single habit (ownership-checked)                       |
| PUT    | `/habits/:id` 🔒             | Update a habit (ownership-checked)                             |
| DELETE | `/habits/:id` 🔒             | Delete a habit + its completion records (ownership-checked)      |
| GET    | `/completions` 🔒            | List completions (`?from=&to=&habitId=`, defaults to last 120d)   |
| POST   | `/completions` 🔒            | Upsert a completion for a habit + date                              |
| GET    | `/analytics/dashboard` 🔒    | Today's %, current/best streak, total habits, 14-day trend            |
| GET    | `/analytics/weekly` 🔒       | Completion % per day, current week                                     |
| GET    | `/analytics/monthly` 🔒      | Completion % per day, current (or given) calendar month                  |
| GET    | `/analytics/streaks` 🔒      | Per-habit streak/completion breakdown + overall totals                     |

## Seeding Demo Data

To populate the database with a demo user and a few weeks of realistic habit history:

```bash
cd server
npm run seed
```

This creates:

- **Email:** `demo@example.com`
- **Password:** `Demo1234`

along with 6 demo habits (💧 Drink 2L Water, 💻 Practice Coding, 🏋️ Gym Workout, 📚 Read 20 Pages, 🧘 Meditation, 😴 Sleep Before 11 PM) and ~6 weeks of randomized-but-plausible completion history, so the dashboard, calendar, and analytics all have real data to display immediately. The seed script only runs when explicitly invoked — it never runs automatically on server start, and it clears any prior demo user data before recreating it.
"# habit-tracker" 
