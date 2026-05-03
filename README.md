# Cyber-Mind

**Cyber-Mind** is a full-stack cybersecurity learning platform built as a monorepo. It combines a Node.js backend with an Express API, PostgreSQL/Sequelize data layer, Firebase Authentication, and a React + Vite frontend with Redux state management.

---

## Repository Layout

- `CYBackend/` - backend server and API
  - `src/server.js` - Express app entry point
  - `src/config/db.js` - PostgreSQL/Sequelize database connection and migration helper
  - `src/config/firebaseAdmin.js` - Firebase Admin initialization using a local service account
  - `src/routes/` - API route definitions
  - `src/controllers/` - request handlers for puzzles, challenges, users, CTF, admin, and templates
  - `src/models/` - Sequelize models for `User`, `Profile`, `Puzzle`, `Challenge`, `CTFLevel`, `CommandTemplate`, and more
  - `src/services/` - business logic and modular services
  - `src/middlewares/` - auth guards and error handling
  - `src/scripts/` - maintenance and data migration scripts
- `CYFrontend/` - React application
  - `src/App.tsx` - app shell and startup user fetch
  - `src/router/` - navigation and route protection
  - `src/redux/` - Redux store and feature slices
  - `src/api/axios.ts` - configured Axios instance with Firebase ID token refresh
  - `src/firebase.ts` - Firebase SDK initialization
  - `src/pages/` - frontend pages for home, puzzles, challenges, CTF, profile, admin, etc.

---

## Key Features

### Backend

- Express server with JSON parsing, URL encoded handling, cookies, and CORS
- PostgreSQL database using Sequelize ORM
- Firebase authentication via `firebase-admin`
- Google sign-in flow with ID token verification and cookie-based session
- User role system with admin and super-admin privileges
- Puzzle CRUD and answer submission workflow
- Challenge CRUD, code execution, answer submission, and scoring
- CTF level management, command execution engine, and path-aware navigation
- Command template system supporting reusable CTF commands
- Optional guest access for puzzle attempts and protected routes for authenticated users
- Server-side error handler and recoverable DB migration for missing columns

### Frontend

- React + TypeScript + Vite application
- Redux Toolkit for user, puzzles, challenges, and CTF state
- Firebase Authentication integration for web sign-in
- Axios configured with credentials and automatic token refresh
- HashRouter-based routing with animated page transition support
- Auth guard support for profile and admin routes
- Pages for home, about, Linux practice, game/CTF, puzzles, challenges, and user profile
- Admin dashboard route for management tasks

---

## Backend Setup

### Install dependencies

```bash
cd CYBackend
npm install
```

### Required files

- `CYBackend/src/config/firebase-service-account.json` must contain Firebase service account credentials used by the Admin SDK.

### Environment variables

Create a `.env` file in `CYBackend/` or set environment variables directly.

```bash
DATABASE_URL=********
FORCE_DB_SYNC=****
NODE_ENV=development
SUPER_ADMIN_EMAIL=*****
GEMINI_API_KEY=your_google_gemini_api_key
```

Notes:
- `DATABASE_URL` is used by Sequelize to connect to PostgreSQL.
- `FORCE_DB_SYNC=true` will drop and recreate tables on startup.
- `SUPER_ADMIN_EMAIL` controls which user can grant or revoke admin access.
- `GEMINI_API_KEY` is used by the AI evaluation service in `src/services/aiService.js`.

### Run backend

```bash
npm run dev
```

Or start without Nodemon:

```bash
npm start
```

The backend listens on `http://localhost:8080` by default.

---

## Frontend Setup

### Install dependencies

```bash
cd CYFrontend
npm install
```

### Environment variables

Create a `.env` file in `CYFrontend/` with Firebase config values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Run frontend

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

---

## API Endpoints

### User

- `POST /api/users/auth/google` - sign in with Firebase ID token
- `GET /api/users/logout` - clear auth cookie
- `GET /api/users/me` - fetch authenticated user
- `PATCH /api/users/me` - update profile name or photo
- `POST /api/users/me/add-points` - award points for an item
- `GET /api/users/me/admin-status` - debug endpoint for current user/admin status

