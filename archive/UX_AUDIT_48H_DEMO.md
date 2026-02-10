# MindGrow Kids – UX/UI-audit & 48h-demo-plan

**Syfte:** Scanna repo, lista problem och ge prioriterade förbättringsförslag (48h hotfixes → 1–2 veckor → framtid).  
**Mål:** Barn 5–12 med minimal läsning; tryggt, lugnt flöde; inga "test"-ord i barnvy; designsystem konsekvent.

---

## 1) REPO-KARTA

### Sidor / routes (aktiva)

| Route | Sida | Användning |
|-------|------|------------|
| `/` | LandingPage | Landing, "För skolor och verksamheter", CTA Logga in + Skapa konto |
| `/login` | LoginPage | Inloggning (redirect till /test-hub) |
| `/register` | RegisterPage | Registrering (redirect till /test-hub) |
| `/hub` | SafeHubPage | Hub efter inloggning (vuxen redirect hit) |
| `/test-hub` | TestHubPage | **Barnens hub** – tre val: Känsla, Mina dagar, Jag (+ åldersval inline) |
| `/app/journey-simple` | JourneySimplePage | **Känsloresa:** steg 1 känsla → steg 2 Rita/Skriv/Klar → tack-skärm |
| `/app/diary-simple` | DiarySimplePage | **Mina dagar** – dagbok med checkins/teckningar |
| `/app/avatar-simple` | AvatarSimplePage | **Jag** – emoji-val för profil |
| `/app/child-link` | ChildLinkPage | Länkkod (barn kopplar till förälder) |
| `/app/settings` | SettingsPage | Inställningar |
| `/app/onboarding/age` | AgeSelectionPage | Åldersval (separat sida; används sällan – ålder väljs på hubben) |
| `/app/parent-children` | ParentChildrenPage | Föräldravy – Mina barn, länka barn, statistik |
| `/app/parent-diary-simple` | ParentDiarySimplePage | Föräldra-dagbok (barnets checkins) |
| `/app/pro-simple` | ProSimplePage | Lärarvy – Klassens statistik |
| `/app/pro-diary-simple` | ProDiarySimplePage | Lärar-dagbok |
| `/diag`, `/diagnostics` | StatusPage, DiagnosticsPage | Teknisk status |
| `/mobile` | MobilePreview | Mobil-förhandsgranskning |

**OBS:** Barnflödet använder **/test-hub** överallt (JourneySimple, AvatarSimple, DiarySimple, Settings, ChildLink, Register, Login). Landing redirectar till **/hub**; då hamnar barn på SafeHubPage (samma layout som TestHubPage). Båda hub-routes finns – namnet "test-hub" ska inte synas i UI.

---

### Centrala komponenter (filvägar)

| Ansvar | Komponent | Fil |
|--------|-----------|-----|
| **Header / nav (resor)** | JourneyHeader | `src/components/JourneyHeader/JourneyHeader.tsx` |
| **Steg-indikator** | JourneyHeader (currentStep, totalSteps) | Samma – visar "Steg 1/2" i centrum |
| **Hub-layout** | UnifiedHubLayout | `src/components/UnifiedHubLayout/UnifiedHubLayout.tsx` |
| **Hub-actions (barn)** | ChildHubActions | `src/components/ChildHubActions/ChildHubActions.tsx` |
| **App-header (hub)** | AppHeader | `src/components/layout/AppHeader.tsx` |
| **Nästa/Fortsätt-knapp** | journey-forward-btn, journey-thank-you-next | `src/pages/Journey/journey.css` + JourneySimplePage (inline) |
| **Kort/paneler** | StepCard | JourneySimplePage (lokalt), FeelingJourney | `step-card` i `src/pages/Journey/journey.css` |
| **Modaler** | LoginModal, RegisterModal | `src/components/LoginModal/`, `RegisterModal/` |
| **Abonnemang (skolor)** | Inline i LandingPage | `src/pages/Landing/LandingPage.tsx` (landing-school-modal-*) |
| **Skola krävs** | SchoolSubscriptionRequiredModal | `src/components/SchoolSubscriptionRequiredModal/` |
| **Ritning (canvas)** | JourneyDraw | `src/components/JourneyDraw/JourneyDraw.tsx` + `.css` |
| **Meningsbyggare + fri text** | SentenceBuilder | `src/components/SentenceBuilder/SentenceBuilder.tsx` |
| **Slot-val** | SlotPicker | `src/components/SentenceBuilder/SlotPicker.tsx` |
| **Emoji-profil (avatar)** | EmojiPicker, FloatingAvatarPreview | `src/components/EmojiPicker/`, `FloatingAvatarPreview/` |
| **Ålder på hubben** | AgeSelectionBlock | `src/components/AgeSelectionBlock/AgeSelectionBlock.tsx` |
| **Tomt tillstånd** | EmptyState | `src/components/EmptyState/EmptyState.tsx` |
| **Designsystem** | CSS-variabler | `src/styles/design-system.css` |

