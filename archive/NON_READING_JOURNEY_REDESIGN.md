# Non-Reading Child Journey UI Redesign

**Date:** 2025-01-27  
**Goal:** Make emotion journey usable WITHOUT reading - icon-based, Polyglutt-like patterns  
**Target:** Children 5-12 (many can't read well)

---

## Files Changed

1. **Created:**
   - `src/components/JourneyHeader/JourneyHeader.tsx` - Pure navigation header
   - `src/components/JourneyHeader/JourneyHeader.css` - Header styles

2. **Modified:**
   - `src/pages/JourneySimple/JourneySimplePage.tsx` - Updated to use new header and icon-based UI
   - `src/pages/Journey/journey.css` - Added styles for forward button and icon cards

---

## Key Changes

### 1. Header: Pure Navigation (No Question Text)

**Before:**
- Header showed question text: "Hur känns det idag?" / "Vill du visa något?"
- Progress dots
- Back button with text "◀ Tillbaka"

**After:**
- **Left:** Back arrow button (icon-only, circular)
- **Center:** "Steg 1/2" or "Steg 2/2" (ONLY step indicator, no question)
- **Right:** Profile button (🙂 icon) + Hamburger menu (always visible)

**Implementation:**
- Created `JourneyHeader` component
- Removed all question text from header
- Step indicator is the only text in header

---

### 2. Forward Button: Icon-Only (Bottom-Right)

**Before:**
- Text button "Fortsätt" in navigation area
- Required reading to understand

**After:**
- **Circular button** with right arrow icon (→)
- **Position:** Bottom-right of content panel
- **Appears:** Only when emotion is selected (step 1) or when ready to proceed
- **Accessibility:** `aria-label="Nästa"`

**Implementation:**
```tsx
<button
  className="journey-forward-btn"
  onClick={() => setStep(2)}
  aria-label="Nästa"
>
  <svg>...</svg> {/* Right arrow icon */}
</button>
```

**CSS:**
- Position: `absolute`, `bottom: 24px`, `right: 24px`
- Size: `56px × 56px` (big touch target)
- Color: Green (`--mg-good`)
- Shadow: Soft glow effect

---

### 3. Removed Large Headings & Helper Text

**Before:**
- Step 1: "Hur känns det idag?" (large heading)
- Step 1: "Välj den känsla som känns rätt just nu." (helper text)
- Step 2: "Vill du visa något?" (large heading)
- Step 2: "Du kan rita, skriva, eller bara vara klar." (helper text)

**After:**
- **No headings** in content panels
- **No helper text** paragraphs
- Emotion cards are self-explanatory (visual)
- Icon cards in step 2 are self-explanatory (visual)

**Implementation:**
- Removed `title` prop from `StepCard` (made optional)
- Removed all `<h1>` and `<p className="step-help-text">` elements
- Content is now purely visual

---

### 4. Step 2: Icon Cards (Draw / Write / Done)

**Before:**
- Text buttons: "Tillbaka", "Klart", "Skicka"
- Required reading to understand options

**After:**
- **Three icon cards** (equal size, visual):
  - 🎨 **Rita** (Draw)
  - ✏️ **Skriv** (Write)
  - ✅ **Klart** (Done - green gradient background)
- Clicking Draw or Write shows InputArea
- Clicking Done submits immediately
- Labels are small and supportive (not required to understand)

**Implementation:**
```tsx
<div className="journey-options-grid">
  <button className="journey-option-card" aria-label="Rita">
    <span className="option-icon">🎨</span>
    <span className="option-label">Rita</span>
  </button>
  {/* ... Write and Done ... */}
</div>
```

**CSS:**
- Grid: `grid-template-columns: repeat(3, 1fr)`
- Cards: White background, rounded corners, hover effects
- Icons: `3rem` size (large, visible)
- Labels: Small text below icon (supportive, not required)

---

### 5. Removed Confirmation Step

**Already removed in previous update:**
- No "Är det rätt känsla?" step
- Selecting emotion is enough
- Visual feedback (glow + scale) confirms selection
- Optional "Okej 💚" chip appears (visual, not required)

---

### 6. Green Background & Central Panel

**Maintained:**
- Green gradient background (consistent with app)
- Central off-white panel (`#fafbf9`)
- Large rounded corners (`32px`)
- Soft shadows (layered)

**No changes needed** - already implemented correctly.

---

## Component Structure

### JourneyHeader Component

**Props:**
```typescript
interface JourneyHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}
```

**Features:**
- Back button (left, icon-only)
- Step indicator (center, "Steg X/Y")
- Profile button (right, 🙂 icon)
- Hamburger menu (right, next to profile)
- Navigation drawer (same as AppHeader)

**Usage:**
```tsx
<JourneyHeader
  currentStep={step}
  totalSteps={2}
  onBack={() => {
    if (step === 1) navigate('/test-hub');
    else setStep(1);
  }}
/>
```

---

## CSS Classes Added

### Forward Button
```css
.journey-forward-btn
  - Position: absolute, bottom-right
  - Size: 56px × 56px
  - Circular, green background
  - Right arrow icon
```

### Icon Option Cards
```css
.journey-options-grid
  - Grid layout (3 columns)
  - Gap: 16px

.journey-option-card
  - White background
  - Rounded corners (20px)
  - Hover effects
  - Large icon (3rem)
  - Small label below

.journey-option-done
  - Green gradient background
  - Special styling for "Done" option
```

---

## Accessibility Maintained

✅ **All accessibility features preserved:**
- `aria-label` on all icon buttons
- `aria-pressed` on emotion buttons
- Keyboard navigation (Tab, Enter, Space)
- Focus styles (3px outline)
- Reduced motion support

---

## Mobile Responsive

**Forward Button:**
- Size: `52px × 52px` on mobile
- Position: `bottom: 20px`, `right: 20px`

**Icon Cards:**
- Grid: `1 column` on mobile (stacked)
- Cards: `min-height: 100px`
- Icons: `2.5rem` (slightly smaller)

---

## Visual Hierarchy

1. **Green background** = Frame (consistent with app)
2. **White panel** = Focus area (play area)
3. **Colorful emotion cards** = Primary interaction (step 1)
4. **Icon option cards** = Secondary interaction (step 2)
5. **Forward button** = Next action (bottom-right, always visible when ready)

---

## Why This Works for Non-Readers

1. **Icons are primary:**
   - Emotion cards use emoji (visual)
   - Option cards use emoji (🎨 ✏️ ✅)
   - Navigation uses arrows (← →)

2. **No text required:**
   - Headings removed
   - Helper text removed
   - Labels are small and supportive (not required)

3. **Clear visual feedback:**
   - Selected emotion: glow + scale
   - Forward button: appears when ready
   - Option cards: hover effects

4. **Consistent patterns:**
   - Header always same (navigation only)
   - Forward button always bottom-right
   - Icon cards always same size

5. **Big touch targets:**
   - Forward button: 56px × 56px
   - Option cards: min-height 120px
   - Emotion cards: min-height 100px

---

## Testing Checklist

- [ ] Header shows "Steg 1/2" or "Steg 2/2" (no question text)
- [ ] Back button is icon-only (left)
- [ ] Profile button visible (right)
- [ ] Hamburger menu visible (right, next to profile)
- [ ] Forward button appears bottom-right when emotion selected
- [ ] Forward button is circular with arrow icon
- [ ] No large headings in content panels
- [ ] No helper text paragraphs
- [ ] Step 2 shows three icon cards (Draw/Write/Done)
- [ ] Clicking Draw/Write shows InputArea
- [ ] Clicking Done submits immediately
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works
- [ ] Mobile layout stacks icon cards
- [ ] Green background visible as frame
- [ ] White panel feels like play area

---

## Summary

The journey UI is now **usable without reading**:

✅ **Header:** Pure navigation (back, step, profile, menu)  
✅ **Forward button:** Icon-only, bottom-right  
✅ **No headings:** Removed all large text  
✅ **No helper text:** Removed all explanatory paragraphs  
✅ **Icon cards:** Visual options (Draw/Write/Done)  
✅ **Green background:** Consistent frame  
✅ **White panel:** Play area focus  

The UI follows **Polyglutt-like patterns**: clear navigation, icons, big touch targets, consistent layout.
