# Enkel guide: Sätt in data i MongoDB

## Snabbaste sättet

Kör detta kommando (skapar allt automatiskt):
```bash
npm run insert
```

Detta skapar:
- ✅ Klass "1234"
- ✅ Lärare: `larare@test.se` / `Hemligt123`
- ✅ Förälder: `parent@test.se` / `Hemligt123`
- ✅ Barn: `Otto` / klasskod `1234`
- ✅ Checkins, mood och avatar för Otto

---

## Om du vill göra det manuellt i MongoDB Compass

### Steg 1: Öppna MongoDB Compass
- Anslut till: `mongodb+srv://mijansm:8dE-Se-2@cluster0.j9u8w.mongodb.net/MindGrow`

### Steg 2: Sätt in i rätt ordning

#### 1. Classes collection
```json
{
  "code": "1234",
  "name": "Demoklass 1234",
  "orgId": ""
}
```

#### 2. Professionals collection
Först, generera passwordHash:
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('Hemligt123',10).then(h=>console.log(h))"
```

Kopiera hash-värdet och använd här:
```json
{
  "email": "larare@test.se",
  "passwordHash": "$2b$10$fqWgIdZLLQvJxdi90oR5uecrrNiAGk49w9W3WDtf2IYrNBxrmxdB6",
  "name": "Läraren Lisa",
  "role": "pro",
  "classCode": "1234",
  "orgId": ""
}
```

#### 3. Parents collection
Samma passwordHash som ovan:
```json
{
  "email": "parent@test.se",
  "passwordHash": "$2b$10$fqWgIdZLLQvJxdi90oR5uecrrNiAGk49w9W3WDtf2IYrNBxrmxdB6",
  "name": "Mamma Test",
  "role": "parent"
}
```

#### 4. Kids collection
```json
{
  "name": "Otto",
  "classCode": "1234",
  "orgId": ""
}
```

**VIKTIGT**: Efter att du satt in Otto, kopiera hans `_id` (t.ex. `507f1f77bcf86cd799439011`)

#### 5. Checkins collection
Använd Otto's `_id` som `studentId`:
```json
{
  "orgId": "",
  "classId": "",
  "studentId": "507f1f77bcf86cd799439011",
  "emotion": "happy",
  "mode": "text",
  "note": "Jag kände mig glad idag!",
  "drawingRef": "",
  "dateISO": "2024-12-15T10:00:00.000Z",
  "createdAtISO": "2024-12-15T10:00:00.000Z"
}
```

#### 6. Moods collection
Använd Otto's ObjectId som `childRef`:
```json
{
  "childRef": "507f1f77bcf86cd799439011",
  "values": {
    "love": 65,
    "joy": 70,
    "calm": 60,
    "energy": 55,
    "sadness": 30,
    "anger": 25
  },
  "lastUpdated": "2024-12-15T10:00:00.000Z"
}
```

#### 7. Avatars collection
Använd Otto's ObjectId som `childRef`:
```json
{
  "childRef": "507f1f77bcf86cd799439011",
  "data": {
    "hair": "short",
    "hairColor": "#8B4513",
    "eyes": "happy",
    "mouth": "smile",
    "top": "tshirt",
    "topColor": "#FF6B6B",
    "bottom": "pants",
    "bottomColor": "#4ECDC4",
    "accessory": "none",
    "background": "sky",
    "skinTone": "#FDBCB4"
  }
}
```

---

## Testa inloggning

Efter att du satt in data:

1. **Förälder**: `parent@test.se` / `Hemligt123`
2. **Lärare**: `larare@test.se` / `Hemligt123`
3. **Barn**: `Otto` / klasskod `1234`

---

## Felsökning

- **"Ogiltigt svar från servern"**: Kolla backend logs och `/diag`-sidan
- **Lösenord fungerar inte**: Se till att passwordHash är korrekt genererad med bcrypt
- **ObjectId fel**: I MongoDB Compass, använd "ObjectId" typen när du sätter in `childRef` eller `ownerUserId`




