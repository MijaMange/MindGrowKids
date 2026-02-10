# MindGrow Kids - Projekt Sammanfattning

## 📋 Projektöversikt

**MindGrow Kids** är en känslobaserad app för barn (5-12 år) att uttrycka känslor på ett tryggt sätt. Appen hjälper barn att förstå, uttrycka och följa sina känslor över tid, samtidigt som vuxna (föräldrar och lärare) kan se mönster och stötta när det behövs.

**Målgrupp:**
- **Barn (child)**: 5-12 år, primär användare
- **Föräldrar (parent)**: Kan se sina barns känslor anonymiserat
- **Lärare (pro)**: Kan se klassens känslor anonymiserat

**GitHub Repo:** https://github.com/MijaMange/MindGrowKids.git

---

## 🛠 Teknisk Stack

### Frontend
- **Framework**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.3.1
- **Routing**: React Router DOM 6.26.0
- **State Management**: Zustand 4.5.5
- **Styling**: CSS Modules + Plain CSS med globalt design system
- **Animationer**: Framer Motion 12.23.26
- **Charts**: Chart.js 4.5.1 + React-Chartjs-2 5.3.1
- **Mobile**: Capacitor 8.0.0 (iOS/Android support)
- **PWA**: Vite Plugin PWA 1.2.0

### Backend
- **Runtime**: Node.js (Express 5.2.1)
- **Database**: 
  - MongoDB (Mongoose 9.0.1) - primär
  - File-based fallback (`server/mock-db.json`)
- **Authentication**: JWT (jsonwebtoken 9.0.3) + bcryptjs 3.0.3
- **AI**: OpenAI API 6.10.0 (för AI-svar på känslor)

### Övriga Bibliotek
- **Date handling**: date-fns 4.1.0
- **QR Codes**: qrcode 1.5.4
- **Drawing**: react-sketch-canvas 6.2.0
- **Audio**: howler 2.2.4
- **Rive animations**: @rive-app/react-canvas 4.25.0
- **Validation**: zod 4.1.13

---

## 🎨 Design System

### Globala CSS Variabler (`src/styles/design-system.css`)

**Färger:**
- Gradient bakgrund: `#1CBF82` → `#029E6E`
- Primär grön: `#12a15c` / `#12824b` (dark)
- Accent orange: `#F79500`
- Blå: `#1f6fff`
- Vit/Offwhite: `#ffffff` / `#f6fff8`

**Typografi:**
- Font: Quicksand (Google Fonts)
- Headline: 30px (desktop) / 26px (mobile)
- Supporting text: 16px (desktop) / 15px (mobile)
- Eyebrow label: 14px

**Layout:**
- Max content width: 560px
- Max text width: 420px
- Button height: 56px (standard) / 48px (small)
- Border radius: 999px (pill shape) / 18px / 24px

**Spacing:**
- Section gap: 24px / 32px (large)
- Card gap: 12px
- Page top padding: 72px (desktop) / 40px (mobile)

**Shadows:**
- Soft: `0 14px 30px rgba(0, 0, 0, 0.18)`
- Button hover: `0 16px 36px rgba(0, 0, 0, 0.22)`

---

## 📁 Filstruktur

### Frontend (`src/`)

**Pages:**
- `pages/Landing/LandingPage.tsx` - Landing page med hero section
- `pages/Login/LoginPage.tsx` - Login-sida
- `pages/Register/RegisterPage.tsx` - Registrering
- `pages/TestHub/TestHubPage.tsx` - Huvudhub för alla roller (används)
- `pages/SafeHub/SafeHubPage.tsx` - Alternativ hub (backup)
- `pages/JourneySimple/JourneySimplePage.tsx` - Känsloresa för barn
- `pages/DiarySimple/DiarySimplePage.tsx` - Dagbok för barn
- `pages/AvatarSimple/AvatarSimplePage.tsx` - Avatar-editor för barn
- `pages/ParentChildren/ParentChildrenPage.tsx` - Föräldrars översikt av barn
- `pages/ParentDiarySimple/ParentDiarySimplePage.tsx` - Föräldrars dagbok
- `pages/ProSimple/ProSimplePage.tsx` - Lärarstatistik
- `pages/ProDiarySimple/ProDiarySimplePage.tsx` - Lärardagbok
- `pages/Diagnostics/StatusPage.tsx` - Diagnostik-sida

