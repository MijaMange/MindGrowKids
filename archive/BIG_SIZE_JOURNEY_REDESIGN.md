# Big Size Journey Redesign - Non-Reading UX

**Date:** 2025-01-27  
**Goal:** Make everything BIG - icons, text, buttons - usable without reading  
**Target:** Children 5-12 (many can't read well, must work from arm's length on tablet)

---

## Files Changed

### Created:
1. `src/components/JourneyDraw/JourneyDraw.tsx` - Large drawing canvas component
2. `src/components/JourneyDraw/JourneyDraw.css` - Drawing styles
3. `src/components/JourneyWrite/JourneyWrite.tsx` - Large text area component
4. `src/components/JourneyWrite/JourneyWrite.css` - Writing styles

### Modified:
1. `src/pages/JourneySimple/JourneySimplePage.tsx` - Mode-based step 2, larger sizes
2. `src/pages/Journey/journey.css` - Increased all sizes significantly

---

## Key Changes

### 1. SIZE INCREASES (Non-Negotiable)

#### Emotion Cards (Step 1):
- **Emoji chip:** `56px → 100px` (desktop), `80px` (mobile)
- **Emoji size:** `1.6rem → 3.5rem`
- **Label text:** `0.95rem → 1.4rem` (desktop), `1.2rem` (mobile)
- **Card min-height:** `100px → 180px` (desktop), `160px` (mobile)
- **Card padding:** `18px 20px → 32px 28px`
- **Card border:** `2px → 3px`
- **Card gap:** `10px → 16px`

#### Option Cards (Step 2):
- **Icon size:** `3rem → 5rem` (desktop), `4rem` (mobile)
- **Label text:** `1rem → 2rem` (desktop), `1.6rem` (mobile)
- **Card min-height:** `120px → 200px` (desktop), `160px` (mobile)
- **Card padding:** `24px 16px → 40px 24px` (desktop), `32px 20px` (mobile)
- **Card gap:** `12px → 20px`
- **Card border:** `3px → 4px`
- **Grid gap:** `16px → 24px`

#### Forward Button:
- **Size:** `56px → 72px` (desktop), `64px` (mobile)
- **Icon size:** `24px → 32px` (desktop), `28px` (mobile)
- **Position:** `bottom: 24px → 32px`, `right: 24px → 32px`

#### Panel:
- **Padding:** `32px → 40px`
- **Min-height:** `400px → 500px`

---

### 2. MODE-BASED STEP 2 (Required)

**Before:**
- Step 2 showed Draw + Write together (confusing)
- Same screen for both modes

**After:**
- **Explicit modes:** `'select' | 'draw' | 'write'`
- **Select mode:** Three BIG icon cards (Rita, Skriv, Klart)
- **Draw mode:** Large canvas with colored background, BIG action buttons
- **Write mode:** Large text area with colored background, BIG starter buttons
- **Never show draw + write together**

**Implementation:**
```tsx
const [step2Mode, setStep2Mode] = useState<'select' | 'draw' | 'write' | null>(null);

{step2Mode === 'select' && (
  <div className="journey-options-grid">
    {/* Three BIG icon cards */}
  </div>
)}

{step2Mode === 'draw' && (
  <JourneyDraw onDrawingChange={...} onFinish={...} />
)}

{step2Mode === 'write' && (
  <JourneyWrite note={note} onChange={...} onFinish={...} />
)}
```

---

### 3. DRAW MODE UI

**Features:**
- **Canvas fills most of panel** (min-height: 350px)
- **Colored background:** Green gradient (`#E8F5E9 → #C8E6C9`)
- **Thick rounded border:** `6px solid green`
- **BIG action icons:**
  - ✔️ Finish (primary, `80px` button, `2.5rem` icon)
  - 🗑️ Clear (secondary, `80px` button, `2.5rem` icon)
- **No text buttons** (no "Spara teckning")
- **Drawing tools visible immediately**

**Component:** `JourneyDraw`
- Large canvas with colored border
- Two BIG circular action buttons
- Icons only (no text)

---

### 4. WRITE MODE UI

**Features:**
- **Large text area** (min-height: 300px)
- **Colored background:** Yellow gradient (`#FFF9E6 → #FFECB3`)
- **Large font size:** `1.8rem` (desktop), `1.5rem` (mobile)
- **Thick rounded border:** `6px solid green`
- **BIG starter buttons** (optional):
  - "Idag" (`2rem` font, `20px 40px` padding)
  - "Jag" (`2rem` font, `20px 40px` padding)
- **Forward arrow always visible** (bottom-right, `72px`)

**Component:** `JourneyWrite`
- Large textarea with colored background
- Optional starter buttons (shown when empty)
- Forward button always visible

---

### 5. VISUAL HIERARCHY

**One main action per screen:**
- **Step 1:** Emotion selection (biggest thing)
- **Step 2 Select:** Three option cards (equal, BIG)
- **Step 2 Draw:** Canvas (biggest) + Finish button (secondary, BIG)
- **Step 2 Write:** Textarea (biggest) + Forward button (always visible, BIG)

**Secondary actions:**
- Clear button (draw mode) - smaller but still BIG (`80px`)
- Starter buttons (write mode) - BIG but secondary to textarea

---

### 6. LANGUAGE (Minimal)