---

### Vilka styr vad (snabbreferens)

- **Header/nav (barnresor):** JourneyHeader (tillbaka, "Steg X/Y" eller titel, hamburger med Översikt/Mina dagar/Jag/Inställningar m.m.)
- **Knappar Nästa/Fortsätt:** JourneySimplePage (journey-forward-btn, journey-thank-you-next), SentenceBuilder (journey-forward-btn-klass)
- **Cards/Modals:** StepCard + journey.css (.step-card), Landing (landing-school-modal), LoginModal, RegisterModal
- **Canvas/ritning:** JourneyDraw (react-sketch-canvas, emoji-stickers, Finish/Clear)
- **Textinmatning:** SentenceBuilder (slot1/slot2 + fritext), JourneySimplePage (free-writing-textarea för 8–10 år)

---

## 2) KONKRETA UX-PROBLEM

### Navigation och "test"-känsla

- **"Steg 1/2" i header** – Känsloresan visar "Steg 1/2" / "Steg 2/2" i JourneyHeader. Känns B2B/test; barn behöver inte stegräknare.
- **test-hub i URL** – Barn får `/test-hub` överallt. Ordet "test" ska inte synas; använd en barnvänlig URL (t.ex. `/app` eller `/start`).
- **Hub-namn i kod** – Klasser som `.test-hub-container`, `.test-hub-greeting` finns i TestHubPage.css; påverkar inte barn direkt men bidrar till förvirring.

### Vita paneler och tyngd

- **Stora step-card** – Rita/Skriv/Post-draw använder StepCard: stor vit panel (min 600–700px höjd, 92vw). Känns "måste göra allt" och tung.
- **Creation-overlay** – Rita/Skriv ligger i creation-overlay inuti step-card; dubbel panel-känsla.
- **Tack-skärm** – Redan omarbetad till centrerat kort + grön bakgrund; OK. Kontrollera att inga andra stora vita ytor återinförs.

### Känsloval

- **Antal val** – 6 känslor (Glad, Ledsen, Arg, Trött, Rädd, Orolig) är redan barnanpassade. Config: `src/config/emotions.ts`.
- **"Lugn"** – Finns inte i BASE_EMOTIONS (kommenterat bort). OK.
- **Rädd/Orolig** – Redan två separata (Rädd 😨, Orolig 😟). Om du vill slå ihop till en "rädd eller orolig" kan det göras i config + UI; annars behåll två.
- **Trött** – Har redan 😴 (zzz). OK.
- **Klump i magen** – Finns inte som egen känsla. Kan läggas som synonym till "Orolig" eller egen rad i emotions (t.ex. `stomach: 'Klump i magen', emoji: '🤢'`) om du vill.

### Rita / Skriv / Klar

- **Layout** – Idag: steg 2 = creation-hub med tre kort (Rita, Skriv, Klart). Efter Rita → StepCard med canvas; efter Skriv → StepCard med SentenceBuilder/fritext. Efter Rita → "post-draw" med "Rita mer / Skriv något / Klart". Flödet är redan "Rita / Skriv / Klar" med tillbaka till val.
- **"Kastas ut"** – Efter ritning går barnet till post-draw (Rita mer, Skriv något, Klart), inte direkt till tack. OK. Efter skriv går de tillbaka till hub (step2Mode = 'hub'). Kontrollera att barn alltid ser "tillbaka till val" tydligt (tillbaka-pil i overlay).
- **Samma layout** – Rita och Skriv använder båda StepCard + creation-overlay; visuellt lika. För 48h: behåll struktur, sänk panel-storlek/dominans (se förslag A).

### Ritytan

- **Klipp/scroll** – JourneyDraw är inuti creation-overlay och step-card. Risk för overflow/scroll på små skärmar. Säkerställ: canvas-wrapper med max-height: min(60vh, 400px) och overflow hidden, ingen scroll på själva canvas.
- **Tydlighet** – Stora knappar Finish/Clear och emoji-stickers finns. För 48h: kontrollera touch-targets (min 44px) och att canvas inte krymper för mycket.

