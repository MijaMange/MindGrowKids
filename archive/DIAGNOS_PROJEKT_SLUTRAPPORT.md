# Diagnos – MindGrow Kids (för slutrapport & reflektion)

Genomgång av repot gjord för att underlätta skrivande av projektrapport och reflektion i dåtid ("jag har...").

---

## A) One-liner

**MindGrow Kids är en webbaserad prototyp där barn (ca 5–12 år) kan uttrycka känslor via emoji, text och ritning, få reflekterande svar från en AI-kompanjon, och vuxna (föräldrar/lärare) kan se aggregerad statistik över känslomönster utan att läsa individuella inlägg.**

---

## B) Tech stack

| Område | Teknik |
|--------|--------|
| **Frontend** | React 18, TypeScript, Vite 5, React Router 6, Framer Motion, Zustand, react-sketch-canvas, Howler (ljud), Chart.js (vuxenvy) |
| **Backend** | Node.js, Express (i `server/`), cookie-parser, bcryptjs, jsonwebtoken |
| **Datalagring** | MongoDB (Mongoose) med fallback till filbaserad JSON (`server/mock-db.json`) |
| **Auth** | JWT i httpOnly-cookies, rollbaserad åtkomst (child / parent / pro) |
| **State** | Zustand (useCheckinStore, useEmojiAvatarStore, useMoodStore, useRoleStore), React Context (AuthContext, AgeContext) |
| **Charts** | Chart.js + react-chartjs-2 (ProSimplePage, vuxen-statistik) |
| **Deploy** | Vite build → `dist/`; server kopieras till `dist/server/`; PWA (vite-plugin-pwa); Capacitor för iOS/Android; dokumentation för egen Node-server och Vercel/Netlify (statisk frontend + separat API) |

**Filer att peka på:** `package.json`, `vite.config.ts`, `server/index.js`, `server/lib/db.js`, `src/auth/AuthContext.tsx`, `src/context/AgeContext.tsx`, `src/state/*.ts`, `docs/DEPLOYMENT.md`.

---

## C) Funktioner som FUNKAR (med referens i koden)

- **Landningssida** – Offentlig startsida med CTA (Logga in, För vuxna).  
  `src/pages/Landing/LandingPage.tsx`
- **Registrering och inloggning** – Barn, föräldrar, lärare; JWT i cookie.  
  `src/pages/Login/LoginPage.tsx`, `src/pages/Register/RegisterPage.tsx`, `server/routes/auth.js`
- **Rollbaserad hub** – Efter inloggning: barn → hub med tre actions; förälder → Mina barn; lärare → Klassstatistik/dagbok.  
  `src/pages/SafeHub/SafeHubPage.tsx`
- **Känsloresa (barn)** – Steg 1: välj känsla (emoji). Steg 2: Rita eller skriv (ritcanvas med emojis, fritext/meningsbyggare). Sparas som checkin.  
  `src/pages/JourneySimple/JourneySimplePage.tsx`, `src/components/JourneyDraw/JourneyDraw.tsx`, `server/routes/listen.js` (reflekterande svar)
- **AI-kompanjon (reflekterande svar)** – Regelbaserade svenska svar utifrån känsla + kort text (ingen OpenAI i barn-flödet).  
  `server/routes/listen.js` (generateReply, detectTheme)
- **TTS (uppläsning av AI-svar)** – Valbart ljud.  
  `src/utils/tts.ts`, anrop från JourneySimplePage
- **Dagbok (barn)** – Kalender, lista checkins per dag.  
  `src/pages/DiarySimple/DiarySimplePage.tsx`, `src/pages/Diary/ChildDiary.tsx`
- **Profil “Jag” (emoji-avatar)** – Välj emoji, sparas till backend.  
  `src/pages/AvatarSimple/AvatarSimplePage.tsx`, `src/components/EmojiPicker/EmojiPicker.tsx`, `server/routes/avatar.js`
- **Mina barn (förälder)** – Lista kopplade barn, aggregerad känslofördelning (stapeldiagram), åldersgrupp. Koppling via PIN/länkkod.  
  `src/pages/ParentChildren/ParentChildrenPage.tsx`, `server/routes/classroom.js` (GET `/api/parent/my-children`, GET `/api/parent/children/:childId/checkins` – används för aggregering i UI)
- **Klassstatistik / klassdagbok (lärare)** – Veckodata, sammanfattning (aggregerad).  
  `src/pages/ProSimple/ProSimplePage.tsx`, `src/pages/ProDiarySimple/ProDiarySimplePage.tsx`, `server/routes/analytics.js`
