# Final Technical Audit — MindGrow Kids

**Purpose:** Ensure technical description for presentation and report is 100% accurate.  
**Basis:** Repository analysis only; no assumptions.

---

## 1. DATABASE & STORAGE

### What database is ACTUALLY used at runtime?

- **Either MongoDB or file-based JSON, never both in the same run.**
- **MongoDB:** Used when `MONGO_URL` is set in `.env` and the connection succeeds at server startup (`server/lib/db.js`: `connectDB()`).
- **File-based JSON:** Used when `MONGO_URL` is missing or when the MongoDB connection fails. Data is stored in `server/mock-db.json` (path: `server/lib/db.js`, `PATH`).
- **IndexedDB:** Not found in the codebase. Not used.
- **Conclusion:** At runtime the app uses exactly one of: MongoDB (optional) or file-based JSON (fallback). No IndexedDB.

### Is MongoDB required, optional, mocked, or unused?

- **Optional.** The server starts without it. If `MONGO_URL` is not set or connection fails, the app falls back to file storage and logs e.g. `[DB] Mongo misslyckades → fil-fallback`. There is no mock of MongoDB in the frontend; the backend switches to file-DB.

### Which models/schemas are implemented?

**MongoDB (Mongoose) models in `server/models/mongo.js`:**

- **Kid:** name, email, passwordHash, classCode, orgId, linkCode, dateOfBirth, ageGroup.
- **ParentUser (ParentSchema):** email, passwordHash, name, role, childId.
- **ProUser (ProSchema):** email, passwordHash, name, role, classCode, orgId.
- **Checkin:** orgId, classId, studentId, emotion, mode, note, drawingRef, dateISO, createdAtISO, clientId.
- **Mood:** childRef, values (love, joy, calm, energy, sadness, anger), lastUpdated.
- **Avatar:** childRef, data (object).
- **ClassModel (ClassSchema):** code, name, ownerUserId, orgId.

**File-DB structure** (same logical entities in `server/mock-db.json`): `users`, `parents`, `professionals`, `kids`, `checkins`, `moods`, `avatars`, `classes`, `pins`. Initial structure in `server/lib/db.js` (`DEFAULT`).

**Tenant models** (`server/models/tenant.js`, `server/data/adapter.js`): Org, Class, Student, Checkin — used by the **unmounted** `server/routes/checkins-new.js` and by `server/routes/analytics.js`. The **mounted** checkin flow uses `server/routes/checkins.js` and `server/models/mongo.js` only.

### What data is persisted across sessions?

- **Server (Mongo or file):** Users (kids, parents, pros), checkins (emotion, mode, note, drawingRef, dateISO, studentId), avatar data, moods, classes, pins. Survives server restart.
- **Client:** Only in **localStorage** (see section 4). No server-side session store; auth state is JWT in httpOnly cookie.

---

## 2. BACKEND RUNTIME

### Does a real Node/Express server run?

- **Yes.** `server/index.js` is an Express app: CORS, body-parser, cookie-parser, route mounting, static serving from `dist`, SPA fallback, then `app.listen(port)`. Started e.g. via `npm run dev:api` or by running `node server/index.js` (or `node index.js` from `dist/server` after build).

### Which API routes are functional vs placeholder?

**Mounted in `server/index.js` (all under `/api`):**

- **auth** (`server/routes/auth.js`): POST `/auth/register`, POST `/auth/login`, POST `/auth/logout`, GET `/auth/me` — **functional** (real registration, login, JWT, cookies).
- **avatar** (`server/routes/avatar.js`): GET/POST avatar for child — **functional** (reads/writes Mongo or file-DB).
- **checkins** (`server/routes/checkins.js`): GET `/checkins`, POST `/checkins`, GET `/analytics/weekly` — **functional** (Mongo + file fallback).
- **classroom** (`server/routes/classroom.js`): Classes, QR, PIN, parent/child linking, GET `/parent/my-children`, GET `/parent/children/:childId/checkins`, and e.g. `/analytics/export.csv` — **functional** (implemented and mounted).
- **listen** (`server/routes/listen.js`): POST `/listen` — **functional** (rule-based reply, no LLM).
- **children** (`server/routes/children.js`): GET `/children/me`, POST `/children/age` — **functional**.

**Not mounted (present in repo but not used at runtime):**