**Komponenter:**
- `components/UnifiedHubLayout/` - Enhetlig layout för alla hubs
- `components/ButtonNavList/` - Återanvändbar lista med navigationsknappar
- `components/LogoutButton/` - Logout-knapp
- `components/Logo/` - LogoIcon, MindGrowLogo
- `components/layout/AppHeader.tsx` - Global header med hamburgermeny
- `components/LoginModal/` - Login-modal
- `components/Avatar/` - Avatar-editor komponenter
- `components/EmotionPicker/` - Känsloväljare
- `components/InputArea/` - Textinput för känslor
- `components/ListeningAIReply/` - AI-svar komponent
- `components/Stats/MoodMeters.tsx` - Humörstatistik
- `components/Settings/SettingsDrawer.tsx` - Inställningar

**State Management:**
- `state/useAvatarStore.ts` - Avatar state (Zustand)
- `state/useCheckinStore.ts` - Checkin state
- `state/useMoodStore.ts` - Humör state
- `state/useRoleStore.ts` - Roll state

**Auth:**
- `auth/AuthContext.tsx` - Auth context provider

**Utils:**
- `utils/config.ts` - API config och `apiFetch`
- `utils/http.ts` - HTTP helpers
- `utils/sound.ts` - Ljudhantering
- `utils/tts.ts` - Text-to-speech

### Backend (`server/`)

**Routes:**
- `routes/auth.js` - Authentication (login, register, logout)
- `routes/checkins.js` - Checkins för barn
- `routes/checkins-new.js` - Ny checkin API
- `routes/avatar.js` - Avatar-hantering
- `routes/classroom.js` - Klasshantering, QR-koder, PIN-länkning
- `routes/analytics.js` - Statistik och export (CSV)
- `routes/mood.js` - Humör-hantering

**Models:**
- `models/mongo.js` - Mongoose schemas (Kid, ParentUser, ProUser, Checkin, Class)
- `models/types.js` - TypeScript types
- `models/avatar.js` - Avatar model
- `models/mood.js` - Mood model

**Middleware:**
- `mw/auth.js` - JWT authentication middleware

**Utils:**
- `utils/jwt.js` - JWT creation/verification
- `lib/db.js` - Database adapter (MongoDB/file fallback)

**Scripts:**
- `scripts/seed.mjs` - Seed database med testanvändare
- `scripts/insert-direct.mjs` - Direkt insert till MongoDB

---

## 🔐 Authentication & Roller

### Roller
1. **child** - Barn (primär användare)
2. **parent** - Föräldrar
3. **pro** - Lärare/professionella

### Auth Flow
- **Login**: Email + lösenord för alla roller
- **JWT**: HttpOnly cookies för säkerhet
- **Session**: Hålls i `AuthContext` (React state)
- **Auto-redirect**: Om inloggad → `/hub`, annars → `/`

### API Endpoints (Auth)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrering
- `POST /api/auth/logout` - Logout

---

## 🗺 Routes & Navigation

### Public Routes
- `/` - Landing page
- `/login` - Login-sida
- `/register` - Registrering
- `/diag` - Diagnostik
- `/diagnostics` - Diagnostik (alternativ)

### Protected Routes (kräver inloggning)
- `/hub` - Huvudhub (rollbaserad dashboard)
- `/test-hub` - Alternativ hub
- `/app/journey-simple` - Känsloresa (barn)
- `/app/diary-simple` - Dagbok (barn)
- `/app/avatar-simple` - Avatar-editor (barn)
- `/app/parent-children` - Föräldrars översikt
- `/app/parent-diary-simple` - Föräldrars dagbok
- `/app/pro-simple` - Lärarstatistik
- `/app/pro-diary-simple` - Lärardagbok

### Navigation
- **Global Header**: Logo (vänster) + Hamburger-meny (höger)
- **Hamburger-meny**: Glider in från höger, innehåller rollbaserade länkar + logout
- **Hub Navigation**: Stora pill-formade knappar med ikoner

---

## 👤 Rollbaserad Funktionalitet

### Barn (child)
**Hub Actions:**
- 💬 "Hur känner jag mig idag?" → `/app/journey-simple` (primär, grön)
- 📅 "Mina dagar" → `/app/diary-simple` (neutral, vit)
- 🙂 "Jag" → `/app/avatar-simple` (accent, orange)

