# DOB vid registrering – leverans

## Ändrade filer

| Fil | Ändring |
|-----|--------|
| **src/utils/age.ts** | Ny modul: `calculateAge(dob)`, `getAgeBand(age)`, `getAgeBandFromDob(dob)`, `DEFAULT_AGE_BAND = '6-7'`. |
| **src/config/ageConfig.ts** | Ny åldersgrupp `'2-4'` med 4 känslor (Glad, Ledsen, Arg, Trött). `AgeGroup` utökad till `'2-4' \| '4-5' \| '6-7' \| '8-10'`. Default vid saknad DOB: `DEFAULT_AGE_BAND` (6–7). |
| **src/components/RegisterModal/RegisterModal.tsx** | Vid `role === 'child'`: valfritt fält `dateOfBirth` (type="date"), label "Födelsedatum (för att anpassa upplevelsen)". Validering: om angivet måste vara giltigt datum och inte i framtiden. Skickar `dateOfBirth` i register-payload. |
| **src/components/RegisterModal/RegisterModal.css** | Klass `.register-modal-label` för DOB-etiketten. |
| **src/pages/JourneySimple/JourneySimplePage.tsx** | Känsloval styrs av `ageConfig.emotions` (4 känslor för 2–4, annars 6). |
| **server/utils/age.js** | Ny modul: `calculateAge`, `getAgeBand`, `getAgeBandFromDob`, `DEFAULT_AGE_BAND`, `isValidAgeBand`. |
| **server/models/mongo.js** | Kid-schema: `dateOfBirth: { type: Date, default: null }`. `ageGroup` enum utökad med `'2-4'`. |
| **server/routes/auth.js** | Tar emot `dateOfBirth` vid registrering. Sparar `dateOfBirth` för barn (Mongo: `new Date(dateOfBirth)`, file: sträng). |
| **server/routes/children.js** | GET `/api/children/me`: beräknar `ageGroup` från `dateOfBirth` om det finns, annars `kid.ageGroup` eller `DEFAULT_AGE_BAND`. GET `/api/children/:id`: samma logik. POST `/api/children/age`: accepterar `'2-4'` (via `isValidAgeBand`). |

---

## Mongo och file-fallback

- **Mongo:** Kid har `dateOfBirth: { type: Date, default: null }`. Sparas vid registrering om klient skickar det. `/api/children/me` använder `kid.dateOfBirth` för att räkna ut `ageGroup` med `getAgeBandFromDob(kid.dateOfBirth)`.
- **File-DB:** I `auth.js` sparas `dateOfBirth: dateOfBirth || null` på kid-objektet (sträng, t.ex. "2019-05-15"). I `children.js` läses `kid.dateOfBirth` och `getAgeBandFromDob(kid.dateOfBirth)` används (accepterar sträng). Ingen separat schema-fil – file-DB är JSON, så nya fält behöver inte migrering.

---

## Exempel: DOB 2021 → ageBand 2–4 → 4 känslor

- **Födelsedatum:** 2021-06-15 (barnet är 3–4 år idag, feb 2025).
- **Beräkning:** `calculateAge('2021-06-15')` → 3 (eller 4 beroende på dag). `getAgeBand(3)` → `'2-4'`.
- **API:** GET `/api/children/me` returnerar `ageGroup: '2-4'` (beräknat från `dateOfBirth`).
- **Frontend:** `getAgeConfig('2-4')` ger `emotions: EMOTIONS_2_4` (Glad, Ledsen, Arg, Trött), `allowText: false`, `allowFreeWriting: false`.
- **Känsloresa:** Steg 1 visar endast dessa 4 känslor; steg 2 har inte fri text (men Rita/Klar finns).

---

## Acceptance

- [x] DOB-fält visas vid barn-registrering (valfritt).
- [x] Registrering fungerar med och utan DOB.
- [x] Efter login frågar appen inte efter ålder (backend returnerar alltid `ageGroup`, default `'6-7'`).
- [x] DOB styr åtminstone en anpassning: 2–4 år → 4 känslor och ingen fri text.
- [x] Saknad DOB → `ageGroup = '6-7'` (lagom komplicerat), 6 känslor, text valfritt.