- **Offline-detektering och kö** – Banner när offline; barn-checkins köas i localStorage och synkas vid uppkoppling.  
  `src/components/OfflineBanner/OfflineBanner.tsx`, `src/utils/offlineQueue.ts`
- **Ljud och “lugn visning”** – Toggle ljud av/på, calm mode (mindre animationer).  
  `src/App.tsx` (AppControls), `src/utils/sound.ts`, localStorage `mgk-calm-mode`
- **Inställningar** – Ljud, lugn visning, ålder (barn), logga ut.  
  `src/pages/Settings/SettingsPage.tsx`
- **Åldersanpassning** – Konfiguration per åldersgrupp (4–5, 6–7, 8–10); sparas för barn.  
  `src/config/ageConfig.ts`, `src/context/AgeContext.tsx`, `server/routes/children.js` (GET/POST age)
- **Error Boundary** – Fångar kraschar, visar lugn felvy istället för vit skärm.  
  `src/components/ErrorBoundary/ErrorBoundary.tsx`
- **Diagnostik** – `/diag`, `/diagnostics` för status (DB, auth, env).  
  `src/pages/Diagnostics/StatusPage.tsx`, `src/pages/Diagnostics/DiagnosticsPage.tsx`
- **PWA** – Service Worker, manifest, installerbart.  
  `vite.config.ts` (VitePWA), `docs/PWA_TROUBLESHOOTING.md`
- **Build och server-kopiering** – `npm run build` bygger frontend och kopierar backend till `dist/server/`.  
  `package.json` (build, build:copy-server), `scripts/copy-server.js`

---

## D) Funktioner som finns men är MOCKADE / förenklade

- **AI-kompanjonens svar till barn** – Ingen riktig LLM. Statiska/regelbaserade svenska meningar utifrån känsla + nyckelord i texten (skola, kompisar, familj, rädd, etc.).  
  `server/routes/listen.js`: `generateReply()`, `detectTheme()` – ingen anrop till OpenAI här.
- **Analys-sammanfattning för vuxna** – Veckosammanfattning kan antingen vara regelbaserad (`gentleSummary()` i analytics.js) eller, om `OPENAI_API_KEY` sätts, genereras med OpenAI (gpt-4o-mini).  
  `server/routes/analytics.js`: OpenAI används alltså bara för vuxen-analys, inte för barn-svar.
- **Databas** – Om `MONGO_URL` saknas eller misslyckas används fil-DB (`server/mock-db.json`). Full CRUD finns för båda.  
  `server/lib/db.js`: `connectDB()`, `readFileDB()` / `writeFileDB()`.
- **Rate limiting** – In-memory (per IP för listen, per userId för analytics); återställs vid omstart.  
  `server/routes/listen.js`, `server/utils/ai-safety.js`
- **Lärare: org/klass-scope** – Tenant-modell (Org, Class, Student) finns i `server/data/adapter.js` och `server/models/tenant.js`, men den aktiva checkin-flödet använder `server/routes/checkins.js` (orgId/classId tom eller enkel). Så klass/org är delvis implementerat (classroom, PIN, QR).

---

## E) Funktioner som SAKNAS för att matcha målbilden

**Must-have för demo / nära målbild**

- **Röstinspelning** – Målbilden nämner ev. röst; i koden finns ingen röstinspelning eller voice-mode. Endast text + ritning.  
  README: "Voice input/recording is not implemented."
- **Förälder: tydlig “bara aggregerat”** – API:et exponerar råa checkins för föräldrar (`GET /api/parent/children/:childId/checkins`). Frontend visar i praktiken bara aggregerad statistik på “Mina barn” och ParentDiarySimplePage omdirigerar till “Mina barn”. Så UI matchar målbilden, men API:et läcker rådata om någon använder det direkt.
- **Pseudonymisering dokumenterad/tydlig** – Data lagras med `studentId` (ID), inte namn i varje checkin. Tydlig dokumentation eller policy om vad vuxna får se saknas i repot.

**Production**

- **E2E- och fler enhetstester** – Endast ett fåtal Jest-tester (EmotionPicker, EmptyState, config/apiFetch). Ingen E2E (t.ex. Playwright/Cypress).  
  `src/components/EmotionPicker/__tests__/`, `src/components/EmptyState/__tests__/`, `src/utils/__tests__/config.test.ts`
