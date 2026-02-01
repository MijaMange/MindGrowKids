# UX Redesign Plan - MindGrow Kids

## Prioriterad UX-plan

### Fase 1: Kritiska UX-fixar (Högsta prioritet)
1. **Landing page - Magisk djungel-intro** ⚡
   - SVG-baserade växter som växer in sakta
   - Enkel "Start"-knapp
   - Känsla av att "gå in i en värld"
   - **Impact**: Första intrycket, reducerar kognitiv belastning

2. **Header cleanup - Förenkla kontroller** ⚡
   - Max 1-2 små kontroller i child mode
   - Flytta resten till settings drawer
   - Tydlig roll-indikator
   - **Impact**: Reducerar visuell röra, tydligare roll-kontext

3. **Mode-separation - Tydlig roll-kontext** ⚡
   - Separata layouts för child/parent/pro
   - Olika navigation per roll
   - **Impact**: Reducerar förvirring, tydligare användarupplevelse

### Fase 2: Core flows (Hög prioritet)
4. **Emotion journey - Pedagogisk förenkling**
   - 3 steg istället för 4-5
   - En fråga per skärm
   - Stödjande språk, inga "varför"-frågor
   - **Impact**: Mindre kognitiv belastning, bättre completion rate

5. **Journal - Emotion-connection**
   - Timeline/calendar med emotion-färger per dag
   - Klickbar dag öppnar entry
   - Visuell koppling mellan känslor och tid
   - **Impact**: Bättre reflektion, tydligare mönster

6. **Dashboard - Reducera val**
   - Child: Max 3-4 huvud-actions
   - Adult: Overview-first, neutral ton
   - **Impact**: Mindre beslutsångest, tydligare väg framåt

### Fase 3: Polish (Medel prioritet)
7. **Avatar - Förenkling**
   - Presets + mood/expression
   - Inga avancerade customizations
   - **Impact**: Mindre distraktion, fokus på kärnfunktion

8. **Motion design - Calm & purposeful**
   - Långsamma, subtila animationer
   - Respektera prefers-reduced-motion
   - **Impact**: Känsla av lugn, professionell känsla

---

## Information Architecture

### Child Mode Navigation
```
Landing → Hub (val av roll) → Child Dashboard
  ├─ "Hur känner jag mig idag?" → Emotion Journey
  ├─ "Mina känslor" → Journal (timeline)
  └─ "Min avatar" → Simplified Avatar
```

**Child Dashboard Actions (max 4):**
1. "Hur känner jag mig idag?" → `/journey`
2. "Mina känslor" → `/diary`
3. "Min dagbok" → `/diary` (samma som ovan, kan konsolideras)
4. "Min avatar" → `/avatar` (förenklad)

### Parent Mode Navigation
```
Landing → Hub → Parent Dashboard
  ├─ Översikt (veckans känslor)
  ├─ Timeline (barnets känslor över tid)
  └─ Inställningar (PIN-länkning)
```

### Professional Mode Navigation
```
Landing → Hub → Professional Dashboard
  ├─ Klassöversikt (anonymiserad)
  ├─ Trender (aggregated)
  └─ Export/Inställningar
```

---

## Komponent-förslag

### Header (Child Mode)
```
[Logo] [Roll: Barn]                    [Avatar] [⚙️]
```
- Max 2 kontroller: Avatar + Settings
- Settings öppnar drawer med: Ljud, Calm mode, Logga ut

### Header (Adult Mode)
```
[Logo] [Roll: Förälder/Professionell]  [⚙️] [Logga ut]
```

### Emotion Journey Steps
**Steg 1:** "Hur känner din kropp sig just nu?"
- Stödjande text: "Ta en djup andetag och känn efter"
- 6 emotion-knappar (visuella, stora)

**Steg 2:** "Vilken känsla passar bäst?"
- Bekräfta val: "Du har valt: [Emotion]"
- Möjlighet att ändra

**Steg 3:** "Vill du berätta mer?" (valfritt)
- "Det är helt okej att hoppa över"
- Text/rita-options

### Journal Timeline
- Grid av dagar (senaste 14 dagar)
- Varje dag visar:
  - Datum
  - Primär emotion (färg + emoji)
  - Antal check-ins (om flera)
- Klick öppnar dagens entries
- Tydlig visuell hierarki

---

## Implementation Plan

### 1. Landing Page - Jungle Animation

**Komponent:** `LandingPage.tsx`
- SVG-baserade växter (leaves, vines)
- Framer Motion för slow growth
- Layered animation (olika delays)
- Respektera prefers-reduced-motion

**Implementation:**
```typescript
// SVG plant components
// Framer Motion med slow, subtle animations
// Background gradient (jungle green)
```

### 2. Header Cleanup

**Komponent:** `GameLayout.tsx` (refactor)
- Conditional rendering baserat på roll
- Settings drawer för extra kontroller
- Tydlig roll-indikator

**State:** `useAuth()` för roll

### 3. Mode Separation

**Komponenter:**
- `ChildDashboard.tsx` - Minimal, emotion-first
- `AdultDashboard.tsx` - Overview, neutral
- `ProfessionalDashboard.tsx` - Aggregated trends

**Routing:** Conditional rendering i `DashboardPage.tsx`

### 4. Emotion Journey

**Komponent:** `FeelingJourney.tsx` (refactor)
- 3 steg istället för 4-5
- En fråga per skärm
- Stödjande språk
- Optional step för elaboration

### 5. Journal Timeline

**Komponent:** `ChildDiary.tsx` (redesign)
- Timeline grid (14 dagar)
- Emotion-visualisering per dag
- Click to expand entry

### 6. Avatar Simplification

**Komponent:** `AvatarEditorPage.tsx` (simplify)
- Preset-avatars (3-5 st)
- Mood/expression selector
- Inga avancerade customizations

---

## Motion Design Guidelines

### Principles
1. **Slow & Subtle**: Animationer ska vara långsamma (0.6-1.2s)
2. **Purposeful**: Motion ska ha syfte (feedback, navigation)
3. **Respectful**: Respektera prefers-reduced-motion
4. **Layered**: Använd delays för depth-känsla

### Framer Motion Patterns
```typescript
// Slow fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.8 }}

// Gentle scale
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}

// Respect reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

---

## Nästa steg

1. ✅ Landing page med jungle-animation
2. ✅ Header cleanup
3. ✅ Mode separation
4. ✅ Emotion journey förenkling
5. ✅ Journal timeline
6. ⏳ Avatar förenkling
7. ⏳ Motion polish



