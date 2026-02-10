# 48h-demo hotfixes – leverans

## 1) Sammanfattning av ändrade filer

| Fil | Ändring |
|-----|---------|
| **src/components/JourneyHeader/JourneyHeader.tsx** | Ny prop `showStepCounter` (default true). När false visas aldrig "Steg X/Y". |
| **src/pages/JourneySimple/JourneySimplePage.tsx** | Header: `showStepCounter={false}`, titel "Hur mår du?" / "Rita eller skriv?" i stället för steg. Nästa-knapp steg 1: pill med text "Nästa" + pil. Alla `navigate('/test-hub')` → `navigate('/hub')`. |
| **src/App.tsx** | Route `/test-hub` → `<Navigate to="/hub" replace />`. |
| **src/pages/Journey/journey.css** | Mindre step-card (höjd/padding). Mindre creation-overlay. Nästa-knapp: fixed nedre höger, z-index 50, min 48px, safe-area, pill-variant med "Nästa". Media query för forward-btn uppdaterad. |
| **src/config/emotions.ts** | Glad 🙂, Ledsen 😢 (resten oförändrat). Trött 😴, Rädd 😨, Orolig 😟. Ingen "Lugn". |
| **src/pages/AvatarSimple/AvatarSimplePage.tsx** | `navigate('/hub')`. |
| **src/components/FloatingAvatarPreview/FloatingAvatarPreview.css** | Emoji min-height 3.5rem, clamp ned till 3.5rem. |
| **src/pages/Landing/LandingPage.css** | CTA: Logga in + Skapa konto samma höjd (--mg-button-height), samma radius (pill), enhetlig padding. Skol-abonnemang: subtil understruken länk under. |
| **src/pages/ParentChildren/ParentChildrenPage.css** | Knappar med --mg-button-height, --mg-radius, --mg-good. Primär knapp (parent-add-submit) grön, sekundär (parent-add-back) vit. Kort använder --mg-panel-radius, --mg-shadow-panel. |
| **src/components/JourneyDraw/JourneyDraw.css** | Container overflow hidden. Canvas-wrapper max-height min(55dvh, 420px), overflow hidden, knappar synliga. |
| **src/pages/Onboarding/AgeSelectionPage.tsx** | `navigate('/hub', …)`. |
| **src/pages/DiarySimple/DiarySimplePage.tsx** | `navigate('/hub')`. |
| **src/pages/ProSimple/ProSimplePage.tsx** | `navigate('/hub')` (2 st). |
| **src/pages/ParentChildren/ParentChildrenPage.tsx** | `navigate('/hub')`. |
| **src/pages/Settings/SettingsPage.tsx** | `navigate('/hub')`. |
| **src/pages/ChildLink/ChildLinkPage.tsx** | `navigate('/hub')` (2 st). |
| **src/pages/ProDiarySimple/ProDiarySimplePage.tsx** | `navigate('/hub')` (2 st). |
| **src/pages/ParentDiarySimple/ParentDiarySimplePage.tsx** | `<Navigate to="/hub" />`. |
| **src/pages/Login/LoginPage.tsx** | `nav('/hub')`, redirectPath `/hub`. |
| **src/components/RegisterModal/RegisterModal.tsx** | path `/hub` efter registrering. |

---

## 2) Vad som blev bättre (UX för barn 5–12)

- **Ingen "Steg 1/2"** – Barn ser korta rubriker ("Hur mår du?", "Rita eller skriv?") i stället för stegräknare. Mindre B2B-känsla.
- **Enhetlig hub-URL** – Alla hamnar på `/hub` efter inloggning. Ordet "test" syns inte i URL eller flöde.
- **Mindre vita paneler** – Rita/Skriv-korten är mindre och luftigare; grön bakgrund syns mer. Ingen onödig scroll i skapandet.
- **Nästa alltid nedre höger** – Pilen är fixed, tydlig ("Nästa" + pil på steg 1, samma på tack-skärmen), min 48px touch, safe-area, z-index 50.
- **Känslor tydliga** – 6 val, Glad/Ledsen/Arg/Trött 😴/Rädd/Orolig. Ingen "Lugn". Emojis förklarar utan att läsa.
- **Avatar** – Emoji-grid synligt, förhandsvisning stor (min 3.5rem), inga accessories.
- **Landing CTA** – Logga in och Skapa konto samma rad, samma höjd och rundning. Skol-abonnemang subtil under.
- **Föräldravy** – Knappar och kort följer designsystemet (grönt, rundningar, höjd).
- **Ritytan** – Canvas klipps inte, ingen scroll; wrapper max-height; Clear- och Forward-knappar synliga.

---

## 3) Manuell test-checklista

### Inloggning och hub
- [ ] Gå till `/` (landing). Klicka **Logga in** → modal öppnas. Logga in (barn) → omdirigering till **/hub** (inte /test-hub).
- [ ] På hubben: tre val synliga (Hur mår jag idag?, Mina dagar, Jag). Ingen "test"-text. Om ålder saknas: åldersval på hubben.

### Känsloresa
- [ ] Klicka **Hur mår jag idag?** → känslosida. Header visar **"Hur mår du?"** (inte "Steg 1/2").
- [ ] Välj en känsla (t.ex. Glad 🙂). **Nästa-knappen** syns nedre höger med text **"Nästa"** + pil. Klicka **Nästa**.
- [ ] Nästa sida: tre val (Rita, Skriv, Klart). Header visar **"Rita eller skriv?"** (inte "Steg 2/2").
- [ ] Klicka **Rita** → rityta öppnas. Ingen oönskad scroll; canvas och knappar (Rensa, Nästa-pil) synliga. Rita något → **Nästa** (nedre höger) → "Sparat"-känsla → **post-draw** med valen "Rita mer", "Skriv något", "Klar". Klicka **Klar** → tack-skärm.
- [ ] På tack-skärmen: centrerat kort "Tack för att du delade med dig! 💚", **Nästa** nedre höger (pill med "Nästa" + pil). Klicka **Nästa** → tillbaka till **/hub**.

### Skriv
- [ ] Känsloresa → välj känsla → Nästa → **Skriv**. Fri text synlig direkt med penna-ikon (✏️), ingen dold "skriv själv"-knapp. Skriv något → **Klar** (i meningsbyggaren eller hubben) → tillbaka till val.

### Avatar (Jag)
- [ ] Hubben → **Jag**. Stor emoji-förhandsvisning uppe, **emoji-grid** i botten (alla val synliga). Klicka en emoji → preview uppdateras direkt, valet känns stabilt (inte miniliten).

### Landing
- [ ] Utloggad: **Logga in** och **Skapa konto** i samma rad, samma höjd och rundning. **Abonnemang för skolor och verksamheter** under, mer subtil (understruken text).

### Föräldravyn
- [ ] Logga in som förälder → **Mina barn**. Knappar och kort ser ut att höra till samma produkt (grönt, rundningar, samma designsystem som barn-vy).

---

*Hotfixes genomförda enligt audit; designsystem och visuellt språk oförändrat.*
