# Architecture — MindGrow Kids Prototype

Short technical overview for examiners and reviewers.

## One-sentence description

The system is built with a **React and TypeScript frontend** (Vite), a **Node.js and Express backend**, and **data storage in either MongoDB or a JSON file** on the server, with authentication via **JWT in httpOnly cookies**.

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, React Router, Zustand, Framer Motion, Chart.js (adult views), react-sketch-canvas (drawing) |
| **Backend** | Node.js, Express; CORS, cookie-parser, body-parser |
| **Data** | MongoDB (Mongoose) when `MONGO_URL` is set; otherwise file-based JSON (`server/mock-db.json`) |
| **Auth** | JWT in httpOnly cookies, bcrypt for passwords, role-based access (child / parent / pro) |
| **Build & deploy** | Vite build → `dist/`; server copied to `dist/server/`; optional PWA and Capacitor for mobile |

## Request flow

1. User opens the app (static frontend from `dist/` or dev server).
2. Login/register → POST to `/api/auth/login` or `/api/auth/register` → server sets JWT cookie.
3. All subsequent API calls send the cookie; middleware verifies JWT and role.
4. Child checkins → POST `/api/checkins`; reflective reply → POST `/api/listen` (rule-based, no LLM).
5. Parents/teachers → GET `/api/parent/my-children`, `/api/parent/children/:id/checkins`, `/api/analytics/weekly`, etc., returning only data allowed for that role.

## Important constraints (prototype)

- **MongoDB is optional:** If `MONGO_URL` is missing or the connection fails, the app uses file storage so it runs without a database.
- **Child “AI” is rule-based:** No large language model in the child flow; replies are generated from fixed Swedish phrases and simple keyword rules.
- **Offline:** Child checkins are queued in localStorage and synced when the user is back online.

For a detailed technical audit (routes, what is mounted, what is not), see the archived document `archive/FINAL_TECHNICAL_AUDIT.md` if needed for the report.
