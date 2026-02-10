# Snabbguide: Sätt in data direkt i MongoDB

## Metod 1: Via MongoDB Compass (Enklast)

1. Öppna MongoDB Compass
2. Anslut till: `mongodb+srv://mijansm:8dE-Se-2@cluster0.j9u8w.mongodb.net/MindGrow`
3. Välj collection → INSERT DOCUMENT → klistra in JSON nedan

## Metod 2: Via Script

```bash
npm run insert
```

Detta skapar automatiskt:
- Klass "1234"
- Lärare: larare@test.se / Hemligt123
- Förälder: parent@test.se / Hemligt123
- Barn: Otto / 1234
- Checkins, mood, avatar för Otto

---

## JSON för direktinsättning (utan _id)

### 1. Kids Collection

```json
{
  "name": "Otto",
  "classCode": "1234",
  "orgId": ""
}
```

### 2. Parents Collection

**VIKTIGT**: Generera passwordHash först:
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('Hemligt123',10).then(h=>console.log('passwordHash:',h))"
```

Sedan:
```json
{
  "email": "parent@test.se",
  "passwordHash": "KOPIERA_HASH_FRÅN_KOMMANDOT_OVAN",
  "name": "Mamma Test",
  "role": "parent"
}
```

### 3. Professionals Collection

Samma passwordHash som ovan:
```json
{
  "email": "larare@test.se",
  "passwordHash": "KOPIERA_HASH_FRÅN_KOMMANDOT_OVAN",
  "name": "Läraren Lisa",
  "role": "pro",
  "classCode": "1234",
  "orgId": ""
}
```

### 4. Classes Collection

```json
{
  "code": "1234",
  "name": "Demoklass 1234",
  "orgId": ""
}
```

**OBS**: `ownerUserId` kan läggas till senare när du har lärarens `_id`.

### 5. Checkins Collection

**VIKTIGT**: `studentId` måste vara `_id` från kids collection (t.ex. "507f1f77bcf86cd799439011")

```json
{
  "orgId": "",
  "classId": "",
  "studentId": "KOPIERA__ID_FRÅN_KIDS_COLLECTION",
  "emotion": "happy",
  "mode": "text",
  "note": "Jag kände mig glad idag!",
  "drawingRef": "",
  "dateISO": "2024-12-15T10:00:00.000Z",
  "createdAtISO": "2024-12-15T10:00:00.000Z"
}
```

### 6. Moods Collection

**VIKTIGT**: `childRef` måste vara ObjectId från kids collection

```json
{
  "childRef": "KOPIERA_OBJECTID_FRÅN_KIDS_COLLECTION",
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

### 7. Avatars Collection

**VIKTIGT**: `childRef` måste vara ObjectId från kids collection

```json
{
  "childRef": "KOPIERA_OBJECTID_FRÅN_KIDS_COLLECTION",
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

## Ordning för insättning

1. **Classes** först (behövs för kids)
2. **Professionals** (behövs för classes ownerUserId)
3. **Parents**
4. **Kids** (behöver classCode)
5. **Checkins** (behöver studentId från kids)
6. **Moods** (behöver childRef från kids)
7. **Avatars** (behöver childRef från kids)

---

## Generera passwordHash

För lösenordet "Hemligt123":

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('Hemligt123',10).then(h=>console.log(h))"
```

Kopiera output och använd som `passwordHash` i parents och professionals.

---

## Exempel: Komplett flöde

1. Sätt in **Class**:
   ```json
   { "code": "1234", "name": "Demoklass 1234", "orgId": "" }
   ```

2. Generera passwordHash och sätt in **Professional**:
   ```json
   {
     "email": "larare@test.se",
     "passwordHash": "$2a$10$...",
     "name": "Läraren Lisa",
     "role": "pro",
     "classCode": "1234",
     "orgId": ""
   }
   ```

3. Sätt in **Kid**:
   ```json
   { "name": "Otto", "classCode": "1234", "orgId": "" }
   ```
   **Kopiera `_id` från Otto** (t.ex. "507f1f77bcf86cd799439011")

4. Sätt in **Checkin** (använd Otto's `_id`):
   ```json
   {
     "studentId": "507f1f77bcf86cd799439011",
     "emotion": "happy",
     "mode": "text",
     "note": "Test",
     "dateISO": "2024-12-15T10:00:00.000Z",
     "createdAtISO": "2024-12-15T10:00:00.000Z",
     "orgId": "",
     "classId": ""
   }
   ```

5. Sätt in **Mood** (använd Otto's ObjectId):
   ```json
   {
     "childRef": { "$oid": "507f1f77bcf86cd799439011" },
     "values": { "love": 65, "joy": 70, "calm": 60, "energy": 55, "sadness": 30, "anger": 25 },
     "lastUpdated": "2024-12-15T10:00:00.000Z"
   }
   ```

---

## Tips

- **ObjectId i MongoDB Compass**: Klicka på "ObjectId" när du sätter in `childRef` eller `ownerUserId`
- **ObjectId i JSON**: Använd formatet `{ "$oid": "507f1f77bcf86cd799439011" }`
- **Timestamps**: MongoDB lägger till `createdAt` och `updatedAt` automatiskt om `timestamps: true` är satt i schemat




