# Design Foundation – Hur vi använder den i bygget

Designen från **Min klass** (ProSimple) ska vara grunden för hela appen: grön gradient, glaskort (frosted), tydliga knappar och samma sidupplägg där det passar.

---

## 1. Designtokens (en källa)

Alla sidor ska använda **`src/styles/design-system.css`**.

### Gradient

- **Barn/vuxen/hub:** `--mg-bg-gradient-start` / `--mg-bg-gradient-end` (nuvarande gröna).
- **Lärarvy (pro):** `--mg-emerald-700` / `--mg-emerald-600` (något mörkare, mer “pro”).
- **Enhetlig variant:** Om ni vill ha samma känsla överallt, använd samma gradient (t.ex. bara `--mg-bg-gradient-*`) på alla inloggade sidor.

### Glass / frosted cards

- `--mg-glass-bg` – bakgrund för kort (t.ex. `rgba(255,255,255,0.2)`).
- `--mg-glass-border` – kant (t.ex. `rgba(255,255,255,0.15)`).
- `--mg-glass-blur` – blur (t.ex. `12px`).

Använd dessa för alla “kort” som ska flyta ovanpå gradienten (inga helvita admin-kort).

### Knappar & touch

- Primär: vit bakgrund, grön text, `--mg-button-height` / `--mg-button-height-small`.
- Sekundär: glas (glass-bg + glass-border), vit text.
- Ikonknappar (ghost): minst **44px** höjd/bredd, `aria-label` på alla.

---

## 2. Återanvändbara komponenter (extrahera från ProSimple)

För att designen ska bli konsekvent utan kopiering:

| Komponent | Syfte | Var den används idag |
|-----------|--------|------------------------|
| **PageShell** | Gradient-bakgrund + valfri sticky header + innehåll + valfri sticky bottenrad | ProSimple (redan byggt in); kan användas av ProDiary, ParentChildren, Settings, etc. |
| **AppBar** | Sticky header: tillbaka + pill/titel + höger-ikoner (ljud, meny). Samma blur/border som ProSimple. | ProSimple; kan ersätta/samordna med JourneyHeader där det passar. |
| **SoftCard** | Wrapper med glass-bg, glass-border, blur, radius. | ProSimple; alla sidor som visar “kort” ovanpå gradient. |
| **PrimaryButton / SecondaryButton** | Samma utseende som i Min klass (höjd, radius, fokus). | ProSimple; hub-knappar, formulär, sticky bar. |
| **GhostIconButton** | 44px, transparent, ikon, aria-label. | ProSimple (tillbaka, ljud, meny); JourneyHeader, AppHeader. |
| **Drawer** | Panel från höger, max-width, backdrop, stäng. | ProSimple (elev-drawer); kan användas för “detaljvy”, menyn i JourneyHeader, etc. |

**Förslag på struktur:**

```
src/components/
  PageShell/       # Gradient + optional header + main + optional sticky bar
  AppBar/           # Sticky header med tillbaka, pill/titel, ikoner
  SoftCard/         # Glass-kort (bara wrapper + className)
  Button/          # PrimaryButton, SecondaryButton (eller samlad Button variant="primary|secondary")
  GhostIconButton/  # Ikonknapp 44px
  Drawer/           # Höger-drawer med backdrop
```

Då kan t.ex. ProDiarySimple, ParentChildren och Settings bygga sin layout med `<PageShell>`, `<AppBar>` och `<SoftCard>` istället för egna klasser.

---

## 3. Sid-för-sid: var designgrunden ska användas

| Sida | Nuvarande | Föreslagen anpassning |
|------|-----------|------------------------|
| **Hub (SafeHub)** | UnifiedHubLayout, AppHeader, gradient, ButtonNavList | Behåll gradient; ev. göra actions till glass-kort (SoftCard) istället för enkla knappar. AppHeader kan få samma blur/border som AppBar. |
| **Min klass (ProSimple)** | Redan enligt designen | Referens; när PageShell/AppBar/SoftCard finns, refaktorera hit först. |
| **Klassens dagbok (ProDiarySimple)** | JourneyHeader, egen layout | Samma “pro”-känsla: samma gradient som Min klass, AppBar med “Lärarvy · Klassens dagbok”, innehåll i SoftCard, ev. sticky bar “Tillbaka till Min klass” + “Exportera”. |
| **Mina barn (ParentChildren)** | JourneyHeader, egen layout | Gradient (hub-grön eller samma som pro), header med samma blur som AppBar (ev. JourneyHeader med nya klasser), barn-lista i SoftCard. |
| **Barnflöden (JourneySimple, DiarySimple, AvatarSimple)** | JourneyHeader, egen gradient/kort | Samma gradient som hub; “creation hub” och dagbokskort som SoftCard; JourneyHeader visuellt samordnad med AppBar (samma höjd, blur, border). |
| **Inställningar (Settings)** | JourneyHeader, formulär | Samma gradient som hub; header som AppBar; inställningsgrupper i ett eller flera SoftCard. |
| **Länkkod (ChildLink)** | JourneyHeader | Som barnflödena: gradient + header i samma stil + innehåll i SoftCard. |
| **Login / Registrering** | Egen layout | Behåll enkel; kan använda samma gradient och ett enda glaskort för formuläret. |
| **Landning (Landing)** | Egen gradient + CTA | Kan ligga kvar som nu; eller använda samma gradient-tokens för visuell likhet. |

---

## 4. Teknisk ordning (rekommenderad)

1. **Utöka design-system.css**  
   Säkerställ att alla tokens (gradient, glass, knappar) finns och att ingen sida behöver lokala färg-/blur-värden.

2. **Extrahera SoftCard och Button**  
   Enkla wrappers/komponenter med befintliga ProSimple-klasser. Byt ProSimple till dessa komponenter så att all ny kod använder dem.

3. **Extrahera PageShell och AppBar**  
   ProSimple får använda `<PageShell>`, `<AppBar>` och samma gradient/header-logik. Då blir det lätt att återanvända på ProDiary, Settings, etc.

4. **Extrahera Drawer**  
   Generisk drawer med `open`, `onClose`, `children`; ProSimple använder den för elev-drawern.

5. **Samordna JourneyHeader med AppBar**  
   Antingen:  
   - JourneyHeader får samma CSS som AppBar (blur, border, höjd), eller  
   - Vissa sidor byter till AppBar med titel i pill (t.ex. “Barn · Hur mår jag idag?”) och samma höger-ikoner.

6. **Applicera sid-för-sid**  
   ProDiary → Min klass-look. Sedan ParentChildren, Settings, barnflöden (gradient + SoftCard), till sist hub (ev. glass på actions).

---

## 5. Kort checklista per ny sida

- [ ] Bakgrund: gradient från design-system (hub-grön eller emerald för pro).
- [ ] Inget “admin-vitt”: innehåll i SoftCard/glass, inte helvita sidor.
- [ ] Header: AppBar eller JourneyHeader med samma visuella stil (blur, border).
- [ ] Knappar: Primary/Secondary från design-system; ikonknappar minst 44px och `aria-label`.
- [ ] Responsivt: mobil staplat, desktop vid behov bredare (max-width från design-system).
- [ ] Sticky bar/footer: om ni har, ge content `padding-bottom` så att inget döljs.

Om ni följer denna grund blir resten av bygget visuellt och tekniskt konsekvent med Min klass-designen.
