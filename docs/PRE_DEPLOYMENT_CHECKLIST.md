# ✅ Checklista före publicering

## Steg 1: Bygg projektet

```bash
npm run build
```

Kontrollera att det inte finns fel i outputen.

---

## Steg 2: Skapa .env i dist/server/

```bash
cd dist/server
cp .env.example .env
```

**Redigera `dist/server/.env` och fyll i:**

```env
# OBLIGATORISKT - Utan dessa fungerar servern inte:

# MongoDB connection string (från MongoDB Atlas)
MONGO_URL=mongodb+srv://mijansm:8dE-Se-2@cluster0.j9u8w.mongodb.net/MindGrow?retryWrites=true&w=majority

# Databasnamn
MONGO_DB_NAME=MindGrow

# JWT secret (minst 32 tecken, använd en unik nyckel!)
JWT_SECRET=din-super-hemliga-nyckel-minst-32-tecken-lång

# OpenAI API key
OPENAI_API_KEY=sk-...din-riktiga-nyckel...

# Din frontend-URL (kommaseparerad om flera)
ALLOWED_ORIGINS=https://mindgrowkids.online,https://www.mindgrowkids.online

# Valfritt (men rekommenderat):
PORT=4000
NODE_ENV=production
FORCE_HTTPS=true
JWT_EXPIRES_IN=7d
OPENAI_MODEL=gpt-4o-mini
```

---

## Steg 3: Testa lokalt

```bash
# Från projektroten
cd dist/server
npm install --production
node index.js
```

**Förväntad output:**
```
[ENV] Laddade X variabler från /path/to/.env
[ENV] MONGO_URL: ✅
[ENV] MONGO_DB_NAME: ✅
[ENV] JWT_SECRET: ✅
[DB] MongoDB ansluten → MindGrow @ cluster0.xxx.mongodb.net
[API] Server listening on http://localhost:4000
```

**Testa i webbläsaren:**
1. Öppna `http://localhost:4000`
2. Testa inloggning:
   - Barn: `Otto` / `1234`
   - Förälder: `parent@test.se` / `Hemligt123`
   - Lärare: `larare@test.se` / `Hemligt123`
3. Testa `/api/health` → ska returnera `{"ok":true,...}`

---

## Steg 4: Kontrollera MongoDB

1. **Kontrollera att MongoDB Atlas är tillgänglig:**
   - Logga in på MongoDB Atlas
   - Kontrollera att IP-adressen är whitelistad (eller använd `0.0.0.0/0` för test)
   - Kontrollera att användaren har rätt behörigheter

2. **Testa anslutning:**
   - Servern ska logga: `[DB] MongoDB ansluten → MindGrow @ ...`
   - Om det misslyckas, kontrollera `MONGO_URL` i `.env`

---

## Steg 5: Välj publiceringsmetod

### Alternativ A: En server (Node.js)

**Fördelar:**
- Enklast att sätta upp
- Allt på samma plats

**Krav:**
- Server med Node.js 20+
- Port 4000 öppen (eller ändra `PORT` i `.env`)

**Instruktioner:**
1. Ladda upp hela `dist/`-mappen till servern
2. SSH:a in till servern
3. Gå till `dist/server/`
4. Kör `npm install --production`
5. Skapa `.env` (kopiera från din lokala)
6. Starta: `node index.js`

**För att köra i bakgrunden (PM2):**
```bash
npm install -g pm2
pm2 start index.js --name mindgrow
pm2 save
pm2 startup
```

---

### Alternativ B: Docker

**Fördelar:**
- Isolerad miljö
- Lätt att deploya och uppdatera

**Instruktioner:**
Se `docs/DEPLOYMENT.md` för Dockerfile och docker-compose.

---

### Alternativ C: Separat frontend/backend

**Frontend (Vercel/Netlify):**
1. Ladda upp `dist/` (utan `dist/server/`)
2. Sätt miljövariabel: `VITE_API_URL=https://din-backend-url.com`

**Backend (Railway/Render/Heroku):**
1. Ladda upp `dist/server/`
2. Sätt miljövariabler i dashboard:
   - `MONGO_URL`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `ALLOWED_ORIGINS` (inkludera din frontend-URL)
   - `MONGO_DB_NAME`

---

## Steg 6: Säkerhetskontroller

- [ ] `.env` är **INTE** i Git (kontrollera `.gitignore`)
- [ ] `JWT_SECRET` är minst 32 tecken och unik
- [ ] `ALLOWED_ORIGINS` inkluderar endast dina domäner
- [ ] `FORCE_HTTPS=true` i produktion
- [ ] MongoDB-användaren har begränsade behörigheter

---

## Steg 7: Efter publicering

1. **Testa live-versionen:**
   - Öppna din publicerade URL
   - Testa inloggning
   - Testa API-endpoints

2. **Kontrollera logs:**
   - Servern ska logga att MongoDB är ansluten
   - Inga felmeddelanden om saknade miljövariabler

3. **Testa PWA:**
   - Installera appen som PWA
   - Kontrollera att Service Worker fungerar

---

## 🆘 Om något inte fungerar

**Servern startar inte:**
- Kontrollera att `node index.js` körs från `dist/server/`
- Kontrollera att `npm install --production` har körts
- Kolla felmeddelanden i terminalen

**MongoDB-anslutning misslyckas:**
- Kontrollera `MONGO_URL` i `.env`
- Kontrollera att IP-adressen är whitelistad i MongoDB Atlas
- Testa connection string i MongoDB Compass

**CORS-fel:**
- Kontrollera att `ALLOWED_ORIGINS` inkluderar din frontend-URL (exakt match)
- Inkludera protokoll: `https://din-domän.com` (inte bara `din-domän.com`)

**404 på page reload:**
- Kontrollera att servern servar `index.html` för icke-API-routes
- Se `server/index.js` för SPA-fallback-logik

---

## 📝 Snabbkommando för test

```bash
# Bygg
npm run build

# Testa lokalt
cd dist/server
npm install --production
cp .env.example .env
# Redigera .env
node index.js
```

Öppna `http://localhost:4000` och testa!