- **Persistent rate limiting** – T.ex. Redis eller DB-baserad så det överlever omstart.
- **Integritetspolicy / cookie-information** – Ingen sida eller komponent som informerar om cookies/lagring (README nämner att cookie-banner inte behövs om bara nödvändiga cookies).
- **Säkerhetsgranskning** – Ingen systematisk dokumentation av XSS/CSRF/injection; det finns sanering i listen (sanitizeNote) och ai-safety (analytics).

---

## F) Data / Integritet

- **Var lagras data?**  
  - **MongoDB:** barn (Kid), föräldrar (ParentUser), lärare (ProUser), checkins, avatar, mood, classes, pins m.m.  
  - **Fallback:** `server/mock-db.json` (samma struktur).  
  - **Klient:** localStorage (utkast, offline-kö, ljud/lugn-inställningar).  
  Filer: `server/lib/db.js`, `server/models/mongo.js`, `src/utils/localStore.ts`, `src/utils/offlineQueue.ts`.
- **Pseudonymisering?**  
  Checkins lagras med `studentId` (MongoDB ObjectId eller fil-DB id), inte barnets namn i varje rad. Namn finns på Kid-profilen. Så datamodellen är “ID-baserad”; ingen explicit pseudonymiseringslagik (t.ex. hashade ID:n) eller dokumentation.
- **Roller?**  
  Ja: `child`, `parent`, `pro`. Auth-middleware: `roleRequired('child'|'parent'|'pro')`.  
  `server/mw/auth.js`, `src/auth/AuthContext.tsx`.
- **Begränsningar i vuxenvy?**  
  - **Förälder:** Frontend visar bara aggregerad känslofördelning på “Mina barn”. ParentDiarySimplePage är byggd men omdirigerar föräldrar till “Mina barn”, så de ser inte individuell dagbok i UI.  
  - **Lärare:** Får aggregerad statistik per klass (analytics/weekly, analytics/summary); scope via orgId/classId.  
  Backend tillåter dock råa checkins för förälder via API; begränsningen är i första hand i frontend.

---

## G) Tillgänglighet / UX

**Vad som är gjort (kan verifieras i repot):**

- Skip to content: `src/components/SkipToContent/SkipToContent.tsx`
- Fokusfälla i modaler/drawers: `src/hooks/useFocusTrap.ts` (LoginModal, AppHeader drawer)
- ARIA: labels, roles, live regions, aria-pressed m.m. i bland annat EmotionPicker, JourneySimplePage, modaler
- Tangentbordsnavigering och fokus: stöd i flöden
- Reducerad rörelse: `prefers-reduced-motion` respekteras (t.ex. Framer Motion, dokumenterat i docs)
- Lugn UX: lugn färgpalett, begränsade animationer, calm mode
- Dokumentation: `docs/ACCESSIBILITY_IMPROVEMENTS.md`

**Vad som bör förbättras:**

- Systematisk a11y-audit (t.ex. axe-core) och testning med skärmläsare saknas i repot.
- En del sidor (t.ex. Journey Draw) har mycket interaktivt innehåll; fokusordning och rollelement kan behöva granskas.

---

## H) Testning

- **Finns tester?**  
  Ja, begränsat. Jest med jsdom:
  - `src/utils/__tests__/config.test.ts` (apiFetch, offline-detektering)
  - `src/components/EmotionPicker/__tests__/EmotionPicker.test.tsx`
  - `src/components/EmptyState/__tests__/EmptyState.test.tsx`  
  Kör: `npm test`. `jest.config.cjs` finns.
- **Rimliga minimaltester för prototypen:**  
  - Auth-flöde: inloggning med roll (child/parent/pro) och att hub visar rätt innehåll.  
  - Känsloresa: att ett checkin sparas (mockad API eller MSW) och att AI-svar kommer tillbaka.  
  - Offline: att kö skapas och att synk anropas när `navigator.onLine` blir true (mock).  
  - Enkel a11y: att SkipToContent och modaler har fokusfälla (t.ex. @testing-library/react + jest-axe om ni lägger till det).

---

## I) Deployment

- **Hur deployar jag?**  
  - `npm run build` → `dist/` (Vite) + `dist/server/` (kopierat från `server/`).  
  - Frontend: statiska filer (t.ex. Vercel/Netlify) med **SPA fallback**: alla routes ska peka på `index.html`. Vite PWA använder `navigateFallback: 'index.html'` i `vite.config.ts`, så det är redan hanterat för PWA. För vanlig webbhost måste servern konfigureras för SPA (t.ex. `try_files` eller rewrite till index.html).  
  - Backend: `cd dist/server && npm install --production` och starta med `node index.js`. PORT och .env (MONGO_URL, JWT_SECRET, ALLOWED_ORIGINS, ev. OPENAI_API_KEY) måste sättas.  
  Filer: `package.json` (build, build:copy-server), `docs/DEPLOYMENT.md`, `README.md` (MongoDB, .env).
