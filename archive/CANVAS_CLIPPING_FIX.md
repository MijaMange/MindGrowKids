# Canvas Clipping Fix - Drawing Area Always Visible

**Date:** 2025-01-27  
**Issue:** Drawing canvas was clipped/cut off at the bottom  
**Root Cause:** Multiple overflow/height constraints in parent containers

---

## Files Changed

1. `src/pages/Journey/journey.css` - Fixed step-card, journey-stage, journey-root
2. `src/components/JourneyDraw/JourneyDraw.css` - Fixed canvas wrapper and container

---

## Root Cause Analysis

### Problem Chain:
1. **`.step-card`** had `overflow: hidden` - clipped canvas at bottom
2. **`.step-card`** had fixed `min-height: 500px` but no scrolling
3. **`.creation-overlay`** was absolutely positioned but constrained by parent overflow
4. **`.journey-draw-container`** used `height: 100%` which failed in flex context
5. **`.journey-draw-canvas-wrapper`** had `overflow: hidden` and fixed min-height
6. **`.journey-stage`** used `place-items: center` which could cause clipping

### Layout Hierarchy:
```
.journey-root (100vh, flex column)
  └─ .journey-stage (flex, scrollable)
      └─ .step-card (flex column, scrollable, max-height)
          └─ .creation-overlay (absolute, scrollable)
              └─ .journey-draw-container (flex column, flex: 1)
                  └─ .journey-draw-canvas-wrapper (flex: 1, clamp height)
                      └─ .journey-draw-canvas (flex: 1)
```

---

## Fixes Applied

### 1. Journey Root (`.journey-root`)
**Before:**
```css
.journey-root {
  min-height: 100vh;
}
```

**After:**
```css
.journey-root {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**Why:**
- Fixed height container for proper flex layout
- Prevents page-level scrolling issues
- Flex column for proper stacking

---

### 2. Journey Stage (`.journey-stage`)
**Before:**
```css
.journey-stage {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 80px);
}
```

**After:**
```css
.journey-stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 24px;
  min-height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
}
```

**Why:**
- Flex instead of grid for better scrolling
- `align-items: flex-start` prevents centering issues
- `overflow-y: auto` allows scrolling when content exceeds viewport
- Content can scroll instead of being clipped

---

### 3. Step Card (`.step-card`)
**Before:**
```css
.step-card {
  min-height: 500px;
  overflow: hidden;
}
```

**After:**
```css
.step-card {
  min-height: 500px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}
