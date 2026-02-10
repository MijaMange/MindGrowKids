# Logga in som Otto / Lärare / Förälder – snabbfix

Om inloggning inte fungerar trots att all data finns i `server/mock-db.json`:

## 1. Använd fil-DB (en gång)

Kör i projektroten (där `package.json` ligger):

```bash
npm run use-file-db
```

Det lägger till `USE_FILE_DB=1` i din `.env` så att servern använder `mock-db.json` (där Otto, Lärare och föräldrar finns) i stället för MongoDB.

## 2. Starta om servern

Stoppa med **Ctrl+C** och starta igen:

```bash
npm run dev
```

I terminalen ska du se något i stil med:  
`[ENV] USE_FILE_DB=1 → använder endast fil-DB` och `📊 Database: file (mock-file)`.

## 3. Logga in

- **Otto (barn):** Användarnamn `otto@test.se`, lösenord det du satte när du skapade Otto.
- **Lärare:** `larare@test.se` (samma lösenord som andra testkonton om det sattes så).
- **Förälder:** `test` eller `anna` (samma lösenord som vid skapande).

---

**Knapparna** "Logga in" och "Skapa konto" är justerade så att de har samma höjd och ligger i linje.

Lycka till med presentationen.