- **Env-variabler:**  
  Servern förväntar sig t.ex. `.env` i projektrot eller `server/` eller `dist/server/`: MONGO_URL, MONGO_DB_NAME, JWT_SECRET, ALLOWED_ORIGINS; valfritt OPENAI_API_KEY, PORT, NODE_ENV. Frontend: VITE_API_URL för API-base.  
  `.env.example` nämns i server-startfel men finns inte i repot; exempel finns i README och docs/DEPLOYMENT.md.
- **Kända risker:**  
  - Om backend inte körs eller CORS/ALLOWED_ORIGINS är fel får frontend 401/network errors.  
  - SPA: vid direktlänk till t.ex. `/app/journey-simple` krävs att servern skickar index.html (Vercel/Netlify gör det ofta automatiskt; annars måste man konfigurera det).  
  - Fil-DB är inte lämplig för produktion (en server, ingen skalning).

---

## J) Förslag till rapporttext (kort, “jag har”-form)

Jag har byggt en webbaserad prototyp, MindGrow Kids, där barn kan välja känslor med emoji, skriva eller rita, och få reflekterande svenska svar från en regelbaserad kompanjon utan att använda riktig AI i barn-flödet. Jag har implementerat inloggning och registrering för barn, föräldrar och lärare med JWT i cookies, och en rollbaserad hub som leder barn till känsloresa, dagbok och profil. Jag har lagt in ritning med emojis och fritext/meningsbyggare beroende på ålder, sparande av checkins mot en Node/Express-backend med MongoDB eller filfallback, och offline-kö som synkar när användaren kommer tillbaka online. Jag har satt upp vuxenvyer så att föräldrar ser aggregerad känslostatistik för kopplade barn på sidan “Mina barn”, och lärare aggregerad klassstatistik, utan att exponera individuella inlägg i appens gränssnitt. Jag har använt React med TypeScript och Vite, Zustand och Context för state, Framer Motion för animationer, och tagit till åtgärder för tillgänglighet (skip to content, fokusfälla i modaler, ARIA, reducerad rörelse) och lugn UX. Jag har byggt och dokumenterat deployment med build som producerar en dist-mapp med både frontend och backend, och beskrivit miljövariabler och SPA-routing så att prototypen kan deployas till t.ex. en egen server eller statisk hosting plus separat API.

---

## K) Reflektionsunderlag (5–8 punkter)

- **Lärande:** Jag har sannolikt lärt mig att skilja på “AI i UI” (reflekterande svar) och “AI under huven” (regelbas vs LLM), och hur man håller barn-flödet enkelt och förutsägbart medan vuxenvyer kan använda rikare analys.
- **Lärande:** Jag har fått öva på rollbaserad åtkomst (child/parent/pro) både i backend (middleware) och frontend (villkorad rendering och omdirigering), och på att begränsa vad vuxna ser till aggregerat i UI trots att API:et tekniskt kan returnera mer.
- **Bra:** En tydlig separation mellan känsloresa (barn), dagbok, profil och vuxenvyer gör att prototypen är begriplig och demonstrerbar; Error Boundary och offline-hantering gör att appen känns robust även vid nätfel.
- **Bra:** Dokumentationen (README, DEPLOYMENT, ACCESSIBILITY_IMPROVEMENTS, m.fl.) gör det möjligt att återanvända och deploya utan att gissa.
- **Svårt:** Balans mellan “bara aggregerat” för vuxna i praktiken (UI) och vad API:et exponerar; samt att tydligt dokumentera integritet och pseudonymisering utan att överkomplicera prototypen.
- **Svårt:** Hook-ordning (React error #310) har begränsat användningen av vissa äldre/komplexa routes; jag har löst det med enklare, hook-säkra sidor (t.ex. SafeHubPage, JourneySimplePage) istället för att refaktorera allt.
- **Svårt:** Att få deployment att fungera överallt (SPA fallback, CORS, env för både frontend och backend) kräver att man tänker på både build-steg och serverkonfiguration.
- **Vad jag hade gjort annorlunda:** Tidigare prioriterat färre, men tydligt automatiserade tester (t.ex. ett auth-flöde och ett checkin-flöde) och en kort integritetstext så att “vad lagras och vem ser vad” är tydligt redan i prototypen.