- **analytics** (`server/routes/analytics.js`): Defines GET `/analytics/weekly`, GET `/analytics/summary`, GET `/export.csv` with `setScope`, tenant adapter, and optional OpenAI summary. This router is **never imported or mounted** in `server/index.js`. So:
  - **GET /api/analytics/weekly** is served by **checkins.js** (simpler implementation, no scope/tenant; aggregates all checkins in DB for last 7 days).
  - **GET /api/analytics/summary** is **not implemented** in the mounted app → returns **404**. Frontend (e.g. ProSimplePage) calls it and catches errors, so summary text is effectively always empty.
  - **GET /api/analytics/export.csv** (if called under that path) — not found in mounted routes; classroom has `/analytics/export.csv` (exact path to confirm in classroom.js).

**Placeholder / dev-only:** POST `/api/dev/seed`, POST `/api/dev/seed-class` (only when `NODE_ENV !== 'production'`). GET `/api/debug/db` (dev only).

### Is authentication truly implemented or simulated?

- **Implemented.** JWT created in `server/utils/jwt.js`, verified in `server/mw/auth.js`; httpOnly cookie set via `setAuthCookie` in auth routes; bcrypt for password hashing in `server/routes/auth.js`. Roles (child, parent, pro) enforced with `roleRequired` middleware. No simulated or mock auth in the active flow.

---

## 3. AI FUNCTIONALITY

### Is any real LLM used?

- **In the mounted application: No.** The child-facing “AI” response is **rule-based only** in `server/routes/listen.js` (`generateReply`, `detectTheme`). No OpenAI or other LLM call in the listen route.
- **In the codebase but not in use:** `server/routes/analytics.js` contains OpenAI usage for generating a text summary (e.g. `openai.chat.completions.create`) when `OPENAI_API_KEY` is set. This router is **not mounted**, so that LLM code never runs in the current deployment.

### If no LLM: what replaces it?

- **Child replies:** Static Swedish phrases per emotion (happy, calm, tired, sad, curious, angry), optional keyword-based “themes” (e.g. school, friends, family) from the note text, and length-based variation (short/medium/long note). All in `server/routes/listen.js`. No learning, no external API.

---

## 4. OFFLINE & CLIENT STORAGE

### What is stored in localStorage?

- **mgk-calm-mode:** `'1'` or not set (calm mode on/off). Read/written in `App.tsx`, `SettingsPage.tsx`, `AppHeader.tsx`, `SettingsDrawer.tsx`.
- **mgk-checkin-draft:** Draft checkin (emotion, note, drawingUrl) in `src/utils/localStore.ts` (saveDraft/loadDraft/clearDraft).
- **mgk-offline-checkin-queue:** Array of queued checkins when offline (`src/utils/offlineQueue.ts`). Each item: `clientId`, `timestamp`, `payload` (emotion, mode, note, drawingRef).
- **mgk-checkins-{userId}:** Referenced in `MePage.tsx` only (legacy or optional local cache).
- **Role store:** Key in `src/state/useRoleStore.ts` (localStorage key for role).

### IndexedDB

- **Not found in the codebase.** Not used.

### In-memory state

- **React state / Zustand / Context:** Auth (AuthContext), age (AgeContext), checkin draft (useCheckinStore), emoji avatar (useEmojiAvatarStore), mood (useMoodStore), role (useRoleStore). Not persisted except where explicitly synced to server or localStorage.

### Does the offline queue truly sync?

- **Yes, with caveats.** When the app comes online, `SyncWrapper` in `App.tsx` calls `syncQueuedCheckins()` (for child users). That function in `src/utils/offlineQueue.ts` reads the queue from localStorage, POSTs each item to `/api/checkins`, and removes it from the queue on success. So checkins **are** sent to the server when back online.
- **Caveats:** (1) The server’s POST `/api/checkins` in `server/routes/checkins.js` does **not** use `clientId`; duplicate detection is not implemented there, so repeated sync could create duplicates. (2) Only child checkins are queued; other actions (e.g. avatar save, parent link) are not queued for later sync.

---

## 5. PROTOTYPE VS PRODUCTION

### Fully working

- Landing page, login, registration (all roles), logout.
- Roll-based hub and navigation (child, parent, pro).
- Child: emotion selection, draw/write step, rule-based “AI” reply, TTS, checkin save to server, diary view, emoji-avatar profile (load/save).
- Parent: link child via PIN/code, list linked children, aggregated emotion stats (from `/api/parent/children/:id/checkins` or equivalent), age selector.
- Teacher: create class, get class code, view weekly aggregation (GET `/api/analytics/weekly` from checkins), class diary/checkins (via classroom routes).
- Offline detection banner; offline queue for child checkins; sync when back online.
- Settings: sound, calm mode, age (child), logout.
- Error boundary; loading and empty states in key flows.
- Build: Vite build, server copy to `dist/server`, SPA fallback documented.

