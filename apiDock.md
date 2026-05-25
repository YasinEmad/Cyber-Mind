# API Documentation — Cyber-Mind Backend

> Generated: May 25, 2026

## Overview
- Base URL: `http://localhost:8080` (server default). All routes are mounted under `/api`.
- Important prefixes:
  - `/api/users` — authentication & user profile
  - `/api/puzzles` — puzzles CRUD + submissions
  - `/api/challenges` — coding/security challenges + execution/submission
  - `/api/ctf` — CTF levels and execution
  - `/api/admin` — admin management
- Authentication: Firebase ID tokens are exchanged via `/api/users/auth/google` which sets an HTTP-only cookie named `token`. Protected endpoints require this cookie or equivalent authorization to be validated by `protect`/`authAdmin` middleware.
- Response envelope: most endpoints return JSON shaped as `{ success: boolean, data?: any, message?: string }`.

---

## Authentication & Sessions

### POST /api/users/auth/google
- Description: Exchange a Firebase ID token (client-side sign-in) for a server session. Sets an HTTP-only cookie `token` on success.
- Body (application/json):
  - `token` (string, required) — Firebase ID token from client.
- Rate limiting: `authLimiter` applies (see rate limits section).
- Success (200): `{ success: true, data: { id, uid, email, name, photoURL, role, solvedPuzzles, solvedChallenges, profile } }`
- Errors: 401 for missing/invalid token, 500 for server errors.

### GET /api/users/logout
- Description: Clears auth cookie.
- Success (200): `{ success: true, data: {} }`

### Protected routes
- The app uses `protect` middleware to populate `req.user` from the session cookie. Some admin-only routes use `authAdmin` (admin-level cookie verification). Grant/revoke admin endpoints additionally require `requireRole('superadmin')`.

---

## Users

### GET /api/users/me
- Auth required (`protect`).
- Returns full user record (includes `profile`).
- Success (200): `{ success: true, data: user }`

### PATCH /api/users/me
- Auth required.
- Body (application/json): any of `{ name?: string, photoURL?: string }`.
- Success (200): returns updated user object.

### POST /api/users/me/avatar
- Auth required. `multipart/form-data` file upload.
- Form field: `avatar` (file) — allowed types: `jpeg|jpg|png|webp`. Max size: 5 MB.
- Success (200): `{ success: true, message: 'Avatar uploaded successfully', data: { avatar: '<filename>' } }`

### POST /api/users/me/add-points
- Auth required.
- Body: `{ points?: number, level?: number, itemId?: number, itemType?: 'puzzle' | 'challenge' }`.
- If `level` provided, server computes points with internal utility.
- Success (200): returns updated user and `awardedPointsAmount`.

### GET /api/users/me/admin-status
- Auth required.
- Debug endpoint returning the current user's role and metadata.

---

## Puzzles
Base path: `/api/puzzles`

### GET /
- Public. Returns list of puzzles.
- Success (200): JSON array of puzzles.

### POST /
- Admin only (`authAdmin`).
- Body (application/json): Puzzle model fields. Key fields (required):
  - `title` (string)
  - `description` (string)
  - `level` (integer: 1,2,3)
  - `scenario` (string)
  - `answer` (string)
  - `category` (string)
  - Optional: `hints` (array of strings), `animation_url`, `tags`.
- Success (201): created puzzle object.

### DELETE /
- Admin only. Deletes all puzzles. Success returns removed count message.

### GET /:id
- Public. Returns puzzle with `id`.
- Errors: 400 for invalid id, 404 if not found.

### PATCH /:id
- Admin only.
- Body: partial Puzzle fields to update.
- Success: updated puzzle object.

### DELETE /:id
- Admin only. Deletes puzzle by ID.

