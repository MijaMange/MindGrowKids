# Snabb fix: Service Worker blockerar API

## Steg 1: Rensa Service Worker

1. **Öppna Developer Tools** (F12)
2. **Gå till "Application"** (Chrome/Edge) eller "Storage" (Firefox)
3. **Klicka på "Service Workers"** i vänstermenyn
4. **Klicka på "Unregister"** för alla registrerade service workers
5. **Stäng Developer Tools**

## Steg 2: Starta om Dev-servern

Stoppa nuvarande processer (Ctrl+C) och starta om:

```bash
npm run dev
```

Detta startar både frontend (port 5173) och backend (port 4000).

## Steg 3: Testa igen

1. Öppna `http://localhost:5173`
2. Försök logga in som förälder

## Om det fortfarande inte fungerar

Kontrollera i Developer Tools (F12) → Console:
- Ser du fortfarande `ERR_CONNECTION_REFUSED`?
- Ser du några felmeddelanden?

Om ja, kontrollera:
- Att servern körs: `http://localhost:4000/api/health` ska ge `{"ok":true,...}`
- Att inga brandväggsregler blockerar port 4000