**Kept:**
- "Rita" (one word)
- "Skriv" (one word)
- "Klart" (one word)
- "Idag" (one word, starter)
- "Jag" (one word, starter)

**Removed:**
- All explanatory sentences
- All instructional paragraphs
- All helper text
- All long labels

**Labels are supportive, not required:**
- Icons are primary
- Text is secondary (large but not required to understand)

---

### 7. BACKGROUND & FEEL

**Maintained:**
- Green outer background (consistent frame)
- Off-white central panel (`#fafbf9`)
- Large rounded corners (`32px`)
- Soft shadows

**Added:**
- Colored backgrounds in draw/write modes:
  - Draw: Green gradient (`#E8F5E9 → #C8E6C9`)
  - Write: Yellow gradient (`#FFF9E9 → #FFECB3`)
- Thick colored borders (`6px`) to signal interaction areas
- Playful, not school-like

---

### 8. NAVIGATION

**Header (unchanged):**
- Back arrow (icon, left)
- Step indicator ("Steg 2/2", center)
- Profile icon (top-right)
- Hamburger menu (visible, top-right)

**Forward navigation:**
- Big arrow icon (bottom-right, `72px`)
- Always visible when ready
- Icon-only (no text)

---

## Component Details

### JourneyDraw Component

**Props:**
```typescript
interface JourneyDrawProps {
  onDrawingChange: (dataUrl: string) => void;
  onFinish: () => void;
  onClear: () => void;
}
```

**Features:**
- Large canvas (`min-height: 350px`)
- Colored background (green gradient)
- Thick border (`6px solid green`)
- BIG action buttons (`80px` circular)
- Icons only (✔️ Finish, 🗑️ Clear)

### JourneyWrite Component

**Props:**
```typescript
interface JourneyWriteProps {
  note: string;
  onChange: (value: string) => void;
  onFinish: () => void;
}
```

**Features:**
- Large textarea (`min-height: 300px`)
- Colored background (yellow gradient)
- Large font (`1.8rem`)
- Thick border (`6px solid green`)
- Optional starter buttons (BIG, `2rem` font)
- Forward button always visible

---

## Size Comparison

### Before → After

| Element | Before | After (Desktop) | After (Mobile) |
|---------|--------|-----------------|----------------|
| Emotion emoji chip | 56px | 100px | 80px |
| Emotion emoji size | 1.6rem | 3.5rem | 3rem |
| Emotion label | 0.95rem | 1.4rem | 1.2rem |
| Emotion card height | 100px | 180px | 160px |
| Option icon | 3rem | 5rem | 4rem |
| Option label | 1rem | 2rem | 1.6rem |
| Option card height | 120px | 200px | 160px |
| Forward button | 56px | 72px | 64px |
| Forward icon | 24px | 32px | 28px |
| Draw action button | - | 80px | 72px |
| Draw action icon | - | 2.5rem | 2.2rem |
| Write font | 1rem | 1.8rem | 1.5rem |
| Write starter | - | 2rem | 1.6rem |
| Panel padding | 32px | 40px | 24px |
| Panel min-height | 400px | 500px | 400px |

---

## Why This Works for Non-Readers

1. **Everything is BIG:**
   - Icons: `3.5rem - 5rem` (visible from arm's length)
   - Text: `1.4rem - 2rem` (readable but not required)
   - Buttons: `72px - 80px` (thumb-sized, easy to tap)

2. **Visual over text:**
   - Icons are primary (emojis, symbols)
   - Text is secondary (supportive, not required)
   - Colors signal interaction areas

3. **One thing at a time:**
   - Step 2 has explicit modes (never show draw + write together)
   - One main action per screen
   - Clear visual hierarchy

4. **Playful, not school-like:**
   - Colored backgrounds (green, yellow)
   - Thick rounded borders
   - Large rounded corners
   - Soft shadows

5. **No reading required:**
   - Icons communicate function
   - Colors signal areas
   - Size indicates importance
   - Layout shows flow

---

## Testing Checklist

- [ ] Emotion cards are BIG (100px chip, 3.5rem emoji)
- [ ] Emotion labels are large (1.4rem)
- [ ] Option cards are BIG (200px height, 5rem icons)
- [ ] Option labels are large (2rem)
- [ ] Forward button is BIG (72px)
- [ ] Draw mode: Canvas is large (350px min-height)
- [ ] Draw mode: Action buttons are BIG (80px)
- [ ] Draw mode: Icons are BIG (2.5rem)
- [ ] Write mode: Textarea is large (300px min-height)
- [ ] Write mode: Font is large (1.8rem)
- [ ] Write mode: Starter buttons are BIG (2rem font)
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works
- [ ] Mobile sizes are appropriate (smaller but still BIG)
- [ ] No text instructions required
- [ ] Everything readable from arm's length

---

## Summary

The journey UI is now **BIG and non-reading friendly**:

✅ **Everything is BIG:** Icons, text, buttons (thumb-sized)  
✅ **Mode-based step 2:** Draw, Write, or Done (never together)  
✅ **Visual over text:** Icons primary, text secondary  
✅ **One main action:** Clear hierarchy per screen  
✅ **Playful feel:** Colored backgrounds, thick borders  
✅ **No reading required:** Icons, colors, size communicate function  

The UI works for children who can't read, from arm's length on a tablet.
