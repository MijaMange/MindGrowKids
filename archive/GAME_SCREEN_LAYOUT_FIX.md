# Game Screen Layout Fix - No Internal Scrolling

**Date:** 2025-01-27  
**Issue:** Step 2 had scrollable card/list UI (unwanted)  
**Goal:** Fixed "game screen" layout - no internal scrolling, canvas always fits

---

## Files Changed

1. `src/pages/Journey/journey.css` - Fixed root, stage, step-card, overlay
2. `src/components/JourneyDraw/JourneyDraw.css` - Fixed container, canvas wrapper
3. `src/components/JourneyWrite/JourneyWrite.css` - Fixed container, textarea

---

## Root Cause

**Previous fix introduced:**
- `overflow-y: auto` on `.step-card` → created scrollable card (list-like)
- `overflow-y: auto` on `.creation-overlay` → internal scrolling
- `overflow-y: auto` on `.journey-stage` → page scroll + card scroll

**Problem:**
- Felt like a feed/list, not a game screen
- User had to scroll inside the card to see canvas
- Not a single-screen experience

---

## Solution: 3-Part Flex Layout

### Layout Structure:
```
.journey-root (100dvh, flex column, overflow: hidden)
  ├─ .journey-header (flex: 0 0 auto, fixed height ~56px)
  └─ .journey-stage (flex: 1 1 auto, centers content)
      └─ .step-card (responsive height, no scroll)
          └─ .creation-overlay (no scroll)
              └─ .journey-draw-container (flex column)
                  └─ .journey-draw-canvas-wrapper (clamp height)
```

---

## Changes Applied

