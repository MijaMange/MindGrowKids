# Felsökning: Parent Login

## Vanliga problem

### 1. "Ingen användare hittades"
**Orsak:** Du har inte registrerat dig ännu.

**Lösning:**
1. Gå till `/login`
2. Välj fliken "Förälder/Lärare"
3. Fyll i:
   - E-post
   - Lösenord
   - Namn (valfritt)
4. Klicka på **"Registrera Förälder"** (INTE "Logga in")
5. Efter registrering loggas du in automatiskt

### 2. "Fel lösenord"
**Orsak:** Du har angett fel lösenord.

**Lösning:**
- Kontrollera att du använder rätt lösenord
- Om du glömt lösenordet: Registrera ett nytt konto med samma e-post (eller annan e-post)

### 3. "Server saknar JWT_SECRET"
**Orsak:** Servern är inte korrekt konfigurerad.

**Lösning:**
1. Kontrollera att `.env`-filen finns i `server/` mappen
2. Kontrollera att den innehåller: `JWT_SECRET=din-hemliga-nyckel`
3. Starta om servern: `npm run dev:api`

### 4. Inget händer när du klickar "Logga in"
**Orsak:** Servern körs inte eller frontend kan inte nå backend.

**Lösning:**
1. Kontrollera att servern körs:
   ```bash
   npm run dev:api
   ```
2. Kontrollera konsolen i webbläsaren (F12) för felmeddelanden
3. Kontrollera att backend körs på port 4000 (eller rätt port)

## Debugging

### Kolla serverns loggar
När du försöker logga in, kolla serverns terminal för meddelanden som:
- `[AUTH] Login attempt: { email: '...', hasPassword: true }`
- `[AUTH] User not found: ...` (om användaren inte finns)
- `[AUTH] Password mismatch for: ...` (om lösenordet är fel)
- `[AUTH] Login success: ...` (om det lyckades)

### Kolla webbläsarens konsol
Öppna Developer Tools (F12) och kolla Console-fliken för:
- `[Login] Sending request`
- `[Login] Response status: 200` (eller annat statusnummer)
- `[Login] Response data: ...`

### Kolla databasen
Om du använder fil-baserad databas (inte MongoDB):
- Filen finns i: `server/mock-db.json`
- Öppna filen och sök efter din e-post i `parents`-arrayen

## Testkonto

För att skapa ett testkonto:

1. Gå till `/login`
2. Välj "Förälder/Lärare"
3. Fyll i:
   - **E-post:** `test@parent.com`
   - **Lösenord:** `test123`
   - **Namn:** `Test Förälder`
4. Klicka på **"Registrera Förälder"**
5. Du loggas in automatiskt

Efter registrering kan du logga in med:
- **E-post:** `test@parent.com`
- **Lösenord:** `test123`



