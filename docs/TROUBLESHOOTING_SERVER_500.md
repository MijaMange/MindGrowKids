# Felsökning: Serverfel 500

## Problem
Servern returnerar 500 (Internal Server Error) utan svar när du försöker logga in eller registrera dig.

## Steg för att felsöka

### 1. Kontrollera att servern körs

```bash
# I en terminal, kör:
npm run dev:api
```

Du bör se:
```
[API] Server started successfully on port 4000
📊 Database: file (mock-file)
🌐 CORS allowed origins: ...
```

### 2. Kontrollera serverns terminal

När du försöker logga in/registrera dig, kolla serverns terminal för:
- Felmeddelanden
- Stack traces
- Varningar om saknade miljövariabler

### 3. Kontrollera .env-filen

Servern behöver `JWT_SECRET` i `.env`-filen:

```bash
# I server/.env eller .env i root:
JWT_SECRET=din-hemliga-nyckel-här
```

### 4. Testa API direkt

Öppna i webbläsaren:
```
http://localhost:4000/api/health
```

Du bör få:
```json
{"ok":true,"env":"dev","timestamp":"...","origin":"...","host":"localhost:4000"}
```

Om detta inte fungerar:
- Servern körs inte
- Port 4000 är upptagen
- Brandvägg blockerar porten

### 5. Kontrollera port 4000

```powershell
# Windows PowerShell:
netstat -ano | Select-String ":4000"
```

Om inget visas: Servern körs inte på port 4000.

### 6. Vanliga problem

#### Problem: "Missing JWT_SECRET"
**Lösning:** Lägg till `JWT_SECRET=...` i `.env`-filen i `server/` eller root.

#### Problem: "Cannot find module"
**Lösning:** Kör `npm install` i root-mappen.

#### Problem: Port 4000 är upptagen
**Lösning:** 
- Stäng andra program som använder port 4000
- Eller ändra port i `.env`: `PORT=4001`

#### Problem: MongoDB-anslutning misslyckas
**Lösning:** 
- Om du inte använder MongoDB, det är okej - systemet använder file-based fallback
- Om du vill använda MongoDB, kontrollera `MONGO_URL` i `.env`

### 7. Debugging med diagnostik-sidan

Gå till `/diagnostics` för att se:
- API-status
- Databasstatus
- Inloggningsstatus
- Detaljerade felmeddelanden

## Snabb fix

1. **Stoppa servern** (Ctrl+C)
2. **Kontrollera .env:**
   ```bash
   # Se till att server/.env eller .env innehåller:
   JWT_SECRET=test-secret-key-123
   ```
3. **Starta servern igen:**
   ```bash
   npm run dev:api
   ```
4. **Testa igen**

## Om problemet kvarstår

1. Kolla serverns terminal för exakta felmeddelanden
2. Kolla webbläsarens konsol (F12) för detaljer
3. Testa `/api/health` direkt i webbläsaren
4. Kontrollera att inga brandväggsregler blockerar port 4000