### POST /:id/submit
- Optional auth (`optionalAuth`). Allows guests to submit answers; guests won't receive points.
- Body: `{ answer: string }`.
- Responses:
  - Incorrect: `{ correct: false, message: 'Incorrect answer...' }`
  - Correct (guest): `{ correct: true, message: 'Correct answer! (Guest — no points awarded)' }`
  - Correct (awarded): `{ correct: true, awardedPointsAmount, message, user }`

### POST /:id/hint
- Optional auth. Body: `{ hintIndex: number, amount: number }`.
- Deducts points and returns `{ success: true, deducted, alreadyUsed, totalScore, usedHints }`.

---

## Challenges
Base path: `/api/challenges`

Model highlights (see `src/models/Challenge.js`):
- `id`, `title`(string, required), `description`(text), `level` (`easy|medium|hard`, required), `hints` (array of strings), `vulnerabilityType` (enum), `initialCode`, `code`, `validationType`(`regex|exact`), `solution` (string), `points` (int)

### GET /
- Public. Returns all challenges.

### POST /
- Admin only (`authAdmin`). Body: any `Challenge` fields; `points` is auto-computed from `level` if omitted.
- Success (201): created challenge.

### DELETE /
- Admin only. Deletes all challenges.

### GET /:id
- Public. Returns challenge by id, 404 if not found.

### PUT /:id
- Admin only. Body: partial/complete challenge fields. If `level` changes, `points` is recalculated.
- Success: updated challenge object.

### DELETE /:id
- Admin only. Deletes specific challenge.

### POST /:id/submit
- Optional auth (`optionalAuth`) then `submissionLimiter`.
- Body: `{ answer: string }`.
- Response: `{ success: true, awarded: bool, awardedPointsAmount?, alreadySolved?, message }`.

### POST /:id/hint
- Optional auth. Body: `{ hintIndex: number, amount: number }` — deducts points for hint.

### POST /:id/run
- Optional auth. `executeLimiter` protects this route.
- Body: `{ code: string }`.
- Executes user code for the challenge in a restricted runner.
- Success (200): `{ success: true, output: string, error?: string }`.
- Security: carefully rate-limited; do NOT pass untrusted inputs to shell without sanitization.

### POST /:id/ai-review
- Optional auth. `executeLimiter` also applied.
- Body: `{ code: string }`.
- Returns AI evaluation JSON: `{ success: true, evaluation: { ... } }`.

---

## CTF
Base path: `/api/ctf`

### GET /info
- Public. Returns CTF info summary: levels array, each with `level`, `name`, `description`, `hints`, `difficulty`.

### GET /levels/available
- Public. Lists available active levels.

### GET /info/:level
- Public. Returns meta for a single level (no sensitive `flag` field).

### GET /challenge/:level
- Public. Returns challenge data for level (without flags).

### GET /challenge/:level/fs
- Public. Returns challenge with filesystem initialization commands (used to prepare sandbox). Note: does not include `flag` for unauthorized users.

Admin CTF management (require `authAdmin`):
- GET /admin/levels — list all levels.
- GET /admin/levels/:id — single level.
- POST /admin/levels — create new level.
  - Body (application/json): required fields include `level` (int), `title`, `description`, `flag` (string), `hint` or `hints` (array), and either `commands` (array) or `commandTemplates`/`customCommands`.
- PUT /admin/levels/:id — update level.
- DELETE /admin/levels/:id — delete.
- PATCH /admin/levels/:id/toggle — toggle `isActive` boolean.

Command templates (admin only):
- GET /templates
- GET /templates/:id
- POST /templates — create command template.
  - Body: `{ name: string, baseCommand?: string, commands?: array, fields?: array, allowedPaths?: array, blockedPaths?: array, defaultOutput?: string, description?: string }`.
- PUT /templates/:id
- DELETE /templates/:id

### POST /execute
- Auth required (`protect`) then `executeLimiter`.
- Body: `{ command: string, context?: object }` depending on frontend needs.
- Executes a command in the CTF execution environment (rate-limited).