### Puzzle

- `GET /api/puzzles` - list puzzles
- `POST /api/puzzles` - create puzzle
- `GET /api/puzzles/:id` - get puzzle by ID
- `PATCH /api/puzzles/:id` - update puzzle
- `DELETE /api/puzzles/:id` - delete puzzle
- `POST /api/puzzles/:id/submit` - submit puzzle answer

### Challenge

- `GET /api/challenges` - list challenges
- `POST /api/challenges` - create challenge (admin only)
- `GET /api/challenges/:id` - get challenge details
- `PUT /api/challenges/:id` - update challenge (admin only)
- `DELETE /api/challenges/:id` - delete challenge (admin only)
- `POST /api/challenges/:id/submit` - submit challenge answer
- `POST /api/challenges/:id/run` - execute or test challenge code

### CTF

- `GET /api/ctf/info` - get overview of active CTF levels
- `GET /api/ctf/levels/available` - list available active levels
- `GET /api/ctf/info/:level` - get a level summary by number
- `GET /api/ctf/challenge/:level` - fetch challenge details for a level
- `GET /api/ctf/challenge/:level/fs` - fetch challenge data with filesystem info
- `POST /api/ctf/execute` - execute a CTF command for a level

### Admin

- `GET /api/admin/users` - list all users (admin only)
- `POST /api/admin/users/grant-admin` - grant admin to a user (super admin only)
- `POST /api/admin/users/revoke-admin` - revoke admin from a user (super admin only)

### CTF Admin

- `GET /api/ctf/admin/levels` - list all CTF levels
- `GET /api/ctf/admin/levels/:id` - get specific CTF level
- `POST /api/ctf/admin/levels` - create CTF level
- `PUT /api/ctf/admin/levels/:id` - update CTF level
- `DELETE /api/ctf/admin/levels/:id` - delete CTF level
- `PATCH /api/ctf/admin/levels/:id/toggle` - enable/disable CTF level
- `GET /api/ctf/templates` - list command templates (admin only)
- `GET /api/ctf/templates/:id` - get command template
- `POST /api/ctf/templates` - create template
- `PUT /api/ctf/templates/:id` - update template
- `DELETE /api/ctf/templates/:id` - delete template

---

## Notes

- `CYFrontend/src/api/axios.ts` is configured to send cookies and refresh Firebase ID tokens before requests.
- The backend CORS config currently allows `http://localhost:5173` and supports credentials.
- `CYBackend/src/middlewares/auth.js` exposes `protect`, `authAdmin`, and `optionalAuth` middleware.
- `CYBackend/src/services/aiService.js` includes a Gemini evaluation helper, but the corresponding route file is currently empty.
- `CYBackend/src/config/db.js` performs automatic checks for missing columns in `command_templates` and `ctf_levels` to preserve compatibility.
- The frontend uses `HashRouter` and animated route transitions via `framer-motion`.

---

## Recommended local workflow

1. Start PostgreSQL.
2. Create or update `CYBackend/.env`.
3. Place Firebase service account JSON at `CYBackend/src/config/firebase-service-account.json`.
4. Install backend dependencies and run `npm run dev`.
5. Install frontend dependencies and run `npm run dev`.
6. Open the frontend in browser and use Firebase sign-in to access protected flows.

---

## Package Scripts

### Backend (`CYBackend/package.json`)

- `npm start` - run production server
- `npm run dev` - run server with Nodemon
- `npm test` - run Jest tests
- `npm run migrate:create-profiles` - create missing profile records
- `npm run cleanup:ctf` - cleanup CTF levels

### Frontend (`CYFrontend/package.json`)

- `npm run dev` - start frontend dev server
- `npm run build` - build production bundle
- `npm run preview` - preview production build

---

## Contact and maintenance

If you extend this project, keep frontend and backend env variables consistent and update CORS origins as needed. The backend uses Firebase ID tokens plus cookie auth, so the browser and server domains must match the configured auth flow.
