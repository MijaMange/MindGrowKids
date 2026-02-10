# MindGrow Kids

A warm, accessible prototype for children (about 5–12) to express feelings through emoji, text, and drawing. The app responds with short, reflective replies in Swedish. Parents and teachers see aggregated emotion trends only.

## Project overview

- **Child journey:** Emotion picker, text input, drawing canvas, reflective “AI” replies (rule-based), text-to-speech, personal diary, avatar.
- **Adult dashboards:** Parents link children and see aggregated stats; teachers manage classes, QR/PIN linking, class statistics, and CSV export.
- **Tech:** React + TypeScript (Vite), Node/Express backend, MongoDB or file-based storage, JWT in httpOnly cookies, optional PWA and Capacitor.

## How to run

```bash
npm install
npm run dev          # Frontend only (Vite)
npm run dev:api      # Backend only (Express on port 4000)
# Or run both in two terminals for full stack.
```

**Production-style run:**

```bash
npm run build
cd dist/server && cp .env.example .env   # Edit .env (MONGO_URL, JWT_SECRET, etc.)
node index.js
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment options (PWA, Capacitor, hosting).

## Prototype scope / limitations

- **Voice input** is not implemented; input is text and drawing only.
- **Child “AI”** is rule-based (no LLM); replies are fixed Swedish phrases and simple keyword rules.
- **Offline queue** applies only to child checkins; parent/teacher actions require online.
- **MongoDB is optional;** if `MONGO_URL` is unset or connection fails, the app uses file storage (`server/mock-db.json`).
- **Tests:** A small Jest suite exists (`npm test`); primary validation is manual (see [docs/MANUAL_TESTING.md](docs/MANUAL_TESTING.md)).

## Documentation (examiner)

| Document | Purpose |
|----------|---------|
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | How to build and deploy (PWA, server, env) |
| [docs/MANUAL_TESTING.md](docs/MANUAL_TESTING.md) | Manual testing plan and critical paths |
| [docs/ACCESSIBILITY_IMPROVEMENTS.md](docs/ACCESSIBILITY_IMPROVEMENTS.md) | Accessibility features and checks |
| [docs/PRIVACY_ETHICS.md](docs/PRIVACY_ETHICS.md) | Data, who sees what, and ethical choices |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack and one-page architecture |

Older design notes, audits, and internal docs are in the `archive/` folder.

## Database (quick)

- Set `MONGO_URL` and `MONGO_DB_NAME` in `.env` (see `dist/server/.env.example` after build). If unset or connection fails, the app uses file-based storage.
- Verify: start API, then `GET http://localhost:4000/api/db-info` and `GET http://localhost:4000/api/db-collections`.

## Routes (main)

- `/child` — Child journey (default)
- `/login` — Login / register
- `/dashboard` — Role-based (parent / teacher)
- `/diag` — Environment and platform info
