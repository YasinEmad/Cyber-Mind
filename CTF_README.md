# CTF System — Cyber-Mind

This document explains the Capture-The-Flag (CTF) subsystem used in this repository: architecture, data model, API endpoints, how levels are seeded and executed, and how the frontend interacts with the backend.

## Overview
- Purpose: provide interactive, filesystem-like CTF levels where users explore, run commands, and retrieve flags.
- Components:
  - Backend: `CYBackend` serves CTF level data, manages command templates, and exposes admin APIs for creating/updating levels.
  - Frontend: `CYFrontend` fetches level metadata and challenge payloads to render interactive terminals and simulated filesystems.

## Backend architecture

- Models
  - `CTFLevel` ([CYBackend/src/models/CTFLevel.js](CYBackend/src/models/CTFLevel.js)) — Sequelize model storing level number, title, description, hints (JSON), flag, difficulty, commands (JSON), success conditions, and initial directory. Important fields:
    - `level` (int, unique)
    - `title`, `description`, `hint` (JSON array)
    - `flag` (string)
    - `commands` (JSON) — prebuilt command objects or snapshots of expanded templates
    - `requiredCommandSequence` (JSON) — optional sequence to validate progress
    - `successCondition` (string) — optional validation expression or simple indicator

- Controllers
  - `ctfController` ([CYBackend/src/controllers/ctfController.js](CYBackend/src/controllers/ctfController.js)) exposes endpoints to:
    - List public CTF info: `getCTFInfo()` — returns minimal metadata for active levels.
    - Get specific level metadata: `getCTFLevelInfo(level)`.
    - Get full challenge payload: `getCTFChallenge(level)` / `getCTFChallengeWithFS(level)` — returns commands, hints, flag, initial directory, and filesystem flags for frontend initialization.
    - Admin CRUD for levels: `getAllCTFLevels`, `createCTFLevel`, `updateCTFLevel`, `delete`.
    - Manage command templates (DB-backed): create, update, delete, expand templates into concrete command objects.

- Command templates
  - Templates are stored in `CommandTemplate` model and can be referenced from level creation requests. The controller includes `expandTemplate()` logic that snapshots a template into a concrete command object when creating a level.

## Level data & seeds

- Example seed data can be found under `CYBackend/src/data/ctfLevels.js` and `ctfinfo.js`. The seed file defines challenge descriptions, hints, flags and filesystem modifications (fsMods) used by the frontend to simulate the environment. See: [CYBackend/src/data/ctfLevels.js](CYBackend/src/data/ctfLevels.js).

- Typical seed structure for a challenge includes:
  - `description`, `hint`, `flag`.
  - `fsModifications` or `fsMods` to describe files, directories, permissions, or environment variables the frontend should set up in its simulated filesystem.

## How a challenge works (runtime flow)

1. Frontend requests level metadata (public list or individual level) from backend endpoints.
2. When the user opens a challenge, frontend fetches the full challenge payload (`getCTFChallengeWithFS`) including commands and fs-mods.
3. Frontend initializes a simulated filesystem and terminal using the provided `initialDirectory` and `fsModifications`.
4. User runs commands in the simulated terminal. The frontend interprets commands against the `commands` array and templates provided by the backend; command outputs, file reads, and permission checks are simulated on the client side.
5. The frontend checks success conditions (e.g., matching `successCondition`, or the user providing the correct `flag`) and awards progress/points.

Notes on security: flags are stored in the DB and delivered with challenge payloads to the frontend in this implementation; if you want stronger security, only deliver non-sensitive information to public clients and validate submitted flags server-side.

## API endpoints (summary)

- Public:
  - `GET /api/ctf` — list active levels (metadata).
  - `GET /api/ctf/:level` — get single level metadata.
  - `GET /api/ctf/:level/challenge` — full challenge payload (commands, hints, flag, fs info).

- Admin (authenticated):
  - `GET /api/ctf/admin` — list all levels.
  - `POST /api/ctf` — create a level (supports `commands` or `commandTemplates` expansion).
  - `PUT /api/ctf/:id` — update level.
  - `DELETE /api/ctf/:id` — delete level.
  - `GET/POST/PUT/DELETE` for command templates under admin routes.

Refer to the controller for exact request/response shapes: [CYBackend/src/controllers/ctfController.js](CYBackend/src/controllers/ctfController.js).

## Creating a new level (admin flow)

1. Prepare payload with required fields: `level`, `title`, `description`, `hint` (array), `flag`, and either `commands` (concrete command objects) or `commandTemplates` (array of {templateId, values}).
2. POST to `POST /api/ctf` as an admin.
3. The controller will expand templates (if provided), validate required fields, and create the `CTFLevel` record.

Example minimal create body:

```json
{
  "level": 4,
  "title": "Find the secret file",
  "description": "...",
  "hint": ["Try ls -a"],
  "flag": "CTF{example_flag}",
  "commands": [ /* command objects or empty if using templates */ ]
}
```

## Frontend integration notes

- The frontend uses the challenge payload to set up a simulated environment: initial working directory, files, and environment variables. The commands array provides the accepted commands and their outputs (or templates to generate outputs).
- Admin UI components that manage levels and command templates are in `CYFrontend` (look for files named `CTFLevelsAdmin` and command template components).

## Running locally (quick start)

1. Backend
  - From `CYBackend`: install deps and run the server (see `package.json` scripts).
  - Ensure DB config in `CYBackend/src/config/db.js` is set (SQLite / Postgres as configured).
  - Run seed scripts (if present) such as `seedCTFLevels.js` to populate default levels.

2. Frontend
  - From `CYFrontend`: install deps and run `npm run dev` (Vite). The frontend will call backend endpoints configured in `src/api/ctfService.ts` or similar.

## Extending and customizing

- To add richer command behavior, extend the command template system and expand fields that allow `allowedPaths`, `blockedPaths`, `output` customization, or scriptable success checks.
- To harden flags, avoid sending `flag` in public endpoints; instead, accept flag submissions via a `POST /api/ctf/:level/submit` endpoint that validates on the server and returns success/score.

## Files to review
- [CYBackend/src/models/CTFLevel.js](CYBackend/src/models/CTFLevel.js)
- [CYBackend/src/controllers/ctfController.js](CYBackend/src/controllers/ctfController.js)
- [CYBackend/src/data/ctfLevels.js](CYBackend/src/data/ctfLevels.js)

---
If you'd like, I can:
- add a secure flag-submission endpoint that validates flags server-side,
- move flags out of public payloads and update frontend to submit flags,
- or expand the README with examples of frontend terminal integration and code snippets.

Tell me which of those you'd like next.