### Avatar (emoji)

- **Endast emoji** – AvatarSimplePage använder EmojiPicker + FloatingAvatarPreview; inga accessories. OK.
- **Val synliga** – EmojiPicker är en grid i botten (fixed tray); valen är alltid synliga. Tidigare fix: tray utanför main, z-index 50. Verifiera att valen är klickbara.
- **Miniliten** – FloatingAvatarPreview har clamp(4rem, 10vw, 6rem) för emoji; size prop min 120. OK om det inte krymper på mobil.

### Meningsbyggare och fri text

- **Struktur** – SentenceBuilder: "Jag känner mig [___] [___]" + fritext med "Vill du skriva något mer?" och penna-ikon (✏️). Redan tydlig "penna"-känsla.
- **För 48h** – Eventuellt tydligare "penna"-ikon bredvid fritext-rubrik (nu ✏️ i label).

### Landing och CTA

- **Skapa konto bredvid Logga in** – Redan i samma rad (landing-cta-row). OK.
- **Skola/verksamhet** – Separat knapp "Abonnemang för skolor och verksamheter" som öppnar modal. Privatpersoner: Logga in + Skapa konto. OK.
- **CTA enhetlig** – Samma stil för primär (Logga in) och sekundär (Skapa konto); skol-knappen textlänk-stil. För 48h: enhetlig border-radius och höjd (designsystem).

### Abonnemang (skolor)

- **Textmängd** – Modal har kort titel, "Välj plan", två kort (Klass / Verksamhet) med pris och punkter. Redan ganska kort.
- **Planer** – Klass (enskild lärare) vs Verksamhet (skola); logiskt. "Din skola använder MindGrow" vid school_linked. OK.
- **Kringgå skollicens** – Ingen tekniskt kringgående i UI; skol-länk döljer enskild klass. För framtid: domän/pilot-begränsning i backend.

### Föräldravyn

- **Designsystem** – ParentChildrenPage använder JourneyHeader, journey.css, ParentChildrenPage.css. Knappar och kort bör använda samma --mg-* variabler (grönt, rundningar, höjd). Granska att primära knappar har samma höjd och radius som barn-vy.

---

## 3) FÖRBÄTTRINGSFÖRslag (A / B / C)

### A) 48h DEMO HOTFIXES (snabba vinster)

| # | Åtgärd | Filer | Implementation | Design |
|---|--------|-------|----------------|--------|
| A1 | Ta bort eller dämpa "Steg 1/2" i barnresor | `JourneyHeader.tsx`, `JourneySimplePage.tsx` | I JourneyHeader: om `currentStep/totalSteps` sätts, visa istället kort titel ("Hur mår du?" steg 1, "Vill du rita eller skriva?" steg 2) ELLER dölj helt (rendera bara tillbaka + meny). I JourneySimplePage: skicka inte currentStep/totalSteps till JourneyHeader, eller skicka title istället. | Ingen stegräknare synlig; max en rad text i headern. |
| A2 | Enhetlig hub-URL för barn (dölj "test") | `App.tsx`, `LandingPage.tsx`, alla som navigerar till /test-hub | Redirect /test-hub → /hub för barn (eller gör /hub barnens hub). Alternativt: behåll /test-hub men byt i UI alla "test-hub" till "hub" (samma route /hub, en komponent). Enklast: använd /hub för alla som inloggade; SafeHubPage och TestHubPage är nästan identiska – slå ihop till en route /hub som använder samma logik som TestHubPage. | Barn ser aldrig "test" i URL eller texter. |
| A3 | Minska vita panelens dominans (Rita/Skriv) | `journey.css` | .step-card: sänk max height (t.ex. min(500px, 55dvh) i stället för 700px). .creation-overlay: mer transparent bakgrund eller mindre panel (max-width 90vw, mindre padding). Alternativt: ta bort step-card wrapper i rit/skriv och låt creation-overlay vara en "flytande" panel (mindre, centrerad) med rundade hörn. | Mindre vit yta; grön gradient syns mer. Behåll tillgänglig kontrast (text på ljus/grön). |
| A4 | Nästa-pil alltid nedre höger + tydlig | `JourneySimplePage.tsx`, `journey.css` | Kontrollera att journey-forward-btn och journey-thank-you-next är position: fixed; bottom/right; z-index tillräcklig. Lägg till aria-label "Nästa" överallt. Om någon pil saknar text "Nästa", lägg till span (redan på tack-skärmen). | Min 48px touch target; stark kontrast (grön knapp, vit ikon). |
| A5 | Trött med zzz, känslor tydliga | `emotions.ts` | Trött har redan 😴. Kontrollera att alla 6 etiketter är korta och tydliga (Glad, Ledsen, Arg, Trött, Rädd, Orolig). Eventuellt lägg till "Klump i magen" som alias för Orolig i LEGACY_LABELS om ni visar det i dagbok. | Emoji stor nog (min 2.5rem); kort label under. |
| A6 | Avatar: verifiera emoji-val klickbara | `AvatarSimplePage.tsx`, `EmojiPicker.css` | Redan fix: tray utanför main, z-index 50, pointer-events auto. Snabb test: klicka på emoji → profil ska uppdateras. Om något fortfarande blockerar: öka z-index eller ta bort overflow hidden på förälder. | Tray min-height 180px; emoji-knappar min 44px. |
| A7 | Landing CTA enhetlig | `LandingPage.css`, `design-system.css` | .landing-btn-primary och .landing-cta-register: samma height (--mg-button-height 56px), samma border-radius (--mg-radius eller pill). Skol-länk: behåll som textlänk men samma färg (--mg-primary). | En rad, två knappar samma höjd; skol-länk under. |
| A8 | Föräldravy knappar i designsystem | `ParentChildrenPage.css`, ev. `ParentChildrenPage.tsx` | Använd --mg-button-height, --mg-radius, --mg-primary för primära knappar. Ersätt hårdkodade färger med var(--mg-primary). | Samma rundningar och grönt som barn-vy. |

