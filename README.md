# MindGrow Kids

## Snabbguide

### PWA

- `npm run pwa:build` - Bygger PWA
- Deploya `/dist` till webbhotell
- Testa "Installera app" i Chrome/Safari

### App (Capacitor)

- `npm run build` - Bygger appen
- `npm run cap:copy` - Kopierar webDir till native-projekt
- `npm run cap:open:ios` - Öppnar i Xcode (för simulator/iPhone)
- `npm run cap:open:android` - Öppnar i Android Studio
- `npx capacitor-assets generate` - Skapar ikoner/splash från `/resources`

### CORS/HTTPS

- Backend måste tillåta: `capacitor://localhost`, `http://localhost`, `https://mindgrowkids.online`
- Frontend använder `apiRequest()` som automatiskt byter till `CapacitorHttp` när appen körs i native app-läge (iOS/Android)
- Cookies (httpOnly) fungerar i WKWebView; CORS måste vara korrekt i backend

### Native App-läge

Appen detekterar automatiskt när den körs i native app-läge (via Capacitor) och:
- Visar en "📱 App" badge i HUD
- Använder `CapacitorHttp` för API-anrop (slipper CORS-problem)
- Visar platforminfo i `/diag`-sidan
- Använder native funktionalitet (network, preferences, etc.)

Kör `/diag` för att se aktuellt läge (Web/PWA/Native App).

### App Store / Play Store

- **iOS**: Product → Archive → Distribute via Xcode
- **Android**: Build → Generate Signed Bundle/APK i Android Studio

## Database Configuration

### MongoDB Setup

The application supports MongoDB (with fallback to file-based storage).

1. **Set up `.env` file** (copy from `.env.production.example`):
   ```bash
   # MongoDB connection string (databasen)
   MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/MindGrow?retryWrites=true&w=majority
   MONGO_DB_NAME=MindGrow
   
   # Backend server
   PORT=4000
   JWT_SECRET=ditt-hemliga-jwt-secret
   ALLOWED_ORIGINS=https://mindgrowkids.online,https://www.mindgrowkids.online
   NODE_ENV=production
   ```

**Viktigt**: `MONGO_URL` är för **databasen** (MongoDB), inte för API:et. API:et är backend-servern som körs på port 4000 (eller PORT från .env).

Se `docs/PRODUCTION_SETUP.md` för detaljerad produktions-guide.

2. **Optional: Collection Name Mapping**
   If your MongoDB collections already exist with different names, you can map them:
   ```bash
   MONGO_COLLECTION_CHILDREN=kids
   MONGO_COLLECTION_PARENTS=parents
   MONGO_COLLECTION_PROS=professionals
   MONGO_COLLECTION_CHECKINS=checkins
   ```

3. **Verify Database Connection**
   - Start the server: `npm run dev:api`
   - Check diagnostics:
     - `GET http://localhost:4000/api/db-info` → Should show `{ mode:"mongo", db:"MindGrow", ... }`
     - `GET http://localhost:4000/api/db-collections` → Should list collections like `kids`, `parents`, etc.

4. **Fallback to File-DB**
   If `MONGO_URL` is not set or connection fails, the app automatically falls back to file-based storage (`server/mock-db.json`).

### Production Checklist

- ✅ Verify `/api/db-info` shows correct database name
- ✅ Verify `/api/db-collections` lists expected collections
- ✅ Test creating a checkin and verify it appears in the mapped collection
- ✅ Check server logs for: `[DB] MongoDB ansluten → MindGrow @ ...`

--- – MVP Day 1

A warm, accessible app for kids (5–12) to express feelings. The AI replies with reflective, non-advisory messages. Adults see aggregated trends only.

## Tech

React + TS (Vite), React Router, Zustand, CSS Modules, Jest (init), ESLint + Prettier.

## Run

```bash
npm install
npm run dev
```

## Routes

- `/child` (default)
- `/login`
- `/dashboard`

## Today's Scope

- EmotionPicker, InputArea, ListeningAIReply (mocked AI)
- Local draft save (localStorage)
- Calm theme, keyboard focus, reduced motion

## Next

- Drawing canvas (react-sketch-canvas)
- Chart.js mock dashboard
- Supabase Auth (magic link + class code)
- Node/Express API + persistence
