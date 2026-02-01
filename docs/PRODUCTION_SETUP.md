# Produktionssetup

## Skillnad mellan MONGO_URL och API URL

### MONGO_URL (Databas)
- **Vad det är**: Connection string till MongoDB-databasen
- **Var det används**: Backend-servern (`server/index.js`) för att ansluta till databasen
- **Exempel**: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/MindGrow?retryWrites=true&w=majority`
- **Plats**: `.env` filen på servern

### API URL (Backend Server)
- **Vad det är**: Adressen till backend-servern (Express API)
- **Var det används**: Frontend (`src/utils/config.ts`) för att anropa API:et
- **Exempel**: `https://mindgrowkids.online` eller `https://api.mindgrowkids.online`
- **Plats**: `.env` filen i frontend (som `VITE_API_URL`) eller automatiskt via `window.location.origin`

## Setup för produktion

### Scenario 1: Backend och Frontend på samma domän

Om både frontend och backend körs på `https://mindgrowkids.online`:

1. **Backend körs på port 4000** (eller annan port)
2. **Frontend byggs och serveras från `/dist`** via samma Express-server
3. **Ingen extra konfiguration behövs** - frontend använder automatiskt `window.location.origin`

**`.env` på servern:**
```bash
# MongoDB connection (databasen)
MONGO_URL=mongodb+srv://mijansm:8dE-Se-2@cluster0.j9u8w.mongodb.net/MindGrow?retryWrites=true&w=majority
MONGO_DB_NAME=MindGrow

# Backend server
PORT=4000
JWT_SECRET=ditt-hemliga-jwt-secret-minst-32-tecken-långt
NODE_ENV=production

# CORS - tillåt dessa domäner att anropa API:et
ALLOWED_ORIGINS=https://mindgrowkids.online,https://www.mindgrowkids.online

# HTTPS (om du kör bakom proxy)
FORCE_HTTPS=false

# JWT expiration
JWT_EXPIRES_IN=7d
```

**Ingen `VITE_API_URL` behövs** - frontend använder automatiskt samma domän.

### Scenario 2: Backend och Frontend på olika domäner/portar

Om backend körs på t.ex. `https://api.mindgrowkids.online` eller `https://mindgrowkids.online:4000`:

1. **Sätt `VITE_API_URL` i `.env`** (i projektroten, INNAN build):
```bash
VITE_API_URL=https://api.mindgrowkids.online
# eller
VITE_API_URL=https://mindgrowkids.online:4000
```

2. **Bygg frontend igen** efter att ha satt `VITE_API_URL`:
```bash
npm run build
```

3. **Backend `.env`** måste tillåta frontend-domänen i CORS:
```bash
ALLOWED_ORIGINS=https://mindgrowkids.online,https://www.mindgrowkids.online
```

## Felsökning

### Problem: "Ogiltigt svar från servern"

1. **Kontrollera att backend körs:**
   - Testa: `https://mindgrowkids.online/api/health`
   - Borde returnera: `{"ok":true,"env":"production"}`

2. **Kontrollera CORS:**
   - Öppna Developer Tools (F12) → Network
   - Försök logga in
   - Kolla om request till `/api/auth/child-login` har CORS-fel
   - Backend måste tillåta frontend-domänen i `ALLOWED_ORIGINS`

3. **Kontrollera API URL:**
   - Öppna `/diag` i produktionen
   - Kolla vad `API_BASE` visar
   - Om det är fel, sätt `VITE_API_URL` och bygg om

4. **Kontrollera backend logs:**
   - Se om request når backend
   - Se om det finns fel i backend-konsolen

### Problem: Cookies fungerar inte

I produktion måste cookies ha:
- `sameSite: 'none'` (för cross-site)
- `secure: true` (för HTTPS)

Backend gör redan detta automatiskt när `NODE_ENV=production`.

## Checklista för produktion

- [ ] `MONGO_URL` är korrekt i backend `.env`
- [ ] `JWT_SECRET` är satt i backend `.env`
- [ ] `ALLOWED_ORIGINS` innehåller frontend-domänen
- [ ] Backend körs och svarar på `/api/health`
- [ ] Frontend är byggd (`npm run build`)
- [ ] Frontend serveras från `/dist` via Express
- [ ] HTTPS är aktiverat (för cookies)
- [ ] CORS tillåter frontend-domänen