---

### B) 1–2 VECKOR (struktur / komponentisering)

| # | Åtgärd | Filer | Implementation | Design |
|---|--------|-------|----------------|--------|
| B1 | En gemensam "hub" för barn | `App.tsx`, `TestHubPage.tsx`, `SafeHubPage.tsx` | En route /hub som renderar barn-vy (ålder + tre val) för child, föräldrar-vy för parent, pro-vy för pro. Ta bort /test-hub eller gör den alias till /hub. Uppdatera alla navigate('/test-hub') till navigate('/hub'). | En URL för "hem" efter inloggning. |
| B2 | Komponent: CreationStepCard | Ny: `components/CreationStepCard/` | Extrahera Rita/Skriv/Post-draw wrappers till en CreationStepCard som tar emot children och optional onBack. Använd i JourneySimplePage. Enhetlig padding och max-width. | Mindre step-card, återanvändbar. |
| B3 | Komponent: NextButton | Ny: `components/NextButton/NextButton.tsx` | En knapp "Nästa" med pil, fixed bottom-right, samma styling som journey-thank-you-next. Använd i JourneySimplePage (steg 1, steg 2 hub) och SentenceBuilder. | En plats för z-index, safe-area, aria-label. |
| B4 | Ritytan: ingen scroll, fast höjd | `JourneyDraw.css`, `JourneyDraw.tsx` | .journey-draw-wrapper: max-height: min(55dvh, 420px); overflow: hidden; canvas responsiv men inte större än wrapper. Säkerställ att Finish/Clear alltid syns under canvas. | Canvas fyller utan att klippa; knappar under. |
| B5 | Meningsbyggare: tydlig "penna" för fri text | `SentenceBuilder.tsx`, `SentenceBuilder.css` | Lägg till en tydlig ikon (✏️ eller SVG penna) bredvid rubriken "Vill du skriva något mer?" och ev. placeholder "Skriv här...". | En rad med ikon + text; textarea under. |
| B6 | Abonnemang: kortare texter, tydliga planer | `LandingPage.tsx` (school modal) | Förenkla listpunkter till 3–4 korta. "Klass" = "En lärare, en klass". "Verksamhet" = "Hela skolan". Behåll pris och en CTA per kort. | Samma kort-storlek; mindre brödtext. |
| B7 | Föräldravy: en sida med design-tokens | `ParentChildrenPage.tsx`, `ParentChildrenPage.css` | By ersätta alla lokala färger med var(--mg-*). Använd samma knappkomponent eller klasser som barn-vy där det passar. | Fullt konsekvent med design-system. |

---

### C) FRAMTID (nice-to-have, polish)