### POST /verify-flag/:level
- Auth required. Body: `{ flag: string }` usually derived from user input.
- `flagLimiter` rate limits submissions. Success awards completion and stores results.

### GET /user-progress/:level
- Auth required. Returns user's progress for that level.

### GET /user-completed-levels
- Auth required. Returns all levels completed by the user.

---

## Admin
Base path mounted at `/api/admin`

### GET /users
- Admin-only (`authAdmin`). Returns list of users.

### POST /users/grant-admin
- Auth & `requireRole('superadmin')` required; `adminLimiter` rate-limited.
- Body: `{ email: string }`.
- Success: `{ success: true, message: 'Admin access granted', data: { id, email, role } }`.
- Important: Cannot change role of the super-admin account as defined by `SUPER_ADMIN_EMAIL` in env.

### POST /users/revoke-admin
- Same requirements and body as grant-admin; revokes admin role.

---

## Common Request/Response Examples

- JSON request example (create challenge):
```json
{
  "title": "SQL Injection: Login Bypass",
  "description": "Fix the login filter",
  "level": "medium",
  "hints": ["Sanitize inputs", "Use parameterized queries"],
  "vulnerabilityType": "Injection",
  "initialCode": "...",
  "solution": "' OR '1'='1'",
  "validationType": "exact"
}
```

- Submission example (challenge answer):
```json
{ "answer": "correct-solution" }
```

- Run code example:
```json
{ "code": "console.log('hello world')" }
```

---

## Rate limits & Security
- Key limiters in `src/middlewares/rateLimiter.js` (applied where noted):
  - `authLimiter` for auth endpoints.
  - `submissionLimiter` for puzzle/challenge submissions.
  - `executeLimiter` for code execution and AI review endpoints (strict).
  - `flagLimiter` for CTF flag verification.
- File uploads: avatars limited to images and 5MB.
- Sensitive data: flags are never returned to public endpoints; `getCTFChallenge` explicitly omits `flag`.
- Admin operations are RBAC protected. `SUPER_ADMIN_EMAIL` is required in environment and is specially protected from role changes.

---

## Error handling
- Server errors return 500 with `{ success: false, message }` (stack only in dev).
- Common client errors: 400 (bad request), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict).
- Submission endpoints frequently return structured objects like `{ success: true, awarded: boolean, awardedPointsAmount? }`.

---

## Implementation notes & pointers for integrators
- Authenticate on the client with Firebase; send the ID token to `/api/users/auth/google` to create a server session cookie.
- Use cookies (HTTP-only) for subsequent authenticated requests — `protect` expects the `token` cookie.
- For anonymous submissions use optional endpoints: `optionalAuth` allows guests to submit but they won't receive points.
- For endpoints that accept arrays/JSON fields stored in DB (`commands`, `customCommands`, `commandTemplates`, `hint(s)`) provide JSON-compatible values.
- When using code execution endpoints, expect synchronous JSON results with `output` and `error` keys; respect rate limits.

---

## Helpful links (code references)
- Router mounts: [CYBackend/src/server.js](CYBackend/src/server.js#L1-L999)
- User controllers: [CYBackend/src/controllers/userController.js](CYBackend/src/controllers/userController.js#L1-L400)
- Puzzle controllers: [CYBackend/src/controllers/puzzleController.js](CYBackend/src/controllers/puzzleController.js#L1-L400)
- Challenge controllers: [CYBackend/src/controllers/challengeController.js](CYBackend/src/controllers/challengeController.js#L1-L400)
- CTF controller: [CYBackend/src/controllers/ctfLevelController.js](CYBackend/src/controllers/ctfLevelController.js#L1-L200)
- Command templates: [CYBackend/src/controllers/commandTemplateController.js](CYBackend/src/controllers/commandTemplateController.js#L1-L200)

---

If you want, I can:
- Generate OpenAPI/Swagger JSON from these routes.
- Add example curl commands for each endpoint.
- Create a Postman collection.