### Partially implemented

- **Analytics summary text:** Frontend calls GET `/api/analytics/summary`, but that route is not mounted → 404 → summary always empty in UI. Weekly numbers work via `/api/analytics/weekly` (checkins).
- **Scope/tenant (org/class):** Implemented in `server/data/adapter.js` and `server/routes/analytics.js`, but analytics router is not mounted; active checkins use simple studentId/classId (often empty) in `checkins.js`.
- **Duplicate checkins on sync:** Server ignores `clientId`; offline sync can create duplicates.
- **Parent diary:** ParentDiarySimplePage redirects parents away from diary view; parent sees only aggregated stats on “Mina barn.” API still exposes raw checkins for linked child.

### Mocked / simulated

- **Child “AI” replies:** Rule-based Swedish text only; no LLM.
- **Database:** File-based fallback is real persistence, not a mock; “mocked” here means “simplified when MongoDB is not used.”
- **Rate limiting:** In-memory; resets on server restart.

### Planned but not built (found in docs/earlier plans, not in code)

- Voice input; OpenAI in the child listen flow; persistent rate limiting; E2E tests; IndexedDB; full tenant scoping in the mounted routes.

---

## 6. ARCHITECTURE SUMMARY (ONE SENTENCE)

**Safe to say in presentation:**

*“The system is built with a React and TypeScript frontend (Vite), a Node.js and Express backend, and data storage in either MongoDB or a JSON file on the server, with authentication via JWT in httpOnly cookies.”*

**Shorter variant:**

*“The prototype uses a React/Vite frontend, an Express backend, and either MongoDB or file-based JSON for persistence.”*

---

## 7. PRESENTATION RISK CHECK

Avoid stating or implying the following (they are technically incorrect or misleading):

- **“We use OpenAI for the child’s reflective replies.”** — The child’s reply is rule-based only. No LLM is used in the active listen route.
- **“AI-generated summaries for teachers/parents.”** — The route that would call OpenAI for summaries is not mounted. Summary text is always empty in the running app.
- **“We use IndexedDB for offline storage.”** — Only localStorage is used; IndexedDB is not in the codebase.
- **“MongoDB is required.”** — MongoDB is optional; the app runs with file-based storage if MONGO_URL is missing or connection fails.
- **“Full tenant/organisation scoping for analytics.”** — The mounted analytics is a simple 7-day aggregate over all checkins in the DB; the more advanced analytics with scope is in an unmounted router.
- **“Duplicate-safe offline sync.”** — Sync works, but the server does not use clientId, so duplicates are possible.
- **“All API routes in the repo are active.”** — The analytics router (with OpenAI summary and export) is never mounted.

---

## 8. SAFE WORDING FOR PRESENTATION

### Corrected architecture description (2–3 sentences)

*“The system is built with a React and TypeScript frontend bundled with Vite, and a Node.js and Express backend. Data is stored either in MongoDB or, if MongoDB is unavailable, in a JSON file on the server. Authentication is implemented with JWT in httpOnly cookies and role-based access for child, parent, and teacher.”*

Optional second sentence: *“The child’s reflective replies are generated by rule-based logic on the server, and the frontend supports offline queuing of checkins with sync when the user is back online.”*

### Academically honest, professional wording

- **Data storage:** “Persistence uses either MongoDB or a file-based JSON fallback, depending on configuration and connectivity.”
- **AI / child replies:** “The child-facing responses are produced by rule-based logic in Swedish, without use of a large language model in this prototype.”
- **Offline:** “When offline, child checkins are stored in the browser and synced to the server when the connection is restored.”
- **Analytics:** “Teachers and parents see aggregated emotion statistics; the weekly aggregation is implemented and in use. Text summaries for analytics exist in the codebase but are not wired in the current deployment.”
- **Scope:** “This is a working prototype with deliberate simplifications—for example, file-based fallback and in-memory rate limiting—suitable for demonstration and further development.”

---

*Audit based solely on the repository state at the time of analysis. Any change to mounted routes or environment will affect the accuracy of this report.*