**Funktioner:**
- Känsloresa: Välj känsla → Rita → Skriv varför → AI-svar
- Dagbok: Se tidigare checkins, kalender-vy
- Avatar: Redigera avatar (kläder, färger, etc.)

### Föräldrar (parent)
**Hub Actions:**
- 👨‍👩‍👧 "Mina barn" → `/app/parent-children` (neutral, vit)
- 📘 "Dagbok" → `/app/parent-diary-simple` (blå)

**Funktioner:**
- Se kopplade barn (via PIN eller länkkod)
- Se barns checkins anonymiserat
- Statistik och mönster över tid
- CSV-export

**Länkning:**
- Barn genererar PIN eller permanent länkkod
- Förälder anger PIN/länkkod för att koppla barn

### Lärare (pro)
**Hub Actions:**
- 🏫 "Klassens statistik" → `/app/pro-simple` (neutral, vit)
- 📘 "Klassens dagbok" → `/app/pro-diary-simple` (blå)

**Funktioner:**
- Skapa klass med klasskod
- Generera QR-kod för klass
- Se alla elevers checkins anonymiserat
- Klassstatistik (veckovis, sammanfattning)
- CSV-export

**Klasshantering:**
- Skapa klass → Få klasskod → Generera QR-kod
- Elever ansluter via klasskod vid registrering

---

## 📊 Data Models

### MongoDB Collections

**Kids (barn)**
```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  name: String,
  classCode: String, // Kopplad till klass
  avatar: Object, // Avatar-data
  createdAt: Date
}
```

**Parents (föräldrar)**
```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  name: String,
  linkedChildren: [ObjectId], // Array av barn-IDs
  createdAt: Date
}
```

**Pros (lärare)**
```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  name: String,
  classCode: String, // Klass de skapade
  createdAt: Date
}
```

**Checkins (känslorapporter)**
```javascript
{
  _id: ObjectId,
  childId: ObjectId,
  emotion: String, // 'happy', 'calm', 'tired', 'sad', 'curious', 'angry'
  drawing: String, // Base64 eller URL
  text: String, // Barnets text
  aiReply: String, // AI-svar
  createdAt: Date,
  classCode: String // För klassfiltrering
}
```

**Classes (klasser)**
```javascript
{
  _id: ObjectId,
  code: String, // Unik klasskod
  proId: ObjectId, // Lärare som skapade
  createdAt: Date
}
```