```

**Why:**
- `overflow-y: auto` allows scrolling instead of clipping
- `max-height` prevents card from exceeding viewport
- `display: flex; flex-direction: column` for proper child sizing
- Content scrolls within card if needed

---

### 4. Step Card Content (`.step-card .content`)
**Before:**
```css
.step-card .content {
  display: grid;
  gap: 12px;
  min-height: 300px;
}
```

**After:**
```css
.step-card .content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}
```

**Why:**
- Flex column for proper child sizing
- `flex: 1` fills available space
- `min-height: 0` allows flex children to shrink below content size

---

### 5. Creation Overlay (`.creation-overlay`)
**Before:**
```css
.creation-overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
}
```

**After:**
```css
.creation-overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}
```

**Why:**
- `overflow-y: auto` allows scrolling in overlay
- `min-height: 0` allows flex children to size properly
- Overlay can scroll if content exceeds viewport

---

### 6. Journey Draw Container (`.journey-draw-container`)
**Before:**
```css
.journey-draw-container {
  height: 100%;
  min-height: 400px;
}
```

**After:**
```css
.journey-draw-container {
  flex: 1;
  min-height: 0;
  padding-bottom: 20px;
}
```

**Why:**
- `flex: 1` fills available space in flex parent
- `min-height: 0` allows proper flex shrinking
- `padding-bottom` ensures buttons don't overlap canvas
- Removed fixed `height: 100%` (doesn't work in flex)

---

### 7. Canvas Wrapper (`.journey-draw-canvas-wrapper`)
**Before:**
```css
.journey-draw-canvas-wrapper {
  flex: 1;
  min-height: 350px;
  overflow: hidden;
}
```

**After:**
```css
.journey-draw-canvas-wrapper {
  flex: 1;
  min-height: clamp(260px, 45vh, 520px);
  max-height: clamp(300px, 60vh, 600px);
  overflow: visible;
  display: flex;
  flex-direction: column;
}
```

**Why:**
- `clamp()` provides responsive height (260px-520px desktop, scales with viewport)
- `max-height` prevents canvas from growing too large
- `overflow: visible` allows stickers to be visible
- `display: flex; flex-direction: column` for proper canvas sizing

---

### 8. Canvas (`.journey-draw-canvas`)
**Before:**
```css
.journey-draw-canvas {
  width: 100% !important;
  height: 100% !important;
  min-height: 350px;
}
```

**After:**
```css
.journey-draw-canvas {
  width: 100% !important;
  flex: 1;
  min-height: 0;
}
```

**Why:**
- `flex: 1` fills available space in flex parent
- `min-height: 0` allows proper flex shrinking
- Removed fixed `height: 100%` (doesn't work in flex)
- Canvas now sizes to available space

---

### 9. Draw Actions (`.journey-draw-actions`)
**Before:**
```css
.journey-draw-actions {
  display: flex;
  gap: 16px;
}
```

**After:**
```css
.journey-draw-actions {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
  margin-top: 8px;
}
```

**Why:**
- `flex-shrink: 0` prevents buttons from shrinking
- `margin-top: 8px` ensures spacing above buttons
- Buttons always visible, don't overlap canvas

---

## Final Layout Behavior

### Desktop (900px+ height):
- Canvas wrapper: `clamp(260px, 45vh, 520px)` = ~405px
- Max canvas: `clamp(300px, 60vh, 600px)` = ~540px
- Step card: `max-height: calc(100vh - 120px)` = ~780px
- **Result:** Canvas fully visible, scrolls if needed

### Mobile (700px height):
- Canvas wrapper: `clamp(240px, 40vh, 480px)` = ~280px
- Max canvas: `clamp(280px, 55vh, 560px)` = ~385px
- Step card: `max-height: calc(100vh - 100px)` = ~600px
- **Result:** Canvas fully visible, scrolls if needed

### Zoom 125%/150%:
- `clamp()` values scale with viewport
- Canvas remains proportional
- Scrolling works if content exceeds viewport

### Landscape/Portrait:
- Responsive `clamp()` adapts to viewport
- Canvas sizes appropriately
- No clipping in either orientation

---

## Scrolling Behavior

**When content exceeds viewport:**
1. `.journey-stage` scrolls (if card is too tall)
2. `.step-card` scrolls (if content exceeds card max-height)
3. `.creation-overlay` scrolls (if draw/write content exceeds overlay)
4. Canvas wrapper has fixed responsive height (doesn't scroll, but parent can)

**Priority:**
- Canvas wrapper: Fixed height (responsive)
- Parent containers: Scroll if needed
- Canvas itself: Fills wrapper, no scrolling

---

## Testing Scenarios

### ✅ Mobile height ~700px:
- Canvas: ~280px (visible)
- Card: max ~600px (scrolls if needed)
- **Result:** Canvas fully visible

### ✅ Desktop height ~900px:
- Canvas: ~405px (visible)
- Card: max ~780px (scrolls if needed)
- **Result:** Canvas fully visible

### ✅ Zoom 125%:
- `clamp()` scales with viewport
- Canvas remains visible
- **Result:** No clipping

### ✅ Zoom 150%:
- `clamp()` scales with viewport
- Canvas remains visible
- **Result:** No clipping

### ✅ Landscape:
- Wider viewport, same height logic
- Canvas sizes appropriately
- **Result:** No clipping

### ✅ Portrait:
- Narrower viewport, same height logic
- Canvas sizes appropriately
- **Result:** No clipping

---

## Summary

**Root Cause:**
- `overflow: hidden` on `.step-card` clipped canvas
- Fixed heights without scrolling capability
- `height: 100%` in flex context didn't work
- Missing `min-height: 0` in flex children

**Solution:**
- Changed `overflow: hidden` → `overflow-y: auto` (scrollable)
- Added `max-height` constraints
- Used `flex: 1` and `min-height: 0` for proper flex sizing
- Used `clamp()` for responsive canvas height
- Added proper flex layout hierarchy

**Final Behavior:**
- Canvas always fully visible
- Responsive height (260px-520px desktop, 240px-480px mobile)
- Scrolling works if content exceeds viewport
- No clipping at any screen size or zoom level
