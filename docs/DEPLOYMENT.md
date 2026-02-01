# Publiceringsguide för MindGrow Kids

## 📦 Vad som byggts

Efter `npm run build` har du nu en `dist/`-mapp med:

```
dist/
├── index.html              # Frontend entry point
├── assets/                 # Kompilerade JS/CSS
├── server/                 # Backend-filer (kopierade från server/)
│   ├── index.js
│   ├── lib/
│   ├── models/
│   ├── routes/
│   ├── mw/
│   ├── .env.example        # Mall för miljövariabler
│   └── package.json        # Med alla dependencies
├── sw.js                   # Service Worker (PWA)
├── manifest.webmanifest    # PWA manifest
├── start.bat              # Start-script (Windows)
├── start.sh               # Start-script (Linux/Mac)
└── README.md              # Snabbstart-guide
```

---

## ⚠️ VIKTIGT: .env måste skapas!

**Utan `.env` kommer servern INTE kunna:**
- ❌ Ansluta till MongoDB
- ❌ Autentisera användare
- ❌ Använda OpenAI API

### Steg 1: Skapa .env

```bash
cd dist/server
cp .env.example .env
```

### Steg 2: Fyll i värdena

Redigera `dist/server/.env` och fyll i:

```env
# OBLIGATORISKT:
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/MindGrow
MONGO_DB_NAME=MindGrow
JWT_SECRET=din-super-hemliga-nyckel-minst-32-tecken-lång
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=https://din-domän.com,https://www.din-domän.com

# Valfritt:
PORT=4000
NODE_ENV=production
FORCE_HTTPS=true
JWT_EXPIRES_IN=7d
OPENAI_MODEL=gpt-4o-mini
```

**Servern letar efter .env i denna ordning:**
1. `dist/server/.env` (rekommenderat)
2. `dist/.env`
3. `.env` (projektroten)

---

## 🚀 Publiceringsalternativ

### Alternativ 1: En server (Node.js) - Enklast

**Steg 1: Installera dependencies**
```bash
cd dist/server
npm install --production
```

**Steg 2: Skapa .env** (se ovan)

**Steg 3: Starta servern**
```bash
# Windows:
cd ..
start.bat

# Linux/Mac:
cd ..
chmod +x start.sh
./start.sh

# Eller manuellt:
cd server
node index.js
```

Servern kommer att:
- ✅ Serva API:et på `/api/*`
- ✅ Serva frontend från `dist/` (statiska filer)
- ✅ Hantera SPA-routing (inga 404:or vid page reload)

---

### Alternativ 2: Docker (rekommenderat för produktion)

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Kopiera dist (frontend + backend)
COPY dist/ ./

# Installera endast production-dependencies för server
WORKDIR /app/server
RUN npm install --production

# Exponera port
EXPOSE 4000

# Starta server
CMD ["node", "index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGO_URL=${MONGO_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MONGO_DB_NAME=${MONGO_DB_NAME}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - FORCE_HTTPS=${FORCE_HTTPS:-true}
    env_file:
      - .env
```

**Bygg och kör:**
```bash
docker build -t mindgrow-kids .
docker run -p 4000:4000 --env-file .env mindgrow-kids
```

**Eller med docker-compose:**
```bash
docker-compose up -d
```

---

### Alternativ 3: Vercel / Netlify (Frontend) + Railway/Render (Backend)

**Frontend:**
1. Ladda upp `dist/` (utan `dist/server/`) till Vercel/Netlify
2. Sätt miljövariabel: `VITE_API_URL=https://din-backend-url.com`

**Backend:**
1. Deploya `dist/server/` till Railway, Render, eller Heroku
2. Sätt miljövariabler i hosting-plattformens dashboard:
   - `MONGO_URL`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `ALLOWED_ORIGINS` (inkludera din frontend-URL)
3. Se till att `ALLOWED_ORIGINS` inkluderar din frontend-URL

---

## ✅ Checklista före publicering

- [ ] `npm run build` kördes utan fel
- [ ] `.env` är skapad i `dist/server/` med riktiga värden
- [ ] `MONGO_URL` är korrekt och MongoDB är tillgänglig
- [ ] `JWT_SECRET` är minst 32 tecken och unik
- [ ] `ALLOWED_ORIGINS` inkluderar din frontend-URL (exakt match)
- [ ] `FORCE_HTTPS=true` i produktion (om du använder HTTPS)
- [ ] Testa inloggning (barn, förälder, lärare)
- [ ] Testa att API:et svarar (`/api/health`)

---

## 🧪 Testa lokalt före publicering

```bash
# Bygg projektet
npm run build

# Gå till dist/server
cd dist/server

# Installera dependencies
npm install --production

# Skapa .env
cp .env.example .env
# Redigera .env med dina värden

# Starta servern
node index.js
```

Öppna `http://localhost:4000` i webbläsaren.

**Förväntad output:**
```
[ENV] Laddade X variabler från /path/to/.env
[ENV] MONGO_URL: ✅
[ENV] MONGO_DB_NAME: ✅
[ENV] JWT_SECRET: ✅
[ENV] OPENAI_API_KEY: ✅
[DB] MongoDB ansluten → MindGrow @ cluster0.xxx.mongodb.net
[API] Server listening on http://localhost:4000
```

Om du ser varningar om saknade variabler, kontrollera din `.env`-fil.

---

## 📝 Noteringar

- **PWA**: Service Worker och manifest är inkluderade. Appen kan installeras som PWA.
- **SPA-routing**: Servern servar `index.html` för alla icke-API-routes (hanterar page reload).
- **Säkerhet**: `.env` kopieras **INTE** till `dist/` (säkerhet). Du måste skapa den manuellt på servern.
- **Storlek**: Frontend-bundle är ~610 KB (komprimerad ~200 KB). Överväg code-splitting för större applikationer.

---

## 🆘 Felsökning

**"Cannot find module" i produktion:**
- Se till att `dist/server/node_modules` innehåller alla dependencies
- Kör `npm install --production` i `dist/server/`

**CORS-fel:**
- Kontrollera att `ALLOWED_ORIGINS` inkluderar din frontend-URL (exakt match, inkludera protokoll)
- I development, tillåts `localhost` automatiskt

**404 på page reload:**
- Kontrollera att servern servar `index.html` för icke-API-routes
- Se `server/index.js` för SPA-fallback-logik

**MongoDB-anslutning misslyckas:**
- Kontrollera `MONGO_URL` och `MONGO_DB_NAME`
- Se till att IP-adressen är whitelistad i MongoDB Atlas
- Kontrollera att användarnamn/lösenord är korrekt i connection string

**"WARNING: No .env file found!"**
- Skapa `.env` i `dist/server/` (eller en av de andra platserna)
- Kopiera från `.env.example` och fyll i värdena

**Servern startar men API:et svarar inte:**
- Kontrollera att alla miljövariabler är korrekt ifyllda i `.env`
- Kolla serverlogs för felmeddelanden
- Testa `/api/health` endpoint