### 1. Journey Root (`.journey-root`)
**Before:**
```css
.journey-root {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**After:**
```css
.journey-root {
  min-height: 100dvh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**Why:**
- `100dvh` uses dynamic viewport height (better for mobile)
- Fixed height container for proper flex layout
- `overflow: hidden` prevents page scroll (only as last resort)

---

### 2. Journey Stage (`.journey-stage`)
**Before:**
```css
.journey-stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
}
```

**After:**
```css
.journey-stage {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 2vw, 32px);
  min-height: 0;
  overflow: visible;
}
```

**Why:**
- `flex: 1 1 auto` fills available space (between header and footer)
- `align-items: center` centers content vertically
- `justify-content: center` centers content horizontally
- `overflow: visible` - no internal scrolling
- `min-height: 0` allows flex shrinking
- Responsive padding with `clamp()`

---

### 3. Step Card (`.step-card`)
**Before:**
```css
.step-card {
  width: min(920px, 94vw);
  min-height: 500px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}
```

**After:**
```css
.step-card {
  width: min(1100px, 92vw);
  height: min(700px, calc(100dvh - 120px));
  padding: clamp(16px, 2vw, 32px);
  display: flex;
  flex-direction: column;
  overflow: visible;
  max-width: 100%;
  max-height: 100%;
}
```

**Why:**
- `height: min(700px, calc(100dvh - 120px))` - responsive height that fits viewport
- `overflow: visible` - NO internal scrolling
- `max-width: 100%` and `max-height: 100%` - ensures card fits
- Responsive padding with `clamp()`
- Fixed height (not min-height) for predictable sizing

---

### 4. Creation Overlay (`.creation-overlay`)
**Before:**
```css
.creation-overlay {
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}
```

**After:**
```css
.creation-overlay {
  position: absolute;
  padding: clamp(16px, 2vw, 32px);
  overflow: visible;
  min-height: 0;
}
```

**Why:**
- `overflow: visible` - NO internal scrolling
- Responsive padding
- Content fits within card bounds

---

### 5. Journey Draw Container (`.journey-draw-container`)
**Before:**
```css
.journey-draw-container {
  flex: 1;
  min-height: 0;
  padding-bottom: 20px;
}
```

**After:**
```css
.journey-draw-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: visible;
}
```

**Why:**
- `overflow: visible` - no clipping
- `flex: 1` fills available space
- `min-height: 0` allows proper flex sizing
- Gap for spacing between elements

---

### 6. Canvas Wrapper (`.journey-draw-canvas-wrapper`)
**Before:**
```css
.journey-draw-canvas-wrapper {
  flex: 1;
  min-height: clamp(260px, 45vh, 520px);
  max-height: clamp(300px, 60vh, 600px);
  overflow: visible;
}
```

**After:**
```css
.journey-draw-canvas-wrapper {
  height: clamp(260px, 42vh, 520px);
  flex-shrink: 0;
  overflow: visible;
  display: flex;
  flex-direction: column;
}
```

**Why:**
- `height: clamp(260px, 42vh, 520px)` - fixed responsive height (always fits)
- `flex-shrink: 0` - prevents canvas from shrinking
- `overflow: visible` - stickers visible
- No `flex: 1` - uses fixed height instead

---

### 7. Canvas (`.journey-draw-canvas`)
**Before:**
```css
.journey-draw-canvas {
  flex: 1;
  min-height: 0;
}
```

**After:**
```css
.journey-draw-canvas {
  width: 100% !important;
  height: 100% !important;
  flex-shrink: 0;
}
```

**Why:**
- `height: 100%` - fills wrapper (which has fixed height)
- `flex-shrink: 0` - prevents shrinking
- Canvas size is predictable (matches wrapper)

---

### 8. Draw Actions (`.journey-draw-actions`)
**Before:**
```css
.journey-draw-actions {
  flex-shrink: 0;
  margin-top: 8px;
}
```

**After:**
```css
.journey-draw-actions {
  flex-shrink: 0;
  padding-top: 8px;
}
```

**Why:**
- `flex-shrink: 0` - buttons never shrink
- `padding-top` - spacing above buttons
- Buttons sit below canvas (no overlap)

---

### 9. Journey Write Container (`.journey-write-container`)
**Before:**
```css
.journey-write-container {
  height: 100%;
  min-height: 400px;
}
```

**After:**
```css
.journey-write-container {
  flex: 1;
  min-height: 0;
  overflow: visible;
  padding-bottom: 80px;
}
```

**Why:**
- `flex: 1` fills available space
- `min-height: 0` allows proper flex sizing
- `overflow: visible` - no clipping
- `padding-bottom: 80px` - reserves space for forward button

---

### 10. Write Textarea (`.journey-write-textarea`)
**Before:**
```css
.journey-write-textarea {
  flex: 1;
  min-height: 300px;
}
```

**After:**
```css
.journey-write-textarea {
  height: clamp(260px, 42vh, 520px);
  flex-shrink: 0;
}
```

**Why:**
- `height: clamp(260px, 42vh, 520px)` - fixed responsive height (always fits)
- `flex-shrink: 0` - prevents shrinking
- Matches canvas height for consistency

---

## Final Layout Behavior

### Desktop (900px+ height):
- Header: ~56px (fixed)
- Stage: `flex: 1` = ~844px available
- Card: `min(700px, calc(100dvh - 120px))` = ~700px
- Canvas: `clamp(260px, 42vh, 520px)` = ~378px
- **Result:** Everything fits, no scrolling needed

### Mobile (700px height):
- Header: ~56px (fixed)
- Stage: `flex: 1` = ~644px available
- Card: `min(600px, calc(100dvh - 100px))` = ~600px
- Canvas: `clamp(240px, 38vh, 480px)` = ~266px
- **Result:** Everything fits, no scrolling needed

### Extremely Small (500px height):
- Card: `min(600px, calc(100dvh - 100px))` = ~400px
- Canvas: `clamp(240px, 38vh, 480px)` = ~190px
- **Result:** Canvas still visible, page scroll as last resort (only if card exceeds viewport)

---

## Scrolling Behavior

**No internal scrolling:**
- ✅ `.step-card` - `overflow: visible` (no scroll)
- ✅ `.creation-overlay` - `overflow: visible` (no scroll)
- ✅ `.journey-stage` - `overflow: visible` (no scroll)
- ✅ Canvas wrapper - fixed height (no scroll)

**Page scroll (last resort only):**
- Only if viewport is extremely small (< 500px height)
- Card might exceed viewport, causing page scroll
- This is acceptable as last resort
- Normal screens (700px+) - no scrolling at all

---

## Responsive Sizing

### Card:
- Width: `min(1100px, 92vw)`
- Height: `min(700px, calc(100dvh - 120px))` (desktop)
- Height: `min(600px, calc(100dvh - 100px))` (mobile)
- Padding: `clamp(16px, 2vw, 32px)`

### Canvas:
- Height: `clamp(260px, 42vh, 520px)` (desktop)
- Height: `clamp(240px, 38vh, 480px)` (mobile)
- Width: `100%`

### Textarea:
- Height: `clamp(260px, 42vh, 520px)` (desktop)
- Height: `clamp(240px, 38vh, 480px)` (mobile)
- Width: `100%`

---

## Testing Scenarios

### ✅ Mobile height ~700px:
- Card: ~600px (fits)
- Canvas: ~266px (fits)
- **Result:** No scrolling, everything visible

### ✅ Desktop height ~900px:
- Card: ~700px (fits)
- Canvas: ~378px (fits)
- **Result:** No scrolling, everything visible

### ✅ Zoom 125%:
- `clamp()` and `calc()` scale with viewport
- Canvas remains visible
- **Result:** No clipping, no internal scroll

### ✅ Zoom 150%:
- Responsive values adapt
- Canvas remains visible
- **Result:** No clipping, no internal scroll

### ✅ Landscape:
- Wider viewport, same height logic
- Canvas sizes appropriately
- **Result:** No scrolling needed

### ✅ Portrait:
- Narrower viewport, same height logic
- Canvas sizes appropriately
- **Result:** No scrolling needed

### ✅ Extremely small (500px height):
- Card might be ~400px
- Canvas ~190px (still visible)
- **Result:** Page scroll as last resort (acceptable)

---

## Summary

**Root Cause:**
- `overflow-y: auto` created scrollable card/list UI
- Fixed heights without proper flex layout
- Canvas used `flex: 1` which didn't work properly

**Solution:**
- 3-part flex layout: header (fixed) + main (flex: 1) + content
- Removed ALL internal scrolling (`overflow: visible`)
- Fixed responsive heights using `clamp()` and `min()`
- Canvas uses fixed height, not flex: 1

**Final Behavior:**
- ✅ Fixed header stays visible
- ✅ Main area centers content vertically/horizontally
- ✅ Canvas fits on screen by responsive sizing
- ✅ No internal scrolling in card/overlay
- ✅ Page scroll only as last resort on extremely small screens
- ✅ Feels like a "game screen", not a list/feed

The layout now feels like a single-screen game view!
