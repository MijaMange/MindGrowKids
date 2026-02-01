# MindGrow Kids - Development Guide

## Seed Data

Kör `npm run seed` en gång för att skapa testdata.

### Test-konton (för frontend-testning)

**Alla konton har samma lösenord**: `Hemligt123`

| Roll | Inloggning | Lösenord | Klasskod (för barn) |
|------|------------|----------|---------------------|
| **Förälder** | `parent@test.se` | `Hemligt123` | - |
| **Lärare (Professionell)** | `larare@test.se` | `Hemligt123` | - |
| **Barn** | Namn: `Otto` | - | `1234` |

**Viktigt**: 
- Kontrollera att MongoDB är konfigurerad i `.env` (MONGO_URL) innan du kör seed
- Seed-scriptet fungerar endast med MongoDB, inte med fil-baserad databas
- Kör `npm run seed` igen om du behöver återställa testdata

### Test-flöden (Frontend)

1. **Logga in som Förälder**:
   - Gå till `/login`
   - Välj fliken "Förälder/Lärare"
   - E-post: `parent@test.se`
   - Lösenord: `Hemligt123`
   - Klicka "Logga in"
   - Du kommer att omdirigeras till `/hub` eller `/parent`

2. **Logga in som Lärare/Professionell**:
   - Gå till `/login`
   - Välj fliken "Förälder/Lärare"
   - E-post: `larare@test.se`
   - Lösenord: `Hemligt123`
   - Klicka "Logga in"
   - Du kommer att omdirigeras till `/hub` eller `/pro`

3. **Logga in som Barn**:
   - Gå till `/login`
   - Välj fliken "Barn"
   - Namn: `Otto`
   - Klasskod: `1234`
   - Klicka "Starta"
   - Du kommer att omdirigeras till `/journey`

### Test-flöden (API/curl)

1. **Förälder-login**:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"parent@test.se","password":"Hemligt123"}' \
     -c cookies.txt
   ```
   Efter login: `GET /api/auth/me` ska visa `{ ok:true, role:"parent" }`

2. **Lärare-login**:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"larare@test.se","password":"Hemligt123"}' \
     -c cookies.txt
   ```
   Efter login: `GET /api/auth/me` ska visa `{ ok:true, role:"pro" }`

3. **Barn-login**:
   ```bash
   curl -X POST http://localhost:4000/api/auth/child-login \
     -H "Content-Type: application/json" \
     -d '{"name":"Otto","classCode":"1234"}' \
     -c cookies.txt
   ```
   Efter login: `GET /api/auth/me` ska visa `{ ok:true, role:"child" }`

## API-exempel (curl)

### 1. POST /api/checkins (med bearer token från barnlogin)

```bash
# Först: logga in som barn för att få token
curl -X POST http://localhost:4000/api/auth/child-login \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","classCode":"C-DEMO"}' \
  -c cookies.txt

# Sedan: skapa checkin
curl -X POST http://localhost:4000/api/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -b cookies.txt \
  -d '{
    "emotion": "happy",
    "mode": "text",
    "note": "Jag kände mig glad idag!"
  }'
```

### 2. GET /api/analytics/weekly

```bash
# För förälder eller lärare (kräver inloggning)
curl -X GET "http://localhost:4000/api/analytics/weekly?from=2024-12-01T00:00:00Z&to=2024-12-10T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -b cookies.txt
```

### 3. GET /api/export.csv

```bash
# Exportera aggregerad data som CSV
curl -X GET "http://localhost:4000/api/export.csv?from=2024-12-01T00:00:00Z&to=2024-12-10T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -b cookies.txt \
  -o export.csv
```

## Testdata

Systemet skapar automatiskt:
- En default org "demo" vid första användning
- Klasser när barn loggar in med classCode
- Studenter när barn loggar in första gången

## Miljövariabler (.env)

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=4000
JWT_SECRET=superhemligtbyteutmig
MONGO_URL=  # lämna tomt för fil-DB, eller sätt MongoDB connection string
```

