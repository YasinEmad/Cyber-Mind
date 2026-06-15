# Frontend Performance & Optimization Report — Cyber-Mind

> **Date:** 2026-06-15
> **Scope:** CYFrontend (`React 19`, `Vite 6`, `Tailwind CSS 4`, `Redux Toolkit`, `React Router 7`, `framer-motion 12`, `lottie-react 2`, `@monaco-editor/react 4`)
> **Methodology:** Static source code audit of every `src/` file. No bundle analyzer or runtime profiling used.

---

## Table of Contents

1. [Overall Assessment](#1-overall-assessment)
2. [Bundle Size Analysis](#2-bundle-size-analysis)
3. [Code Splitting & Lazy Loading](#3-code-splitting--lazy-loading)
4. [Rendering Performance](#4-rendering-performance)
5. [State Management & API Caching](#5-state-management--api-caching)
6. [Animation & Asset Performance](#6-animation--asset-performance)
7. [CSS & Font Loading](#7-css--font-loading)
8. [Network & API Overhead](#8-network--api-overhead)
9. [Low Priority / Nice-to-Have](#9-low-priority--nice-to-have)
10. [Prioritized Remediation Roadmap](#10-prioritized-remediation-roadmap)

---

## 1. Overall Assessment

| Area | Rating | Score |
|------|--------|-------|
| Bundle Size | ⚠️ Poor | 4/10 |
| Code Splitting | 🔴 Critical | 1/10 |
| Rendering Performance | ⚠️ Poor | 4/10 |
| State & Caching | ⚠️ Fair | 5/10 |
| Animation/Rendering Cost | ⚠️ Poor | 3/10 |
| CSS/Font Loading | 🔴 Critical | 2/10 |
| Network Overhead | ⚠️ Poor | 4/10 |
| **Composite Score** | **⚠️ Poor** | **3.3/10** |

---

## 2. Bundle Size Analysis

### 2.1 Lottie Animation Assets — 8 Files / 888 KB

| File | Size |
|------|------|
| `vulnarability.json` | 381 KB |
| `server.json` | 178 KB |
| `Untitled file.json` | 134 KB |
| `prof.json` | 73 KB |
| `Meditating Brain.json` | 43 KB |
| `puzzle.json` | 30 KB |
| `security code challinging.json` | 21 KB |
| `ctf.json` | 8.1 KB |
| **Total** | **888 KB** |

All 8 files are bundled into the main JS chunk because Lottie JSON files are imported as static imports (e.g., `import ctfAnimation from '@/assets/ctf.json'` in `HomePage.tsx`). The largest four files alone account for 726 KB of parse/execute cost even if the user never scrolls to the feature section.

**Files referencing Lottie assets:**
- `HomePage.tsx` — imports `ctf.json`, `prof.json`, `puzzle.json`, `server.json` and passes them to `FeatureItem` components
- `AboutPage.tsx` — may import additional animations

### 2.2 Heavy Third-Party Libraries

| Package | Estimated Cost | Import Location |
|---------|---------------|-----------------|
| `@monaco-editor/react` | ~2.3 MB (unminified) | `PlayChallengePage.tsx` |
| `framer-motion` | ~1.2 MB (unminified) | 25+ files |
| `firebase` | ~500 KB (unminified) | `firebase.ts`, `api/axios.ts`, auth pages |
| `lottie-react` | ~50 KB | `FeatureItem.tsx`, `AboutPage.tsx` |
| `lucide-react` | Tree-shakeable ✅ | ~15 component files |

**Issue:** `@monaco-editor/react` is imported eagerly in `PlayChallengePage.tsx` via a static top-level import. Since no code-splitting is configured (see §3), Monaco is included in the main bundle and loaded for every user — even though it is only used on one route (`/challenges/:challengeId`).

### 2.3 Page Bundle Sizes (Lines of Code)

| Page | Lines | Notes |
|------|-------|-------|
| `CTFPlanPage.tsx` | ~31000 chars (largest file) | Single component, inline scroll-driven animations, expanded detail sections, multiple learning path cards |
| `ChallengePage.tsx` | ~18000 chars | Motivational quote rotator, filtering/sorting, full challenge card rendering |
| `PlayChallengePage.tsx` | ~500 lines | Monaco editor, AI review integration, submission logic |
| `LinuxPage.tsx` | 237 lines | OS desktop, CTF panel, window management |
| `HomePage.tsx` | ~400 lines | 4 Lottie animations, scroll-parallax, blob backgrounds, 5 framer-motion Variant objects |

All page components are eagerly imported in `routes.tsx` (see §3).

---

## 3. Code Splitting & Lazy Loading

### 3.1 Critical: No Route-Level Code Splitting

**File:** `CYFrontend/src/router/routes.tsx`

All page components are imported with static `import` statements:

```tsx
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import PuzzlePage from '@/pages/PuzzlePage';
import ChallengePage from '@/pages/ChallengePage';
// ... all 11+ page components
```

No `React.lazy()` is used anywhere. Every page component — including the 31 KB `CTFPlanPage.tsx` and `PlayChallengePage.tsx` with Monaco — is eagerly loaded for every user on first paint.

**Expected fix pattern:**
```tsx
const PlayChallengePage = React.lazy(() => import('@/pages/PlayChallengePage'));
const CTFPlanPage = React.lazy(() => import('@/pages/CTFPlanPage'));
const LinuxPage = React.lazy(() => import('@/pages/LinuxPage'));
```

Then wrap routes in `<Suspense fallback={<LoadingScreen />}>`.

### 3.2 No Vite Manual Chunks

**File:** `CYFrontend/vite.config.ts`

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: undefined  // not set
    }
  }
}
```

Without `manualChunks`, Vite's default behavior puts all node_modules into a single `vendor` chunk. This prevents browser caching benefits when only app code changes. At minimum, `firebase` and `@monaco-editor/react` should be split into separate vendor chunks.

**Recommended config:**
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        monaco: ['@monaco-editor/react'],
        firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        animations: ['framer-motion', 'lottie-react'],
      }
    }
  }
}
```

### 3.3 No Asset-Level Lazy Loading

Lottie JSON animations are imported statically — they are baked into the main JS bundle. No `IntersectionObserver`-based lazy loading of animation data or `lazy` imports for animation-heavy components.

---

## 4. Rendering Performance

### 4.1 Inline Framer Motion Variant Objects (Every Render)

Several components define `initial`/`animate`/`variants` objects as **literal objects in the render body**. This creates new object references on every render, defeating framer-motion's optimization.

**Problematic files:**

- `HomePage.tsx` — defines 5+ `Variants` objects inline
- `Navbar.tsx` — defines `menuVariants` inside the component (`line 54-57`)
- `FeatureItem.tsx` — defines `scaleIn` and `fadeInUp` at **module scope** ✅ (no issue)
- `ChallengeCard.tsx` — `initial/animate` props use inline literals
- `SolvePuzzleLeft.tsx` — `initial/animate` props use inline literals on motion divs
- `SolvePuzzleRight.tsx` — same pattern

**Fix:** Move variant objects to module scope or wrap in `useMemo`.

### 4.2 PuzzleCard Uses Inline onHover Animation (`whileHover`)

**File:** `CYFrontend/src/components/PuzzleCard.tsx`

```tsx
whileHover={{ y: -8, scale: 1.02 }}
transition={{ duration: 0.3 }}
```

The `whileHover` object is recreated on every render. Should be defined at module scope.

### 4.3 Large Component Files

`CTFPlanPage.tsx` (~31000 chars) and `ChallengePage.tsx` (~18000 chars) are monolithic single-component files. This makes it impossible to memoize sub-sections independently and forces full re-renders on any state change.

### 4.4 Unnecessary Re-renders in LinuxPage

**File:** `CYFrontend/src/pages/LinuxPage.tsx`

`osReducer` is used with `useReducer` but the `dispatch` function is passed through context. Every state update re-renders the entire desktop. Consider splitting the OS state from the CTF panel state.

### 4.5 useCallback / useMemo Usage

- `ChallengeCard.tsx` — wraps component in `React.memo` ✅
- `PuzzleCard.tsx` — does **not** use `React.memo`
- `LinuxPage.tsx` — uses `useCallback` for `onAppOpen` ✅
- Most other components do not use `React.memo`, `useMemo`, or `useCallback`

Given the heavy animation workload and large page components, this lack of memoization can cause significant layout thrash, especially during scroll-driven animations.

---

## 5. State Management & API Caching

### 5.1 No Dedicated Data Fetching / Caching Layer

The app uses Redux Toolkit with manual `createAsyncThunk` for API calls. There is no integration with **React Query**, **RTK Query**, **SWR**, or any stale-while-revalidate library.

**Impact:**
- No automatic cache invalidation
- No request deduplication (two components mounting simultaneously fire duplicate network requests)
- No background refetching
- Every page remount triggers fresh thunk dispatches

### 5.2 CTF Challenge Cache is a Module-Level Variable

**File:** `CYFrontend/src/pages/ctfChallenges.ts` (line 13)

```ts
let cachedChallenges: Record<number, Challenge> | null = null;
```

This is a mutable module-level variable. It works but:
- Cache is never invalidated on auth state change (e.g., logout → login as different user)
- No TTL-based expiration
- Prevents SSR compatibility if ever needed

### 5.3 Sequential Backend Requests

**File:** `CYFrontend/src/pages/ctfChallenges.ts` (lines 33-60)

```ts
for (const levelInfo of availableLevels) {
  const backendResponse = await axiosInstance.get(`${API_BASE_URL}/challenge/${level}`)
```

Challenges are fetched sequentially in a `for...of` loop. If there are 20+ levels, this creates a waterfall of N+1 requests. These should be parallelized or batched.

### 5.4 Redux Slice Overhead

Each slice (`userSlice`, `puzzleSlice`, `challengeSlice`, `ctfSlice`) tracks individual async thunk states (`idle/loading/succeeded/failed`). The `ctfSlice` at ~17000 chars is especially large with many individual state fields that could share a single loading/error state.

---

## 6. Animation & Asset Performance

### 6.1 Lottie Animation Rendering Cost

All 4 Lottie animations on `HomePage.tsx` are rendered via `lottie-react` and are visible at all times (no lazy loading or `IntersectionObserver`). Even animations below the fold load and animate, consuming CPU cycles.

**File:** `CYFrontend/src/components/FeatureItem.tsx` (line 37-42)
```tsx
<Lottie
  animationData={animationData}
  loop
  autoplay
  className="w-full h-full ..."
/>
```

`loop` + `autoplay` means every animation runs continuously on page load. On mobile devices this can cause significant battery drain and jank.

### 6.2 Framer Motion Scroll-Driven Animations

`HomePage.tsx` uses scroll-driven parallax and animated blob backgrounds. `CTFPlanPage.tsx` uses scroll-driven entrance animations. These use `whileInView` / `viewport`, which registers scroll listeners.

On a page with 5+ `whileInView` elements and 4 Lottie animations, the combined scroll handler + animation frame load can cause visible jank, especially on mid-range devices.

### 6.3 Image Assets

No `<img>` tags with `loading="lazy"` were observed. If any images are added in the future, they should use native lazy loading.

---

## 7. CSS & Font Loading

### 7.1 Render-Blocking Google Font Import

**File:** `CYFrontend/index.html`

```html
<style>
  @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');
</style>
```

Google Font import inside a `<style>` tag is **render-blocking** — the browser must download the font CSS before rendering any text. The `display=swap` parameter is present but the @import in a `<style>` tag blocks the CSSOM construction.

**Better approach:** Add a `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` in `<head>`, then use a `<link rel="stylesheet">` for the font, or inject it asynchronously.

### 7.2 Inline Critical CSS in index.html

**File:** `CYFrontend/index.html`

~70 lines of inline `<style>` containing:
- Custom scrollbar styling
- Blob animation keyframes
- Shimmer/skeleton animation keyframes
- Base resets

While inline CSS avoids a network round-trip, keeping ~3 KB of animation keyframes in the HTML payload delays the first render. Keyframes for rarely-seen animations (e.g., blob animation on homepage) should be loaded lazily or extracted into a CSS file.

### 7.3 Tailwind CSS v4 Overhead

Tailwind CSS 4 uses the new engine, which generates CSS on-demand. This is generally efficient, but the large number of arbitrary values (`text-[28px]`, `shadow-[0_20px_60px_rgba(...)]`, etc.) in JSX class strings reduces the effectiveness of JIT compilation and increases CSS output size. Consider defining reusable utility classes in the Tailwind config for repeated custom values.

---

## 8. Network & API Overhead

### 8.1 Firebase Token Refresh on Every Request

**File:** `CYFrontend/src/api/axios.ts`

```ts
const user = auth.currentUser;
const token = await user.getIdToken(true);  // force-refresh on EVERY request
```

`getIdToken(true)` forces a token refresh (network call to Firebase Auth servers) on **every single API request**. This adds ~200–500 ms of latency per request just for authentication. For a page loading multiple resources (puzzles, challenges, CTF data), this compounds quickly.

**Fix:** Use `getIdToken()` without force-refresh; the Firebase SDK caches the token and auto-refreshes as needed.

### 8.2 Console Logging of Entire Response Payloads

**File:** `CYFrontend/src/api/axios.ts` (response interceptor)

```ts
console.log('Puzzle Response:', response.data);
if (Array.isArray(response.data)) {
  response.data.forEach((puzzle: any) => console.log('Puzzle:', puzzle));
}
```

In development, this logs every puzzle object individually. Even more critically, if this code reaches production (`console.log` stripped in build?), the `.forEach` loop still runs — iterating over the full response array unnecessarily. Remove or guard with `if (import.meta.env.DEV)`.

### 8.3 Axios Request Body Logging

**File:** `CYFrontend/src/api/axios.ts` (request interceptor)

```ts
console.log('Request Body:', config.data);
```

Same issue — logs request bodies in production. Wrap in `import.meta.env.DEV` guard.

---

## 9. Low Priority / Nice-to-Have

1. **Tailwind CSS class naming:** Extensive use of arbitrary values (`text-[28px]`, `px-8`, `py-7`) could be consolidated into a design token system.
2. **LinuxPage.css** — loaded globally; consider CSS Modules or scoped styles.
3. **HashRouter vs BrowserRouter:** The app uses `HashRouter` (observed from hash-based URL matching in `LinuxPage.tsx` line 44). `BrowserRouter` is more performant and SEO-friendly if server-side routing is configured.
4. **RTL text in LinuxPage:** `dir="rtl"` on the challenge description (line 190, 197) suggests mixed LTR/RTL content. Ensure `font-family` supports Arabic/Persian glyphs.
5. **No service worker / PWA support:** Not strictly a performance issue, but a service worker could cache Lottie JSON assets and API responses.

---

## 10. Prioritized Remediation Roadmap

### Immediate (High Impact, Low Effort)

| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 1 | Remove `true` from `getIdToken(true)` to stop forced token refresh on every request | `api/axios.ts` | 1 line |
| 2 | Guard `console.log` calls with `import.meta.env.DEV` | `api/axios.ts` | 2 lines |
| 3 | Replace render-blocking `@import` with `<link>` + `preconnect` | `index.html` | 5 lines |
| 4 | Move framer-motion variant objects to module scope (most egregious cases) | `Navbar.tsx`, `SolvePuzzleLeft.tsx`, `SolvePuzzleRight.tsx` | 10 lines |

### Short-Term (High Impact, Medium Effort)

| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 5 | Add `React.lazy()` for all page components in `routes.tsx` with `<Suspense>` wrapper | `router/routes.tsx`, `App.tsx` | 20 lines |
| 6 | Configure Vite `manualChunks` to split `@monaco-editor/react`, `firebase`, and `framer-motion` into separate vendor chunks | `vite.config.ts` | 10 lines |
| 7 | Convert sequential CTF challenge fetches to `Promise.all` calls | `pages/ctfChallenges.ts` | 5 lines |
| 8 | Add `loading="lazy"` to any `<img>` elements | All files | 1 line each |

### Medium-Term (Medium Impact, Medium Effort)

| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 9 | Eager Lottie JSON imports → dynamic `import()` with `IntersectionObserver` | `HomePage.tsx`, `FeatureItem.tsx` | 30 lines |
| 10 | Add `React.memo()` to `PuzzleCard`, `SolvePuzzleLeft`, `SolvePuzzleRight` | Component files | 5 lines |
| 11 | Extract inline keyframe CSS (blob, shimmer) into lazy-loaded CSS | `index.html` | 15 lines |
| 12 | Break down `CTFPlanPage.tsx` (~31 KB) and `ChallengePage.tsx` (~18 KB) into sub-components | Page files | moderate |

### Long-Term (High Impact, High Effort)

| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 13 | Integrate React Query or RTK Query for API caching, deduplication, and background refetching | Redux stores, API layer | large |
| 14 | Replace inline Lottie `loop` + `autoplay` with `IntersectionObserver`-controlled play/pause | `FeatureItem.tsx` | moderate |
| 15 | Audit and consolidate Redux slice loading states to reduce boilerplate and re-renders | All slices | moderate |
| 16 | Migrate from HashRouter to BrowserRouter | Router config | moderate |

---

## Appendix A: Files Read for This Report

All files in `CYFrontend/src/` were read in full:

```
src/App.tsx, src/index.tsx, src/index.css, src/firebase.ts,
src/store.ts, src/types.ts,
src/router/routes.tsx, src/router/ProtectedRoute.tsx,
src/router/AdminRoute.tsx, src/router/AuthCheckRoute.tsx,
src/api/axios.ts, src/api/challenges.ts,
src/redux/slices/userSlice.ts, src/redux/slices/puzzleSlice.ts,
src/redux/slices/challengeSlice.ts, src/redux/slices/ctfSlice.ts,
src/lib/points.ts, src/lib/filesystem.ts, src/lib/os.ts,
src/components/Navbar.tsx, src/components/PageWrapper.tsx,
src/components/FeatureItem.tsx, src/components/ChallengeCard.tsx,
src/components/PuzzleCard.tsx, src/components/SolvePuzzleLeft.tsx,
src/components/SolvePuzzleRight.tsx,
src/layouts/MainLayout.tsx,
src/pages/HomePage.tsx, src/pages/PuzzlePage.tsx,
src/pages/ChallengePage.tsx, src/pages/CtfPage.tsx,
src/pages/CTFPlanPage.tsx, src/pages/PlayChallengePage.tsx,
src/pages/LoginPage.tsx, src/pages/ProfilePage.tsx,
src/pages/SolvePuzzlePage.tsx, src/pages/AdmainDashboard.tsx,
src/pages/AboutPage.tsx, src/pages/LinuxPage.tsx,
src/pages/PlayLevelPage.tsx, src/pages/LinuxOS.ts,
src/pages/terminal.ts, src/pages/ctfLevels.ts,
src/pages/ctfChallenges.ts,
src/index.html, src/vite.config.ts, src/package.json,
```

Plus all 8 Lottie JSON files in `src/assets/`.
