# Var är min data? Så loggar du in igen

## Viktigt: Använder vi MongoDB eller fil?

Servern väljer automatiskt:

- **Om `MONGO_URL` finns i `.env`** → servern använder **MongoDB**. Då används **inte** `server/mock-db.json`. Otto, Lärare och allt du lagt i filen finns då bara om du också lagt in det i MongoDB.
- **Om `MONGO_URL` saknas (eller är tom)** → servern använder **fil** och läser `server/mock-db.json`. Då fungerar Otto, Lärare och alla andra som finns i filen.

**Om ni inte använder MongoDB:** Öppna `.env` och ta bort eller kommentera bort raderna med `MONGO_URL` och `MONGO_DB_NAME` (lägg till `#` framför så att de blir kommentarer). Starta om servern (`npm run dev`). Då används bara filen och inloggning mot Otto m.fl. fungerar igen.

---

## Din data är kvar

**Allt du skapat ligger i en enda fil:**  
`server/mock-db.json`

Där finns bland annat:

- **Otto** (barn) – e-post: `otto@test.se`, klasskod: 1234  
- **Lärare** (pro) – e-post: `larare@test.se`, klasser: C-JBPH m.fl.  
- **Test Lärare** – e-post: `lara`, klasskod: TEST-123  
- **Föräldrar** – t.ex. `test`, `anna`  
- **Barn i klassen** – Ella, William, Alice, Oscar, Maja, Erik, Elsa, Leo, Olivia, Noah, Astrid, Ludvig, Stella, Axel, Ebba, Emma, m.fl.  
- Alla checkins, humör, klasser – allt finns kvar i samma fil.

Filen har inte raderats. Om du inte ser dina användare i appen beror det nästan alltid på att **inloggning eller server inte fungerar**, inte på att data saknas.

---

## Så får du inloggning att fungera igen

### 1. Starta både webb och server

I projektets rotmapp (där `package.json` ligger):

```bash
npm run dev
```

Det startar samtidigt:

- frontend (Vite) på http://localhost:5173  
- backend (API) på http://localhost:4000  

Om du bara kör t.ex. `npm run dev:web` startar **inte** API:et, och då fungerar inte inloggning.

### 2. Sätt JWT_SECRET i .env

Servern kräver `JWT_SECRET` för att kunna logga in användare. Utan den får du serverfel när du klickar på "Logga in".

**Om du har en `.env`-fil** (i projektroten eller i `server/`):

- Öppna `.env`
- Kontrollera att det finns en rad:  
  `JWT_SECRET=din_hemliga_nyckel_minst_16_tecken`
- Om raden saknas eller är tom – lägg till den (välj en egen lång, slumpad sträng).

**Om du inte har någon `.env`:**

1. Kopiera `.env.example` till `.env`:  
   `cp .env.example .env`  
   (eller skapa en ny fil som heter `.env` i projektroten.)
2. Öppna `.env` och sätt t.ex.:  
   `JWT_SECRET=min_hemliga_nyckel_123`

Starta om servern efter att du ändrat `.env` (`npm run dev` igen).

### 3. Använd e-post som "användarnamn"

På inloggningssidan betyder "Användarnamn" i praktiken **e-post** (eller det du registrerade som inloggning). Servern letar efter användare på e-post.

Exempel:

- **Lärare:** Användarnamn: `larare@test.se`  
- **Otto (barn):** Användarnamn: `otto@test.se`  
- **Test Lärare:** Användarnamn: `lara`  
- **Förälder:** Användarnamn: `test` eller `anna`  

Lösenordet är det du (eller seed-scriptet) satte när kontot skapades. För många testkonton är det ofta något enkelt som `test` eller `password` – om du inte minns kan du återställa lösenord via registrering/seed igen (beroende på hur ni satt upp det).

---

## Kort checklista

1. **Data:** Finns i `server/mock-db.json` – inget är borttaget där.  
2. **Start:** Kör `npm run dev` (både webb och API).  
3. **.env:** Ha `JWT_SECRET=...` satt; starta om servern.  
4. **Inloggning:** Använd e-post som användarnamn (t.ex. `larare@test.se`, `otto@test.se`).  

Om du fortfarande inte kommer in: kolla att inga fel visas i terminalen där `npm run dev` körs, och att du öppnar http://localhost:5173 i webbläsaren.
