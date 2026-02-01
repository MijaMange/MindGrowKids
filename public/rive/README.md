# Rive Animation File

## Fil som behövs

**Filnamn:** `jungle-guide.riv`

**Plats:** Denna mapp (`public/rive/`)

## Hur du skapar filen

### Steg 1: Öppna Rive Editor
1. Gå till [rive.app](https://rive.app)
2. Logga in eller skapa konto
3. Klicka på "New File" eller "Create"

### Steg 2: Skapa animationen
1. **Skapa en enkel "leaf buddy" eller "jungle guide":**
   - Ett vänligt blad eller en liten skogsvarelse
   - Enkel design som passar temat

2. **Skapa State Machine (rekommenderat):**
   - Klicka på "State Machine" i Rive Editor
   - Skapa en ny State Machine
   - Namnge den: `State Machine 1` (eller uppdatera `STATE_MACHINE_NAME` i `RiveGuide.tsx`)

3. **Lägg till Input:**
   - I State Machine, lägg till en Input
   - Typ: Boolean eller Number
   - Namn: `reactSignal` (eller uppdatera `INPUT_NAME` i `RiveGuide.tsx`)

4. **Skapa states:**
   - `idle`: Standardläge (t.ex. stilla eller lätt rörelse)
   - `hover`: När användaren hovrar (t.ex. leende eller vinkning)
   - `confirm`: När användaren klickar (t.ex. sparkle eller bekräftelse)

### Steg 3: Exportera
1. Klicka på "Export" eller "Download"
2. Välj format: `.riv`
3. Spara filen som: `jungle-guide.riv`
4. Kopiera filen till denna mapp: `public/rive/jungle-guide.riv`

### Steg 4: Verifiera
1. Starta dev server: `npm run dev`
2. Öppna: `http://localhost:5173/rive/jungle-guide.riv`
3. Filen bör laddas ner eller visas korrekt
4. Kolla konsolen för: `[RiveGuide] Rive file loaded successfully`

## Alternativ: Använd exempel från Rive Community

1. Gå till [Rive Community](https://rive.app/community)
2. Sök på "leaf", "plant", "nature", eller "friendly"
3. Hitta en animation som passar
4. Öppna i Rive Editor
5. Anpassa om nödvändigt
6. Exportera som `jungle-guide.riv`
7. Placera i denna mapp

## Design-tips

- **Storlek:** 200x200px viewport fungerar bra
- **Färger:** Använd gröna toner som matchar landing page
- **Rörelse:** Lugn och subtil (inte för snabb eller distraherande)
- **Uttryck:** Vänligt och inbjudande

## Om filen saknas

Om `jungle-guide.riv` inte finns kommer appen automatiskt att visa en SVG fallback (leaf buddy). Detta är helt okej och appen fungerar perfekt utan Rive-filen.

Rive-animationen är en **valfri premium-feature** som förbättrar upplevelsen men är inte nödvändig för appens funktionalitet.