### File-based Fallback
Om MongoDB inte är tillgänglig, används `server/mock-db.json` med samma struktur.

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/register` - Registrering (email, password, role, name, classCode?)
- `POST /api/auth/logout` - Logout

### Checkins
- `GET /api/checkins` - Hämta alla checkins för inloggad barn
- `POST /api/checkins` - Skapa ny checkin (barn)

### Avatar
- `GET /api/avatar/me` - Hämta min avatar (barn)
- `POST /api/avatar/me` - Uppdatera min avatar (barn)

### Classroom
- `POST /api/classes` - Skapa klass (pro)
- `GET /api/classes/:code/qrcode` - Hämta QR-kod för klass
- `GET /api/classes/:code/students` - Hämta elever i klass (pro)
- `GET /api/pro/my-class` - Hämta min klass och elever (pro)
- `GET /api/classes/:code/checkins` - Hämta alla checkins för klass (pro)

### Linking (Parent-Child)
- `GET /api/child/linkcode` - Hämta permanent länkkod (barn)
- `POST /api/pin/request` - Generera temporär PIN (barn)
- `POST /api/pin/link` - Länka barn via PIN/länkkod (parent)
- `GET /api/parent/my-children` - Hämta kopplade barn (parent)
- `GET /api/parent/children/:childId/checkins` - Hämta checkins för specifikt barn (parent)

### Analytics
- `GET /api/analytics/weekly?from&to` - Veckovis statistik (parent|pro)
- `GET /api/analytics/summary?from&to` - Sammanfattning (parent|pro)
- `GET /api/export.csv?from&to` - CSV-export (parent|pro)

### Mood
- `GET /api/mood/me` - Hämta humör (barn)
- `POST /api/mood/award` - Belöna humör (barn)

---

## 🎨 UI/UX Features

### Landing Page
- Hero section med gradient bakgrund
- Logo (MindGrow cubic icon + wordmark)
- Eyebrow label: "För skolor, lärare och vuxna runt barn"
- Headline: "Emotionell utveckling i skolan"
- Supporting text om MindGrow
- Primär CTA: "Börja här" (öppnar login-modal)
- Floating emojis (låg opacity, subtila)
- Blurred shape layers för djup

### Hub Pages (UnifiedHubLayout)
- Samma gradient bakgrund som landing
- Global header med logo + hamburger-meny
- Centrerad kolumn (max 560px)
- Rollbaserad titel + subtitel
- Stora pill-formade navigationsknappar
- Logout-knapp (ghost style)

### Känsloresa (JourneySimplePage)
- Steg 1: Välj känsla (EmotionPicker)
- Steg 2: Rita (react-sketch-canvas)
- Steg 3: Skriv varför (InputArea)
- Steg 4: AI-svar (ListeningAIReply)
- Progress dots
- Reward burst animation

### Dagbok (DiarySimplePage)
- Kalender-vy (react-calendar)
- Lista med tidigare checkins
- Filtrering per datum
- Visa känsla, text, AI-svar

### Avatar Editor (AvatarSimplePage)
- Canvas för avatar-visning
- Wardrobe panel (kläder, färger)
- Spara avatar till backend

### Responsive Design
- Mobile-first approach
- Breakpoint: 768px
- Centrerad layout på alla skärmar
- Touch-friendly knappar (min 48px höjd)

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus states
- Reduced motion support (`prefers-reduced-motion`)

---

## 🔧 Development Setup

### Installation
```bash
npm install
cd server && npm install
```

### Development
```bash
npm run dev  # Kör både frontend (Vite) och backend (Express) samtidigt
```

**Ports:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### Environment Variables
Skapa `.env` i `server/`:
```env
MONGO_URL=mongodb+srv://...
MONGO_DB_NAME=MindGrow
PORT=4000
JWT_SECRET=ditt-hemliga-secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4000
NODE_ENV=development
```

### Database Seeding
```bash
npm run seed  # Skapar testanvändare i MongoDB/file-DB
```

**Testanvändare:**
- `otto@test.se` / `test123` (barn)
- `mamma@test.se` / `test123` (förälder)
- `lisa@test.se` / `test123` (lärare)

### Build
```bash
npm run build  # Bygger frontend + kopierar server-filer till dist/
```

### PWA
```bash
npm run pwa:build  # Bygger PWA-version
```

### Mobile (Capacitor)
```bash
npm run build
npm run cap:copy
npm run cap:open:ios    # iOS
npm run cap:open:android # Android
```

---

## ✅ Implementerade Features

### ✅ Core Features
- [x] Authentication (login, register, logout)
- [x] Rollbaserad routing och navigation
- [x] Unified design system
- [x] Landing page med hero section
- [x] Hub pages för alla roller
- [x] Global header med hamburger-meny
- [x] Känsloresa för barn (emotion → draw → text → AI)
- [x] Dagbok för barn (kalender + checkins)
- [x] Avatar editor för barn
- [x] Föräldrars översikt (kopplade barn)
- [x] Föräldrars dagbok (barnens checkins)
- [x] Lärarstatistik (klassöversikt)
- [x] Lärardagbok (klassens checkins)
- [x] QR-kod generering för klasser
- [x] PIN/länkkod för parent-child linking
- [x] MongoDB integration med file-based fallback
- [x] JWT authentication med httpOnly cookies
- [x] Responsive design
- [x] PWA support
- [x] Capacitor (iOS/Android) setup

### ✅ Design & UX
- [x] Global design system (CSS variables)
- [x] Enhetlig färgpalett och typografi
- [x] Pill-formade knappar med shadows
- [x] Gradient bakgrund (grön)
- [x] Floating animations (reducerad motion support)
- [x] Hamburger-meny från höger
- [x] Logo med cubic icon + wordmark
- [x] Accessibility features

### ✅ Backend
- [x] Express server med CORS
- [x] MongoDB models (Kid, Parent, Pro, Checkin, Class)
- [x] File-based fallback database
- [x] JWT middleware
- [x] Role-based API endpoints
- [x] QR code generation
- [x] CSV export
- [x] Analytics endpoints

---

## ❌ Kända Begränsningar / Saknade Features

### ⚠️ Kända Issues
- **React Hook Order Error**: Vissa komplexa routes är kommenterade ut för att undvika React error #310 (hook ordering)
- **GameLayout**: Används inte längre, ersatt av UnifiedHubLayout
- **Old Routes**: `/app/*` routes med GameLayout är inaktiverade
- **Mood Store**: "Mitt humör" sektion borttagen från avatar-sidan (på begäran)

### 🔲 Potentiellt Saknade Features (baserat på typiska projektplaner)

#### Authentication & User Management
- [ ] Email verification
- [ ] Password reset
- [ ] Profile editing
- [ ] Account deletion
- [ ] Multi-factor authentication
- [ ] Social login (Google, etc.)

#### Child Features
- [ ] Streak tracking (dagar i rad)
- [ ] Badges/achievements
- [ ] Sound effects i känsloresa
- [ ] Voice input för text
- [ ] Export av egen dagbok (PDF)
- [ ] Delning av känslor (med föräldrar)

#### Parent Features
- [ ] Notifikationer när barn gör checkin
- [ ] Insights/rekommendationer baserat på mönster
- [ ] Chat/meddelanden till barn
- [ ] Tidsbegränsningar (screen time)
- [ ] Flera barn i samma vy (jämförelse)

#### Teacher Features
- [ ] Klassöversikt med heatmap
- [ ] Individuella elevprofiler (anonymiserat)
- [ ] Trendanalys över längre perioder
- [ ] Export av klassrapporter (PDF)
- [ ] Notifikationer för oroande mönster
- [ ] Flera klasser per lärare

#### Technical
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests (Playwright/Cypress)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics/Mixpanel)
- [ ] Performance monitoring
- [ ] Database migrations
- [ ] API versioning
- [ ] Rate limiting
- [ ] Input validation på alla endpoints
- [ ] Image upload/storage (för ritningar)
- [ ] CDN för statiska assets

#### Design & Polish
- [ ] Dark mode
- [ ] Språkstöd (i18n)
- [ ] Onboarding flow för nya användare
- [ ] Tooltips/help text
- [ ] Loading states för alla API-anrop
- [ ] Error boundaries
- [ ] Offline support (service worker)
- [ ] Push notifications

#### AI Features
- [ ] Anpassade AI-prompts per känsla
- [ ] AI-personlighet (rolig, allvarlig, etc.)
- [ ] AI-follow-up frågor
- [ ] Sentiment analysis
- [ ] Risk detection (självskada, etc.)

#### Admin Features
- [ ] Admin dashboard
- [ ] User management
- [ ] System settings
- [ ] Logs och monitoring
- [ ] Backup/restore

---

## 📝 Noteringar för Diskussion med ChatGPT

### Frågor att Ställa
1. **Vad saknas i förhållande till min projektplan?**
   - Jämför denna sammanfattning med din ursprungliga plan
   - Identifiera gaps i funktionalitet

2. **Vad är prioritet för nästa steg?**
   - Baserat på MVP vs. nice-to-have
   - Teknisk skuld vs. nya features

3. **Vad behöver förbättras?**
   - Code quality
   - Performance
   - Security
   - UX/UI

4. **Vad är bästa praxis för X?**
   - Testing strategy
   - Error handling
   - State management
   - API design

### Information att Inkludera i Diskussion
- **Projektmål**: Känslobaserad app för barn med vuxenöversikt
- **Teknisk stack**: React + TypeScript + Express + MongoDB
- **Nuvarande status**: Funktionell MVP med core features
- **Tidsram**: [DIN TIDSRAM]
- **Budget**: [DIN BUDGET]
- **Team**: [DIN TEAM-STORLEK]

### Exempel på Prompt till ChatGPT
```
Jag har ett projekt som heter MindGrow Kids - en känslobaserad app för barn. 
Här är en sammanfattning av projektet: [KOPIERA HELA DENNA FIL]

Min ursprungliga projektplan inkluderade:
- [LISTA DINA PLANERADE FEATURES]

Vad saknar jag i förhållande till min plan? 
Vad är prioritet för nästa steg?
Vad behöver förbättras tekniskt?
```

---

## 🔗 Viktiga Filer att Referera

- `README.md` - Projekt README med setup-instruktioner
- `src/styles/design-system.css` - Global design system
- `src/App.tsx` - Routing och app-struktur
- `server/index.js` - Backend server setup
- `server/routes/auth.js` - Authentication logic
- `src/pages/TestHub/TestHubPage.tsx` - Hub implementation
- `src/components/UnifiedHubLayout/` - Hub layout component

---

**Senast uppdaterad:** 2025-01-27
**Version:** 0.1.0 (MVP)
