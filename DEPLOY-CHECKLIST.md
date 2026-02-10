# Checklista: Push till GitHub + Deploy på Render

## 📤 1. Före push till GitHub

### ✅ Säkerställ att allt fungerar lokalt
```bash
npm run build
npm run preview   # eller: cd dist/server && npm install --production && node index.js (från roten)
```
Öppna http://localhost:4173 (eller porten som visas) och testa att inloggning, Skapa konto och alla flöden fungerar.

### ✅ Kolla att inget känsligt hamnar i repo
- `.env` är i `.gitignore` – pushas INTE ✅
- `.env.local`, `.env.*.local` – pushas INTE ✅
- `node_modules`, `dist` – pushas INTE ✅
- `server/mock-db.json` – pushas (det är din data/utvecklingsdata) – OK för demo

### ✅ Kolla vad som pushas
```bash
git status
git add .
git status   # dubbelkolla innan commit
```

---

## 🚀 2. Render – Inställningar

### Build & Start-kommandon
| Inställning | Värde |
|-------------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` (eller `node dist/server/index.js`) |
| **Root Directory** | (lämna tom = projektroten) |

### Miljövariabler (Environment) – sätt i Render Dashboard
| Variabel | Värde | Obligatorisk |
|----------|-------|--------------|
| `NODE_ENV` | `production` | Ja |
| `JWT_SECRET` | Din hemliga nyckel (minst 16 tecken) | Ja |
| `PORT` | `4000` (eller lämna tom – Render sätter automatiskt) | Nej |
| `ALLOWED_ORIGINS` | Din Render-URL, t.ex. `https://mindgrowkids.onrender.com` | Ja (för CORS) |

**För att använda fil-DB (Otto, lärare, föräldrar från mock-db.json):**
- Sätt INTE `USE_MONGO` – då används filen automatiskt.
- Om du vill använda MongoDB: sätt `USE_MONGO=1` plus `MONGO_URL` och `MONGO_DB_NAME`.

### Viktigt om Render
- **Free tier:** Tjänsten sover efter ~15 min inaktivitet. Första anropet kan ta 30–60 sek.
- **Din data:** `mock-db.json` kopieras till `dist/server/` vid build. På free tier är filsystemet ephemeral – data kan rensas vid omstart. För beständig data: använd MongoDB (`USE_MONGO=1`).

---

## 🧪 3. Efter deploy – Snabbtest

1. Öppna din Render-URL (t.ex. `https://mindgrowkids.onrender.com`).
2. Klicka **Logga in** – inloggningsrutan ska öppnas.
3. Logga in med `otto@test.se` / `1234` (eller `larare@test.se`, `test`, `anna` med lösenord 1234).
4. Testa **Skapa konto** – formuläret ska fungera.
5. Testa barnets resa, lärares vy, förälderns vy – allt ska fungera.

---

## 📁 Sökväg till frontend (dist)

Servern körs från `dist/server/index.js` på Render. Därför måste `distPath` peka på `dist/` (en nivå upp från `dist/server`), inte `dist/dist`. Koden hanterar både:
- **Prod (Render):** `dist/server` → parent `dist` med `assets/` = rätt
- **Lokal dev:** `server` → `../dist` = dist

---

## 🏠 4. Webbhotell (utanför Render)

### Har ditt webbhotell Node.js-stöd?

Vilka leverantörer som ofta har Node.js: Loopia (Node-appar), Binero, One.com (vissa paket), eller moln som Render, Railway, Heroku.

**Om JA (Node.js finns):**
- Sätt upp som på Render: ladda upp projektet, kör `npm install && npm run build && cd dist/server && npm install --production`
- Starta med `node dist/server/index.js` (eller via PM2/cron)
- Skapa `.env` med `JWT_SECRET`, `ALLOWED_ORIGINS` (din domän)
- Gör en subdomän eller app som pekar mot Node-processen

**Om NEJ (bara PHP/statisk hosting):**

Då behöver du **två platser**:
1. **API** – kvar på Render (eller annan Node-tjänst)
2. **Frontend** – på webbhotellet (statiska filer)

**Steg för statisk frontend på webbhotellet:**

1. **Bygg med API-URL** (måste vara satt vid build):
   ```bash
   VITE_API_URL=https://mindgrowkids.onrender.com npm run build
   ```
   (Ersätt med din faktiska Render-URL)

2. **Ladda upp innehållet i `dist/`** (utan `dist/server/`) till webbhotellets `public_html` eller `www`:
   - `index.html`
   - `assets/`
   - `sw.js`, `manifest.webmanifest` (för PWA)

3. **På Render (API):** Lägg till webbhotellets domän i `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://mindgrowkids.onrender.com,https://mindgrowkids.online,https://www.mindgrowkids.online
   ```

4. **Cookies mellan olika domäner:**  
   Servern sätter redan `SameSite=None; Secure` i produktion (se `server/mw/auth.js`), så inloggning ska fungera när frontend och API har olika domäner – så länge CORS är rätt konfigurerat.

---

## ⚠️ Vanliga problem

| Problem | Lösning |
|---------|---------|
| "Frontend not built. Run: npm run build" | Sökvägen till dist var fel när servern kör från `dist/server/`. Nu fixat: `distPath` pekar på parent (dist) när `dist/assets` finns. |
| 404 på alla sidor | SPA fallback – servern ska servera index.html. Kolla att `dist/index.html` finns. |
| CORS-fel | Sätt `ALLOWED_ORIGINS` till din exakta Render-URL (https://...). |
| "Server saknar JWT_SECRET" | Sätt `JWT_SECRET` i Render Environment. |
| "Användare hittades inte" | Servern använder MongoDB – ta bort `USE_MONGO` eller sätt den inte, så används fil-DB. |
| Vit sida | Öppna F12 → Console. Kolla fel. API kan vara nere (första anrop på free tier). |
