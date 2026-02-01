# 🚀 Steg-för-steg: Publicera MindGrow Kids

## 1️⃣ Bygg projektet

```bash
npm run build
```

Detta skapar `dist/`-mappen med allt som behövs.

---

## 2️⃣ Skapa .env (VIKTIGT!)

```bash
cd dist/server
copy .env.example .env
```

**Redigera `dist/server/.env` och fyll i:**

```env
MONGO_URL=mongodb+srv://mijansm:8dE-Se-2@cluster0.j9u8w.mongodb.net/MindGrow?retryWrites=true&w=majority
MONGO_DB_NAME=MindGrow
JWT_SECRET=din-super-hemliga-nyckel-minst-32-tecken
OPENAI_API_KEY=sk-...din-riktiga-nyckel...
ALLOWED_ORIGINS=https://mindgrowkids.online,https://www.mindgrowkids.online
PORT=4000
NODE_ENV=production
FORCE_HTTPS=true
JWT_EXPIRES_IN=7d
```

**⚠️ Utan .env fungerar servern INTE!**

---

## 3️⃣ Testa lokalt

```bash
cd dist/server
npm install --production
node index.js
```

Öppna `http://localhost:4000` och testa:
- ✅ Inloggning fungerar
- ✅ API:et svarar (`/api/health`)
- ✅ MongoDB är ansluten (kolla serverlogs)

---

## 4️⃣ Välj publiceringsmetod

### Metod A: En server (enklast)

1. Ladda upp hela `dist/`-mappen till din server
2. SSH:a in
3. Gå till `dist/server/`
4. Kör:
   ```bash
   npm install --production
   # Skapa .env (kopiera från din lokala)
   node index.js
   ```

### Metod B: Docker

Se `docs/DEPLOYMENT.md` för Dockerfile.

### Metod C: Separat frontend/backend

- **Frontend**: Ladda upp `dist/` (utan `dist/server/`) till Vercel/Netlify
- **Backend**: Ladda upp `dist/server/` till Railway/Render och sätt miljövariabler i dashboard

---

## 5️⃣ Efter publicering

1. Testa din live-URL
2. Kontrollera att inloggning fungerar
3. Kolla serverlogs för fel

---

## ✅ Checklista

- [ ] `npm run build` kördes utan fel
- [ ] `.env` är skapad i `dist/server/` med riktiga värden
- [ ] Testat lokalt och allt fungerar
- [ ] MongoDB är tillgänglig
- [ ] `ALLOWED_ORIGINS` inkluderar din frontend-URL
- [ ] `.env` är INTE i Git (kontrollera `.gitignore`)

---

## 📚 Mer info

- Detaljerad guide: `docs/PRE_DEPLOYMENT_CHECKLIST.md`
- Publiceringsalternativ: `docs/DEPLOYMENT.md`
- Felsökning: `docs/TROUBLESHOOTING.md`