| # | Åtgärd | Filer | Implementation | Design |
|---|--------|-------|----------------|--------|
| C1 | Animationer på känsloval och tack | `JourneySimplePage.tsx`, `journey.css` | Redan delvis (Framer Motion). Lägg till subtila micro-animationer vid val (scale/glow) och vid "Klart"-klick (whoosh). Respektera prefers-reduced-motion. | Korta (0.2–0.4s), inte distraherande. |
| C2 | Emoji-stickers i ritning som "Mina teckningar" | `JourneyDraw.tsx`, dagbok-API | Stickers sparas redan i canvas-export. För "Mina teckningar": visa sparade teckningar i DiarySimplePage under en sektion "Mina teckningar" (redan checkins med mode draw). | Grid med miniatyrer; klick öppnar större vy. |
| C3 | Gamification (enkel) | Ny modul | T.ex. enkel "växt" eller stjärnor efter varje checkin (ingen poängräkning, bara visuell belöning). Kräver ny komponent och state. | Mycket enkelt; ingen press. |
| C4 | Pilot/klasslicens med begränsning | Backend + ev. ProSimplePage | Begränsa antal elever per klass eller kräv domän för skolregistrering. UI: info-text i abonnemang-modal. | Tydlig text "Max X elever" eller "Skol-e-post krävs". |

---

## 4) PRIORITERAD ÅTGÄRDSLISTA (ordning för demo)

Följ ordning om du bara hinner en del; 1–4 ger störst effekt för barnflödet.

1. **Barnflöde (känsla → uttryck → sparas → feedback → klart)**  
   - [ ] A4 Nästa-pil alltid nedre höger och tydlig (fixed, z-index, "Nästa").  
   - [ ] A3 Minska vita panelen på Rita/Skriv (mindre step-card/overlay).  
   - [ ] Verifiera att flödet Rita → post-draw → Klart / Skriv → hub → Klart är tydligt och att barn inte "kastas ut".

2. **Navigation (nästa/back, header)**  
   - [ ] A1 Ta bort eller ersätt "Steg 1/2" i header (titlar eller dold stegräknare).  
   - [ ] A2 Enhetlig hub-URL – använd /hub för barn (slå ihop test-hub och hub eller redirect).

3. **Ritning + sparande**  
   - [ ] Kontrollera att canvas inte klipps eller skapar scroll (A3/B4).  
   - [ ] Stora touch-targets för Finish/Clear och emoji-stickers (min 44px).  
   - [ ] Bekräftelse efter spara (t.ex. kort "Sparat!" eller befintlig post-draw-skärm).

4. **Avatar (emoji-only)**  
   - [ ] A6 Verifiera att emoji-valen är klickbara och att förhandsvisningen inte är miniliten.  
   - [ ] Behåll endast emoji-grid utan kategorier/knappar.

5. **Landing + CTA + abonnemang**  
   - [ ] A7 Landing: Logga in + Skapa konto samma rad, enhetlig höjd och rundning.  
   - [ ] Abonnemang-modal: kort texter (B6); inga "test"-ord.

6. **Föräldravyn**  
   - [ ] A8 Föräldraknappar och kort använder designsystem (--mg-*).  
   - [ ] B7 Ersätt övriga hårdkodade färger med tokens.

---

## Snabbreferens – filer att öppna för 48h

- **Header/steg:** `src/components/JourneyHeader/JourneyHeader.tsx`  
- **Nästa-knappar:** `src/pages/JourneySimple/JourneySimplePage.tsx`, `src/pages/Journey/journey.css`  
- **Vita paneler:** `src/pages/Journey/journey.css` (.step-card, .creation-overlay)  
- **Hub-URL:** `src/App.tsx`, `src/pages/Landing/LandingPage.tsx`, alla `navigate('/test-hub')` → `navigate('/hub')`  
- **Känslor:** `src/config/emotions.ts`  
- **Avatar:** `src/pages/AvatarSimple/AvatarSimplePage.tsx`, `src/components/EmojiPicker/EmojiPicker.css`  
- **Landing CTA:** `src/pages/Landing/LandingPage.tsx` + `.css`  
- **Föräldrar:** `src/pages/ParentChildren/ParentChildrenPage.tsx` + `.css`  
- **Designsystem:** `src/styles/design-system.css`

---

*Document generated for MindGrow Kids 48h demo. Focus: barnflöde, navigation, mindre vita paneler, inga "test"-ord, konsekvent designsystem.*
