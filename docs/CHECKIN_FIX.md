# Fix: Känslor loggas inte i dagboken

## Problem
Känslor som fylldes i känsloresan sparades, men visades inte i dagboken.

## Rotorsak
- Checkins sparades korrekt med `studentId: req.user.id`
- Men det fanns ingen GET-endpoint för att hämta checkins för inloggad användare
- Dagboken försökte hämta från `/api/children/${CHILD_ID}/checkins` som inte fanns

## Lösning

### 1. Skapad GET-endpoint för checkins
**Fil:** `server/routes/checkins.js`

Lagt till:
```javascript
// GET /api/checkins (child) -> hämta alla checkins för inloggad barn
checkins.get('/checkins', authRequired, roleRequired('child'), async (req, res) => {
  // Hämtar checkins för req.user.id (inloggad användare)
  // Sorterar efter datum (nyaste först)
});
```

### 2. Uppdaterad dagbok att använda rätt endpoint
**Fil:** `src/pages/Diary/ChildDiary.tsx`

Ändrat från:
```typescript
const r = await fetch(`/api/children/${CHILD_ID}/checkins`, { ... });
```

Till:
```typescript
const r = await fetch('/api/checkins', { credentials: 'include' });
```

### 3. Förbättrad error handling
- Lagt till bättre loggning i `FeelingJourney.tsx`
- Tydligare felmeddelanden om checkin-sparning misslyckas

## Test
1. Fyll i känsloresan (`/journey`)
2. Gå till dagboken (`/diary`)
3. Känslorna ska nu visas i dagbokens kalender

## API Endpoints

### POST /api/checkins
Sparar en checkin för inloggad barn.
```json
{
  "emotion": "happy",
  "mode": "text",
  "note": "Jag kände mig glad idag",
  "drawingRef": "optional-url"
}
```

### GET /api/checkins
Hämtar alla checkins för inloggad barn.
Returnerar array med checkins sorterade efter datum (nyaste först).



