# Inloggning när du publicerar via dist-mapp

## Kort svar: **Ja, inloggning fungerar** om du följer något av nedan.

---

## Scenario 1: En server (vanligast) ✅

Du bygger frontend och kör **samma Node-server** som servar både API och `dist/`:

```bash
npm run build
cd server
node index.js
```

- Servern servar **API** på `/api/*`
- Servern servar **frontend** från mappen `dist/` (statiska filer)
- Användaren öppnar t.ex. `https://din-domän.com` → både sidor och API-anrop går till samma domän
- **Cookies skickas** (samma origin) → inloggning fungerar

**Du behöver inte** sätta `VITE_API_URL` vid build. Frontend använder `window.location.origin` som API-URL.

**Krav:** Skapa `server/.env` (eller `dist/server/.env` om du startar från dist) med bland annat:

- `JWT_SECRET` (minst 32 tecken)
- `MONGO_URL` och `MONGO_DB_NAME` (eller fil-DB)
- `ALLOWED_ORIGINS=https://din-domän.com` (vid behov)

---

## Scenario 2: Frontend och API på olika domäner

T.ex. frontend på **Vercel/Netlify**, API på **Railway/Render**:

1. **Vid build av frontend** (innan du laddar upp dist):
   ```bash
   VITE_API_URL=https://api.din-domän.com npm run build
   ```

2. **På API-servern** (Railway/Render):
   - Sätt `ALLOWED_ORIGINS=https://din-frontend-domän.com` (exakt URL till din frontend)
   - Båda måste använda **HTTPS** i produktion

3. **Cookies:** Servern sätter redan `SameSite=None; Secure` i produktion, så cookies fungerar cross-origin om båda sidor är HTTPS och CORS/origin är rätt konfigurerad.

---

## Kontrollera att inloggning fungerar

1. **Samma server:** Öppna sidan, logga in – du ska få cookie och kunna använda appen.
2. **Olika domäner:** Öppna DevTools → Application → Cookies. Efter inloggning ska du se en `token`-cookie (på API-domänen om du har split deployment).

Om inloggning misslyckas: kolla att `JWT_SECRET` är satt på servern och att `ALLOWED_ORIGINS` inkluderar den URL där frontend körs.
