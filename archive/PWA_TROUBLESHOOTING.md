# PWA Service Worker Troubleshooting

## Problem: API-anrop blockeras av Service Worker

Om du ser `ERR_CONNECTION_REFUSED` eller att API-anrop inte fungerar, kan det bero på att PWA service workern blockerar dem.

## Lösningar

### 1. Rensa Service Worker (Snabbaste lösningen)

**I Chrome/Edge:**
1. Öppna Developer Tools (F12)
2. Gå till fliken "Application" (eller "Applikation")
3. I vänstermenyn, klicka på "Service Workers"
4. Klicka på "Unregister" för alla registrerade service workers
5. Uppdatera sidan (Ctrl+R eller F5)

**I Firefox:**
1. Öppna Developer Tools (F12)
2. Gå till fliken "Application"
3. Klicka på "Service Workers" i vänstermenyn
4. Klicka på "Unregister"
5. Uppdatera sidan

### 2. Inaktivera PWA i Development (Temporär lösning)

Om du bara vill utveckla utan PWA:

1. Öppna `vite.config.ts`
2. Ändra `devOptions: { enabled: true }` till `devOptions: { enabled: false }`
3. Starta om dev-servern

### 3. Kontrollera att servern körs

```bash
# Kontrollera om servern lyssnar på port 4000
netstat -ano | findstr :4000

# Om inget visas, starta servern:
npm run dev:api
```

### 4. Testa API direkt

Öppna i webbläsaren:
```
http://localhost:4000/api/health
```

Om detta fungerar men frontend inte kan nå API:et, är problemet troligen service workern.

## Konfiguration

I `vite.config.ts` är API-routes konfigurerade att:
- **Alltid** gå till nätverket (NetworkOnly)
- **Aldrig** cachas av service workern
- Fungera även via Vite's proxy (`/api` → `http://localhost:4000`)

Om problemet kvarstår efter att ha rensat service workern, kontrollera:
1. Att servern körs (`npm run dev:api`)
2. Att port 4000 är tillgänglig
3. Att CORS är korrekt konfigurerad i `server/index.js`



