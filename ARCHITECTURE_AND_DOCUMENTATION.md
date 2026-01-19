# Cyber-Mind: Comprehensive System Architecture & Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Project Type:** Full-Stack Cybersecurity Learning Platform  
**Tech Stack:** MERN (MongoDB, Express, React, Node.js) + Firebase Authentication

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema & Models](#database-schema--models)
6. [API Documentation](#api-documentation)
7. [Frontend Architecture](#frontend-architecture)
8. [Authentication & Security](#authentication--security)
9. [Getting Started](#getting-started)
10. [Code Improvements & Security Recommendations](#code-improvements--security-recommendations)

---

## Executive Summary

**Cyber-Mind** is an interactive, gamified cybersecurity learning platform designed to teach practical security skills through engaging puzzles, challenges, and games. The system follows a **client-server architecture** with:

- **Backend:** Node.js/Express server with MongoDB for persistence
- **Frontend:** React with TypeScript, Vite build tool, Redux state management
- **Authentication:** Firebase (Google/GitHub OAuth)
- **Design Pattern:** MVC (Model-View-Controller) on backend, Redux + React Router on frontend

**Core Features:**
- ✅ User authentication with Google/GitHub OAuth
- ✅ Tiered puzzle system (3 difficulty levels)
- ✅ Challenge system with code validation
- ✅ Points/reputation system with leaderboards
- ✅ Admin dashboard for content management
- ✅ User profiles with achievement tracking

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   React 19 + TypeScript + Vite                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Redux Store (User, Puzzles, Challenges)         │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │          │                                                │   │
│  │   Firebase SDK  ◄──► Google/GitHub OAuth                │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (CORS)                          │
│         Express.js Server (Port 8080)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Routes:                                                │   │
│  │  • /api/users      (Auth, Profile Management)           │   │
│  │  • /api/puzzles    (Puzzle CRUD & Submission)           │   │
│  │  • /api/challenges (Challenge CRUD & Validation)        │   │
│  │  • /api/admin      (Admin Operations)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────┬──────────────────────────────────────────────────┬────┘
          │                                                  │
          ▼                                                  ▼
    ┌──────────────────┐                          ┌──────────────────┐
    │  Firebase Admin  │                          │  MongoDB Atlas   │
    │  SDK (Token      │                          │  (Data Storage)  │
    │  Verification)   │                          │                  │
    │                  │                          │  • Users         │
    │                  │                          │  • Profiles      │
    └──────────────────┘                          │  • Puzzles       │
                                                  │  • Challenges    │
                                                  │  • Achievements  │
                                                  └──────────────────┘
```

### Design Patterns Used

| Pattern | Location | Purpose |
|---------|----------|---------|
| **MVC** | Backend Controllers/Models/Routes | Separation of concerns |
| **Service Layer** | `services/*.js` | Business logic encapsulation |
| **Middleware Chain** | Express middlewares | Request authentication & validation |
| **Redux** | Frontend state management | Centralized app state |
| **Atomic Updates** | MongoDB `findOneAndUpdate` | Prevent race conditions in point calculations |
| **OAuth 2.0** | Firebase integration | Secure, delegated authentication |

---

## Technology Stack

### Backend
- **Runtime:** Node.js (Latest LTS recommended)
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB 7.5.0 (Mongoose ODM)
- **Authentication:** Firebase Admin SDK 13.6.0
- **Development Tools:**
  - Nodemon (Hot reload)
  - Dotenv (Environment variables)
  - Jest (Testing framework)
  - Babel (ES6+ transpilation)
- **Additional Libraries:**
  - CORS (Cross-Origin Resource Sharing)
  - Cookie-Parser (Session persistence)
  - OpenAI SDK (For future AI features)

### Frontend
- **Framework:** React 19.1.0 (with Hooks)
- **Language:** TypeScript 5.7.2
- **Build Tool:** Vite 6.2.0
- **State Management:** Redux Toolkit 2.10.1
- **Routing:** React Router DOM 7.7.0
- **UI Components:**
  - Lucide React (Icons)
  - Framer Motion (Animations)
  - Lottie React (Complex animations)
- **Styling:** Tailwind CSS 4.1.11 (Utility-first CSS)
- **HTTP Client:** Axios 1.13.2
- **Notifications:** React Hot Toast 2.6.0
- **Code Editor:** Monaco Editor 4.7.0

### Authentication
- **Firebase Console:** OAuth Configuration
- **Providers:** Google, GitHub
- **Token Management:** Firebase ID tokens (JWT-based)
- **Session:** HttpOnly cookies (Secure)

---

## Project Structure

### Backend Structure

```
CYBackend/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── db.js                  # MongoDB connection
│   │   ├── firebaseAdmin.js       # Firebase Admin SDK init
│   │   ├── firebase-service-account.json  # Firebase credentials
│   │   └── redis.js               # Redis config (not yet used)
│   │
│   ├── models/                    # Mongoose schemas
│   │   ├── User.js                # User profile & auth data
│   │   ├── Profile.js             # User stats & achievements
│   │   ├── Puzzle.js              # Puzzle definitions
│   │   ├── Challenge.js           # Challenge definitions
│   │   ├── Leaderboard.js         # Leaderboard (empty)
│   │   ├── Achievement.js         # Achievement definitions
│   │   └── Certificate.js         # Certificates (future)
│   │
│   ├── controllers/               # Request handlers
│   │   ├── userController.js      # Auth, profile updates
│   │   ├── puzzleController.js    # Puzzle operations & validation
│   │   ├── challengeController.js # Challenge operations & validation
│   │   ├── leaderboardController.js  # Leaderboard (empty)
│   │   ├── adminController.js     # Admin operations (empty)
│   │   └── submissionController.js # Submission tracking (empty)
│   │
│   ├── services/                  # Business logic layer
│   │   ├── userService.js         # User operations (find/create, add points)
│   │   ├── puzzleService.js       # Puzzle validation & scoring
│   │   ├── challengeService.js    # Challenge validation & scoring
│   │   ├── leaderboardService.js  # Leaderboard calculations
│   │   ├── adminService.js        # Admin operations
│   │   └── aiService.js           # AI features (OpenAI integration)
│   │
│   ├── middlewares/               # Express middlewares
│   │   ├── auth.js                # Authentication guards
│   │   │   ├── protect()          # Require authentication
│   │   │   ├── authAdmin()        # Require admin role
│   │   │   └── optionalAuth()     # Optional authentication
│   │   └── errorHandler.js        # Global error handling (currently empty)
│   │
│   ├── routes/                    # API route definitions
│   │   ├── userRoutes.js          # User endpoints
│   │   ├── puzzleRoutes.js        # Puzzle endpoints
│   │   ├── challengeRoutes.js     # Challenge endpoints
│   │   ├── adminRoutes.js         # Admin endpoints
│   │   ├── leaderboardRoutes.js   # Leaderboard endpoints (empty)
│   │   ├── submissionRoutes.js    # Submission tracking (empty)
│   │   └── aiRoutes.js            # AI integration endpoints
│   │
│   ├── utils/                     # Utility functions
│   │   ├── points.js              # Puzzle scoring logic (Level 1→10, 2→15, 3→20)
│   │   └── challingesPoints.js    # Challenge scoring (Easy→20, Medium→40, Hard→70)
│   │
│   ├── scripts/                   # Database seeding & maintenance
│   │   ├── seedPuzzles.js         # Populate initial puzzles
│   │   ├── seedChallenges.js      # Populate initial challenges
│   │   ├── setAdminByEmail.js     # Make user an admin
│   │   ├── createMissingProfiles.js  # Fix missing profile references
│   │   ├── deleteAllPuzzles.js    # Clear puzzle collection
│   │   └── fixMissingPuzzleLevels.js # Data migration
│   │
│   ├── server.js                  # Express app initialization & server start
│   └── nodemon.json               # Nodemon watch config
│
├── package.json                   # Dependencies & scripts
├── babel.config.js                # Babel configuration
└── eslint.config.js               # ESLint rules
```

### Frontend Structure

```
CYFrontend/
├── src/
│   ├── App.tsx                    # Root component, user fetch on mount
│   ├── index.tsx                  # React DOM render entry point
│   ├── firebase.ts                # Firebase SDK init
│   ├── types.ts                   # TypeScript interfaces
│   ├── index.css                  # Global styles
│   ├── vite-env.d.ts              # Vite environment types
│   │
│   ├── api/                       # API client layer
│   │   ├── axios.ts               # Axios instance with interceptors
│   │   └── challenges.ts          # Challenge API calls
│   │
│   ├── components/                # Reusable React components
│   │   ├── Navbar.tsx             # Navigation header
│   │   ├── PageWrapper.tsx        # Page layout wrapper
│   │   ├── ChallengeCard.tsx      # Challenge preview card
│   │   ├── ChallengeView.tsx      # Challenge detail view
│   │   ├── ChallengeSidebar.tsx   # Challenge sidebar
│   │   ├── ChallengeHeader.tsx    # Challenge header
│   │   ├── ChallengeSolvedAlert.tsx  # Success notification
│   │   ├── PuzzleCard.tsx         # Puzzle preview card
│   │   ├── PuzzleForm.tsx         # Puzzle creation/editing form
│   │   ├── SolvePuzzleLeft.tsx    # Puzzle display panel
│   │   ├── SolvePuzzleRight.tsx   # Puzzle submission panel
│   │   ├── LeaderboardItem.tsx    # Leaderboard entry
│   │   ├── MainFeatures.tsx       # Landing page features
│   │   ├── GrantAdminSection.tsx  # Admin control panel
│   │   ├── DeleteAlert.tsx        # Delete confirmation modal
│   │   ├── PuzzlesViewAdmin.tsx   # Admin puzzle management
│   │   └── SidebarItem.tsx        # Sidebar menu item
│   │
│   ├── layouts/                   # Layout components
│   │   └── MainLayout.tsx         # Primary layout template
│   │
│   ├── pages/                     # Page-level components
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── LoginPage.tsx          # Authentication page
│   │   ├── PuzzlePage.tsx         # Browse puzzles
│   │   ├── SolvePuzzlePage.tsx    # Solve individual puzzle
│   │   ├── ChallengePage.tsx      # Browse challenges
│   │   ├── PlayChallengePage.tsx  # Solve individual challenge
│   │   ├── GamePage.tsx           # Game mode page
│   │   ├── LeaderboardPage.tsx    # Leaderboard view
│   │   ├── ProfilePage.tsx        # User profile page
│   │   ├── AboutPage.tsx          # About page
│   │   ├── PlayLevelPage.tsx      # Level-based gameplay
│   │   └── AdminDashboard.tsx     # Admin control panel
│   │
│   ├── lib/                       # Utility hooks & functions
│   │   ├── points.ts              # Point calculation utilities
│   │   └── usePlayChallenge.ts    # Challenge gameplay hook
│   │
│   ├── redux/                     # State management
│   │   ├── store.ts               # Redux store configuration
│   │   ├── slices/
│   │   │   ├── userSlice.ts       # User state (auth, profile)
│   │   │   ├── puzzleSlice.ts     # Puzzles state
│   │   │   ├── challengeSlice.ts  # Challenges state
│   │   │   └── leaderboardSlice.ts # Leaderboard state
│   │   └── hooks.ts               # Custom Redux hooks
│   │
│   └── router/                    # Route definitions
│       └── routes.tsx             # React Router configuration
│
├── public/
│   └── assets/
│       ├── game.json              # Lottie animation
│       ├── puzzle.json            # Lottie animation
│       ├── loginanimation.json    # Lottie animation
│       ├── security code challinging.json  # Lottie animation
│       └── prof.json              # Lottie animation
│
├── index.html                     # HTML entry point
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
└── metadata.json                  # App metadata

```

---

## Database Schema & Models

### User Model
```javascript
{
  uid: String (Firebase UID, unique),
  email: String (unique, required),
  name: String,
  photoURL: String,
  role: String (enum: ['user', 'admin'], default: 'user'),
  profile: ObjectId (ref: Profile),
  solvedPuzzles: [ObjectId] (ref: Puzzle),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Purpose:** Stores authentication data and links to user profile & achievements.

**Unique Constraints:** `uid`, `email`

**Pre-save Hook:** Automatically creates a Profile document on user creation.

---

### Profile Model
```javascript
{
  user: ObjectId (ref: User, required),
  rating: Number (default: 0),
  solvedPuzzles: [ObjectId] (ref: Puzzle),
  solvedChallenges: [ObjectId] (ref: Challenge),
  puzzlesDone: Number (default: 0),
  challengesDone: Number (default: 0),
  flags: Number (default: 0, future use),
  totalScore: Number (default: 0),
  globalRank: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Purpose:** Tracks user achievements, scores, and completion statistics.

**Indexes:** None currently (consider adding for performance).

---

### Puzzle Model
```javascript
{
  title: String (required),
  description: String (required),
  level: Number (enum: [1, 2, 3], required),
  hints: [String],
  animation_url: String,
  scenario: String (required),
  tag: String (unique, required),
  answer: String (required, select: false for security),
  category: String (required),
  active: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Purpose:** Defines individual puzzles with tiered difficulty.

**Security Note:** Answer field has `select: false` to prevent exposure via normal queries.

**Indexes:**
- `{ category: 1, level: 1 }`
- `{ active: 1 }`

**Point Mapping:**
- Level 1: 10 points
- Level 2: 15 points
- Level 3: 20 points

---

### Challenge Model
```javascript
{
  title: String (required),
  description: String,
  code: String,
  level: String (enum: ['easy', 'medium', 'hard'], required),
  hints: [String],
  challengeDetails: String,
  recommendation: String,
  feedback: String,
  solution: String (required, select: false),
  validationType: String (enum: ['regex', 'exact'], default: 'regex'),
  points: Number (default: 0),
  createdAt: Date (auto)
}
```

**Purpose:** Defines code/security challenges with flexible validation.

**Validation Types:**
- `regex`: Solution pattern matched via RegExp (flexible)
- `exact`: Exact string match (strict)

**Point Mapping:**
- Easy: 20 points
- Medium: 40 points
- Hard: 70 points

**Indexes:**
- `{ level: 1, points: -1 }`

---

### Achievement Model
```javascript
(Currently defined but unused in active code)
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,
  requirement: Object
}
```

---

### Certificate Model
```javascript
(Currently defined but unused in active code)
{
  _id: ObjectId,
  userId: ObjectId,
  certificateType: String,
  issuedAt: Date
}
```

---

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Header
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```
OR
```
Cookie: token=<FIREBASE_ID_TOKEN>
```

---

### User Endpoints

#### 1. Google Sign-In / Create User
**POST** `/users/auth/google`

**Request Body:**
```json
{
  "token": "FIREBASE_ID_TOKEN"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "name": "User Name",
    "photoURL": "https://...",
    "profile": {
      "_id": "profile_id",
      "totalScore": 0,
      "puzzlesDone": 0,
      "challengesDone": 0
    }
  }
}
```

**Security:**
- Verifies Firebase token server-side
- Enforces email verification (except GitHub)
- Sets HttpOnly cookie for session

---

#### 2. Logout
**GET** `/users/logout`

**Response (200 OK):**
```json
{ "success": true, "data": {} }
```

**Effect:** Clears authentication cookie.

---

#### 3. Get Current User
**GET** `/users/me` (Protected)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "uid": "...",
    "email": "...",
    "name": "...",
    "profile": { ... },
    "solvedPuzzles": ["id1", "id2"]
  }
}
```

---

#### 4. Update User Profile
**PATCH** `/users/me` (Protected)

**Request Body:**
```json
{
  "name": "New Name",
  "photoURL": "https://..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { "updated user object" }
}
```

---

#### 5. Add Points (Manual)
**POST** `/users/me/add-points` (Protected)

**Request Body:**
```json
{
  "points": 50,
  "level": 2,
  "itemId": "puzzle_or_challenge_id",
  "itemType": "puzzle" // or "challenge"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { "updated user" },
  "awardedPointsAmount": 15
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "You have already earned points for this item."
}
```

---

### Puzzle Endpoints

#### 1. Get All Puzzles
**GET** `/puzzles`

**Query Parameters:**
- `category` (optional): Filter by category
- `level` (optional): Filter by level (1, 2, or 3)

**Response (200 OK):**
```json
[
  {
    "_id": "puzzle_id",
    "title": "Puzzle Title",
    "description": "...",
    "level": 2,
    "category": "Cryptography",
    "scenario": "You found a locked door...",
    "tag": "puzzle_xyz",
    "hints": ["Hint 1", "Hint 2"],
    "active": true
  }
]
```

**Note:** Answer field is never exposed by default.

---

#### 2. Get Single Puzzle
**GET** `/puzzles/:id`

**Response (200 OK):** Single puzzle object (same as above).

**Error (404):**
```json
{ "message": "Puzzle not found" }
```

---

#### 3. Create Puzzle (Admin only)
**POST** `/puzzles` (Admin Protected)

**Request Body:**
```json
{
  "title": "New Puzzle",
  "description": "Solve this...",
  "level": 2,
  "scenario": "You are a security analyst...",
  "tag": "unique_tag",
  "answer": "correct_answer",
  "category": "Network Security",
  "hints": ["Hint 1"],
  "animation_url": "https://...",
  "active": true
}
```

**Response (201 Created):** Created puzzle object.

**Error (400):**
```json
{ "message": "Tag already exists" }
```

---

#### 4. Update Puzzle
**PATCH** `/puzzles/:id` (Admin Protected)

**Request Body:** (any fields to update)
```json
{
  "title": "Updated Title",
  "level": 3
}
```

**Response (200 OK):** Updated puzzle object.

---

#### 5. Delete Puzzle
**DELETE** `/puzzles/:id` (Admin Protected)

**Response (200 OK):**
```json
{ "message": "Puzzle removed" }
```

---

#### 6. Submit Puzzle Answer
**POST** `/puzzles/:id/submit` (Optional Auth)

**Request Body:**
```json
{
  "answer": "user_submitted_answer"
}
```

**Response (200 OK - Correct):**
```json
{
  "correct": true,
  "awardedPointsAmount": 15,
  "message": "Correct answer! Points awarded.",
  "user": { "updated user object" }
}
```

**Response (200 OK - Correct, Already Solved):**
```json
{
  "correct": true,
  "alreadySolved": true,
  "message": "Already solved. No points awarded."
}
```

**Response (200 OK - Correct, Guest):**
```json
{
  "correct": true,
  "guest": true,
  "message": "Correct answer! (Guest — no points awarded)"
}
```

**Response (200 OK - Incorrect):**
```json
{
  "correct": false,
  "message": "Incorrect answer, please try again."
}
```

---

### Challenge Endpoints

#### 1. Get All Challenges
**GET** `/challenges`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "challenge_id",
      "title": "SQL Injection Challenge",
      "description": "...",
      "level": "medium",
      "points": 40,
      "hints": ["Hint 1"]
    }
  ]
}
```

**Note:** Solution field is never exposed.

---

#### 2. Get Single Challenge
**GET** `/challenges/:id`

**Response (200 OK):** Single challenge object.

---

#### 3. Create Challenge (Admin only)
**POST** `/challenges` (Admin Protected)

**Request Body:**
```json
{
  "title": "Challenge Title",
  "description": "Description...",
  "code": "initial code snippet",
  "level": "medium",
  "solution": "flag{correct_answer}",
  "validationType": "regex",
  "hints": ["Use SQL wildcards"],
  "challengeDetails": "Detailed explanation...",
  "recommendation": "Learn about prepared statements...",
  "feedback": "You got it!"
}
```

**Response (201 Created):** Created challenge object.

---

#### 4. Submit Challenge Answer
**POST** `/challenges/:id/submit` (Optional Auth)

**Request Body:**
```json
{
  "answer": "flag{user_answer}"
}
```

**Response (200 OK - Correct, User Awarded):**
```json
{
  "success": true,
  "awarded": true,
  "points": 40,
  "message": "Brilliant! You solved it correctly!"
}
```

**Response (200 OK - Correct, Already Solved):**
```json
{
  "success": true,
  "awarded": false,
  "points": 0,
  "message": "Correct, but you have already earned points for this challenge."
}
```

**Response (200 OK - Correct, Guest):**
```json
{
  "success": true,
  "awarded": false,
  "points": 0,
  "message": "Correct! Log in to save your progress and earn points."
}
```

---

### Admin Endpoints

**Endpoints defined but controllers currently empty:**
- POST `/admin/puzzles` - Create puzzle (use `/puzzles` instead)
- PATCH `/admin/puzzles/:id` - Update puzzle (use `/puzzles/:id` instead)
- DELETE `/admin/puzzles/:id` - Delete puzzle (use `/puzzles/:id` instead)

**Recommendation:** Consolidate admin operations into main routes with role-based middleware.

---

## Frontend Architecture

### State Management (Redux)

#### User Slice
```typescript
{
  user: {
    uid: string,
    email: string,
    name: string,
    photoURL: string,
    role: 'user' | 'admin',
    profile: {
      rating: number,
      puzzlesDone: number,
      challengesDone: number,
      totalScore: number,
      globalRank: number
    }
  },
  isAuthenticated: boolean,
  loading: boolean
}
```

**Selectors:**
- `selectUser()` - Current user object
- `selectIsAuthenticated()` - Auth status
- `selectLoading()` - Loading state
- `selectIsAdmin()` - Admin role check

---

### Authentication Flow

```
1. User clicks "Sign in with Google/GitHub"
   ↓
2. Firebase SDK opens OAuth consent screen
   ↓
3. User grants permissions
   ↓
4. Firebase returns ID token
   ↓
5. Frontend sends token to POST /users/auth/google
   ↓
6. Backend verifies token with Firebase Admin SDK
   ↓
7. Backend finds/creates user in MongoDB
   ↓
8. Backend returns user data + sets HttpOnly cookie
   ↓
9. Frontend dispatches Redux setUser action
   ↓
10. User is now authenticated
```

---

### Key React Components

#### App.tsx
- Root component
- Fetches current user on mount
- Dispatches Redux setUser/clearUser

#### Navbar.tsx
- Displays current user info
- Shows auth state
- Link to profile/admin dashboard

#### SolvePuzzlePage.tsx
- Displays puzzle scenario & hints
- Answer input field
- Submit button with validation feedback

#### PlayChallengePage.tsx
- Monaco Editor for code input
- Challenge description sidebar
- Real-time validation

#### AdminDashboard.tsx
- Puzzle/Challenge management
- User role management
- Content creation forms

---

## Authentication & Security

### Firebase Authentication

**Supported Providers:**
- Google OAuth 2.0
- GitHub OAuth 2.0

**Token Flow:**
1. Firebase Client SDK exchanges OAuth code for ID token
2. ID token is sent to backend in Authorization header or cookie
3. Backend verifies token signature with Firebase Admin SDK
4. User is attached to `req.user` via auth middleware

**Token Validation Steps:**
```javascript
const decodedToken = await admin.auth().verifyIdToken(token);
// Returns: { uid, email, name, picture, email_verified, firebase }
```

### Session Persistence

**Method:** HttpOnly cookies with secure flag

**Configuration:**
```javascript
const options = {
  httpOnly: true,                    // Not accessible via JS
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  maxAge: 1000 * 60 * 60 * 24 * 7   // 7 days
};
```

---

### Authorization Middleware

```javascript
// 1. Protect - Requires authentication
exports.protect = async (req, res, next) => {
  // Extracts token from cookie or Authorization header
  // Verifies with Firebase Admin SDK
  // Attaches user to req.user
}

// 2. AuthAdmin - Requires admin role
exports.authAdmin = async (req, res, next) => {
  // Calls protect first
  // Checks if req.user.role === 'admin'
}

// 3. OptionalAuth - Authentication optional
exports.optionalAuth = async (req, res, next) => {
  // Attempts to attach user, but doesn't fail if missing
  // Sets req.user = null for guests
}
```

---

### Security Concerns & Recommendations

#### 🔴 HIGH PRIORITY

1. **Missing Environment Validation**
   - Issue: No `.env.example` or validation for required vars
   - Fix: Create `.env.example`, validate on startup
   ```javascript
   const requiredEnvVars = ['MONGODB_URI', 'FIREBASE_...'];
   requiredEnvVars.forEach(v => {
     if (!process.env[v]) throw new Error(`Missing ${v}`);
   });
   ```

2. **Firebase Credentials in Repository**
   - Issue: `firebase-service-account.json` should NOT be committed
   - Fix: Add to `.gitignore`, load from environment variable
   ```javascript
   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   ```

3. **No Rate Limiting**
   - Issue: No protection against brute force attacks
   - Fix: Add express-rate-limit middleware
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use('/api/', limiter);
   ```

4. **Weak Input Validation**
   - Issue: No schema validation on request bodies
   - Fix: Use `joi`, `yup`, or `zod` for schema validation
   ```javascript
   const schema = Joi.object({
     answer: Joi.string().required().max(500)
   });
   ```

5. **No HTTPS Configuration**
   - Issue: In production, secure flag not set for CORS
   - Fix: Ensure NODE_ENV=production and HTTPS enabled

---

#### 🟡 MEDIUM PRIORITY

6. **Empty Error Handler Middleware**
   - Issue: `/middlewares/errorHandler.js` is empty
   - Fix: Implement centralized error handling
   ```javascript
   app.use((err, req, res, next) => {
     console.error(err);
     res.status(err.status || 500).json({
       success: false,
       message: process.env.NODE_ENV === 'production' 
         ? 'Internal Server Error' 
         : err.message
     });
   });
   ```

7. **SQL Injection via Regex Validation**
   - Issue: User-supplied regex patterns could cause ReDoS attacks
   - Fix: Compile regex with timeout, use `safe-regex` package
   ```javascript
   const safeRegex = require('safe-regex');
   if (!safeRegex(pattern)) throw new Error('Unsafe regex');
   ```

8. **No Request Logging**
   - Issue: No audit trail of API requests
   - Fix: Use Morgan logging middleware
   ```javascript
   const morgan = require('morgan');
   app.use(morgan('combined'));
   ```

9. **Hardcoded Backend URL in Frontend**
   - Issue: `axios.ts` has hardcoded `localhost:8080`
   - Fix: Use environment variables
   ```typescript
   const baseURL = import.meta.env.VITE_API_URL;
   ```

10. **No CSRF Protection**
    - Issue: No protection against cross-site request forgery
    - Fix: Add CSRF tokens for state-changing operations
    ```javascript
    const csrf = require('csurf');
    app.use(csrf());
    ```

---

#### 🟢 LOW PRIORITY

11. **Unused Model Files**
    - Issue: `Leaderboard.js`, `Achievement.js`, `Certificate.js` are empty
    - Fix: Implement or remove

12. **Empty Controller Files**
    - Issue: `leaderboardController.js`, `adminController.js`, `submissionController.js` are empty
    - Fix: Implement or remove

13. **Redis Configuration Unused**
    - Issue: `config/redis.js` is empty
    - Fix: Either implement caching or remove

14. **No API Documentation Tool**
    - Issue: No Swagger/OpenAPI documentation
    - Fix: Add `swagger-ui-express` for auto-generated docs

15. **Test Coverage Minimal**
    - Issue: No significant test files
    - Fix: Add unit & integration tests

---

## Getting Started

### Prerequisites
- **Node.js:** v18 or later
- **npm:** v9 or later
- **MongoDB:** Atlas account or local instance
- **Firebase:** Console project with OAuth configured

### Backend Setup

#### 1. Install Dependencies
```bash
cd CYBackend
npm install
```

#### 2. Environment Configuration
Create `.env` file in `CYBackend/` root:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-mind

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Node
NODE_ENV=development
PORT=8080
```

#### 3. Firebase Service Account
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Save as `src/config/firebase-service-account.json`

#### 4. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:8080`

#### 5. Seed Initial Data (Optional)
```bash
npm run migrate:create-profiles
node src/scripts/seedPuzzles.js
node src/scripts/seedChallenges.js
```

---

### Frontend Setup

#### 1. Install Dependencies
```bash
cd CYFrontend
npm install
```

#### 2. Environment Configuration
Create `.env.local` in `CYFrontend/` root:
```env
# Firebase Client Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Backend API
VITE_API_URL=http://localhost:8080/api
```

#### 3. Start Development Server
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

#### 4. Build for Production
```bash
npm run build
npm run preview
```

---

### Full Stack Integration

**Ensure both servers are running:**
```bash
# Terminal 1 - Backend
cd CYBackend && npm run dev

# Terminal 2 - Frontend
cd CYFrontend && npm run dev
```

Visit `http://localhost:5173` in browser.

---

### Database Seeding

**Create sample puzzles:**
```bash
cd CYBackend
node src/scripts/seedPuzzles.js
```

**Create sample challenges:**
```bash
node src/scripts/seedChallenges.js
```

**Make user admin:**
```bash
node src/scripts/setAdminByEmail.js
# Follow prompts to enter email
```

---

## Code Improvements & Security Recommendations

### 1. **Implement Proper Error Handling**

**Current Issue:** Inconsistent error responses

**Fix:**
```javascript
// Create error utility
class APIError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

// Use in controllers
if (!puzzle) throw new APIError('Puzzle not found', 404);

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

---

### 2. **Add Input Validation**

**Current Issue:** No schema validation

**Fix:**
```javascript
// Install: npm install joi
const Joi = require('joi');

const submitAnswerSchema = Joi.object({
  answer: Joi.string().required().max(500).trim()
});

// Middleware
const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  req.validated = value;
  next();
};

// Usage
router.post('/:id/submit', validateRequest(submitAnswerSchema), submitAnswer);
```

---

### 3. **Add Request Logging**

**Current Issue:** No audit trail

**Fix:**
```javascript
// Install: npm install morgan
const morgan = require('morgan');

// Log all requests
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Custom logging for submissions
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/submit')) {
    console.log(`[SUBMIT] User: ${req.user?.uid}, Path: ${req.path}, Time: ${new Date().toISOString()}`);
  }
  next();
});
```

---

### 4. **Implement Rate Limiting**

**Fix:**
```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 submissions per minute
  message: 'Too many submissions, please try again later'
});

router.post('/:id/submit', submitLimiter, submitAnswer);
```

---

### 5. **Add API Documentation (Swagger)**

**Fix:**
```javascript
// Install: npm install swagger-ui-express swagger-jsdoc
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cyber-Mind API',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:8080/api' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

### 6. **Frontend: Use Env Variables**

**Current Issue:** Hardcoded backend URL

**Fix:**
```typescript
// src/api/axios.ts
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const instance = axios.create({
  baseURL,
  withCredentials: true,
});
```

**Create `.env.example`:**
```
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=...
```

---

### 7. **Implement Proper Caching**

**Current Issue:** Every request hits database

**Fix:**
```javascript
// Install: npm install redis
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
const cache = (req, res, next) => {
  const key = `puzzles:${req.query.category}:${req.query.level}`;
  client.get(key, (err, data) => {
    if (data) return res.json(JSON.parse(data));
    next();
  });
};

router.get('/', cache, getPuzzles);
```

---

### 8. **Add Comprehensive Testing**

**Current Issue:** Minimal test coverage

**Fix:**
```javascript
// Install: npm install --save-dev jest supertest
// src/controllers/__tests__/puzzleController.test.js

const request = require('supertest');
const app = require('../../server');

describe('Puzzle Controller', () => {
  test('GET /puzzles should return all puzzles', async () => {
    const res = await request(app).get('/api/puzzles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /puzzles/:id/submit should validate answer', async () => {
    const res = await request(app)
      .post('/api/puzzles/123/submit')
      .send({ answer: 'test' });
    expect(res.statusCode).toBeIn([200, 400]);
  });
});
```

---

### 9. **Implement TypeScript in Backend**

**Fix:**
```bash
npm install --save-dev typescript ts-node @types/express @types/node

# Create tsconfig.json
npx tsc --init

# Update package.json
"dev": "ts-node src/server.ts"
```

**Benefits:** Type safety, better IDE support, fewer runtime errors

---

### 10. **Security Headers Middleware**

**Fix:**
```javascript
// Install: npm install helmet
const helmet = require('helmet');

app.use(helmet()); // Adds secure headers

// Or customize:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"]
    }
  }
}));
```

---

## Summary of Low-Hanging Fruit

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 HIGH | Move Firebase credentials to env | 15 min | 🔒🔒🔒 |
| 🔴 HIGH | Add rate limiting | 20 min | 🛡️🛡️🛡️ |
| 🟡 MED | Implement error handler | 30 min | 🔧🔧 |
| 🟡 MED | Add input validation | 45 min | 🛡️🛡️ |
| 🟢 LOW | Add Swagger docs | 60 min | 📚📚 |
| 🟢 LOW | Setup basic tests | 90 min | ✅✅ |

---

## Conclusion

**Cyber-Mind** is a well-structured, full-stack cybersecurity learning platform with:

✅ **Strengths:**
- Clean MVC architecture
- Firebase OAuth integration
- Atomic database operations prevent race conditions
- Redux state management on frontend
- Service layer encapsulates business logic

⚠️ **Areas for Improvement:**
- Fortify security with environment validation & rate limiting
- Implement comprehensive error handling
- Add input validation and API documentation
- Increase test coverage
- Use TypeScript backend for type safety

The codebase provides a solid foundation for scaling a gamified cybersecurity platform with proper authentication, modular design, and room for AI/advanced features integration.

---

**Document Version:** 1.0  
**Generated:** January 2026  
**Reviewers:** Senior Architecture Team
