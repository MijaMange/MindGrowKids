# MongoDB JSON-exempel för direktinsättning

## Användning

### Metod 1: Via MongoDB Compass
1. Öppna MongoDB Compass
2. Anslut till din databas (`MindGrow`)
3. Välj collection (t.ex. `kids`)
4. Klicka "INSERT DOCUMENT"
5. Klistra in JSON (utan `_id` om du vill att MongoDB skapar den automatiskt)

### Metod 2: Via mongo shell
```bash
mongo "mongodb+srv://mijansm:8dE-Se-2@cluster0.j9u8w.mongodb.net/MindGrow"
```

Sedan:
```javascript
use MindGrow

// Sätt in barn
db.kids.insertOne({
  "name": "Otto",
  "classCode": "1234",
  "orgId": ""
})

// Sätt in förälder (lösenord måste hashas med bcrypt)
db.parents.insertOne({
  "email": "parent@test.se",
  "passwordHash": "$2a$10$...", // Använd bcrypt.hash('Hemligt123', 10)
  "name": "Mamma Test",
  "role": "parent"
})
```

### Metod 3: Via script
```bash
node scripts/insert-direct.mjs
```

## JSON-exempel

### Kids (barn)
```json
{
  "name": "Otto",
  "classCode": "1234",
  "orgId": ""
}
```

### Parents (föräldrar)
**VIKTIGT**: `passwordHash` måste genereras med bcrypt. Kör:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('Hemligt123', 10).then(hash => console.log(hash));
```

```json
{
  "email": "parent@test.se",
  "passwordHash": "$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq",
  "name": "Mamma Test",
  "role": "parent"
}
```

### Professionals (lärare)
```json
{
  "email": "larare@test.se",
  "passwordHash": "$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq",
  "name": "Läraren Lisa",
  "role": "pro",
  "classCode": "1234",
  "orgId": ""
}
```

### Checkins
**VIKTIGT**: `studentId` måste matcha `_id` från `kids` collection.

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

### Moods
**VIKTIGT**: `childRef` måste matcha `_id` från `kids` collection.

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

### Avatars
**VIKTIGT**: `childRef` måste matcha `_id` från `kids` collection.

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

### Classes
```json
{
  "code": "1234",
  "name": "Demoklass 1234",
  "ownerUserId": "507f1f77bcf86cd799439031",
  "orgId": ""
}
```

## Generera passwordHash

För att generera korrekt `passwordHash` för lösenordet "Hemligt123":

### I Node.js:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('Hemligt123', 10).then(hash => console.log(hash));
```

### Via script:
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('Hemligt123',10).then(h=>console.log(h))"
```

## Komplett exempel med ObjectId

Om du vill ange `_id` manuellt (annars skapar MongoDB automatiskt):

```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439011"},
  "name": "Otto",
  "classCode": "1234",
  "orgId": ""
}
```

Eller i MongoDB Compass, använd ObjectId-formatet direkt.




