# Deployment Steps

This guide explains how to deploy the `Cyber-Mind` project using:
- `CYFrontend/` on Vercel
- `CYBackend/` on Railway

---

## 1. Prep the repository

1. Ensure your repo is pushed to GitHub or another Git provider.
2. Confirm the monorepo structure includes:
   - `CYFrontend/` for the React + Vite app
   - `CYBackend/` for the Node.js + Express backend

---

## 2. Backend deployment on Railway

### Step 2.1: Create a Railway project

1. Sign in to Railway: https://railway.app
2. Create a new project.
3. Add a PostgreSQL plugin or attach an existing PostgreSQL database.

### Step 2.2: Add Railway GitHub deployment

1. Connect the Railway project to your GitHub repository.
2. Select the repository containing `Cyber-Mind`.
3. Set the deploy path/root to `CYBackend`.
4. Set the build command to:
   ```bash
   npm install
   ```
5. Set the start command to:
   ```bash
   npm start
   ```

### Step 2.3: Set Railway environment variables

In Railway project settings add these env vars:

- `DATABASE_URL` = railway-provided Postgres connection URL
- `NODE_ENV` = `production`
- `FORCE_DB_SYNC` = `false`
- `SUPER_ADMIN_EMAIL` = your admin email
- `GEMINI_API_KEY` = your Gemini/OpenAI API key (if used)
- `FRONTEND_ORIGIN` = your Vercel frontend URL (for CORS)

### Step 2.4: Handle Firebase Admin credentials

The backend currently loads `CYBackend/src/config/firebase-service-account.json`.

Option A: keep the service account file in the deployed repository securely.

Option B: refactor to use environment variables for Firebase credentials.

If you keep the file:
1. Add the file to `CYBackend/src/config/firebase-service-account.json` in your Git repo.
2. Ensure Railway deployment can access it.

If you refactor to env vars, you must update `CYBackend/src/config/firebaseAdmin.js` accordingly.

### Step 2.5: Configure backend CORS and API host

The backend currently uses a hardcoded origin in `CYBackend/src/server.js`.
Update it to use `FRONTEND_ORIGIN` environment variable.

Example:
```js
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
```

### Step 2.6: Deploy the backend

1. Commit and push any necessary changes.
2. Trigger a Railway deployment.
3. Confirm the backend is reachable and returns API responses at the Railway URL.

Example backend URL:
- `https://<railway-project>.up.railway.app`

---

## 3. Frontend deployment on Vercel

### Step 3.1: Create a Vercel project

1. Sign in to Vercel: https://vercel.com
2. Create a new project from Git.
3. Select the repository containing `Cyber-Mind`.
4. Set the root directory to `CYFrontend`.

### Step 3.2: Configure Vercel build settings

- Build command: `npm run build`
- Output directory: `dist`

### Step 3.3: Set frontend environment variables

In Vercel project settings add these env vars:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_API_BASE_URL` = `https://<railway-backend>/api`
- `VITE_SUPER_ADMIN_EMAIL` = same admin email (optional)

### Step 3.4: Update frontend API base URL

Modify `CYFrontend/src/api/axios.ts` to use the environment variable instead of `http://localhost:8080/api`.

Example:
```ts
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

### Step 3.5: Deploy the frontend

1. Commit and push any changes.
2. Vercel will build and deploy the `CYFrontend` app.
3. Confirm the site is live and the frontend can call your Railway backend.

---

## 4. Final validation

### Step 4.1: Confirm working frontend

- Visit the deployed Vercel URL.
- Confirm Firebase login works.
- Confirm API requests succeed through the backend.

### Step 4.2: Confirm backend connectivity

- Ensure `CYBackend` can connect to PostgreSQL.
- Confirm the backend logs show successful DB connection.
- Confirm the backend accepts CORS from the Vercel domain.

### Step 4.3: Troubleshooting

- If the frontend fails to call the API, check `VITE_API_BASE_URL` and backend CORS origin.
- If the backend fails startup, verify `DATABASE_URL`, service account credentials, and `NODE_ENV`.

---

## 5. Notes

- This project is a split deployment: frontend on Vercel, backend on Railway.
- A full Vercel-only deployment of the backend would require converting Express to serverless functions and removing the local service account dependency.
- Keep `FORCE_DB_SYNC=false` in production unless you need destructive schema sync.
