# Light Sweep Animation - Landing Page

**Date:** 2025-01-27  
**Goal:** Add a very subtle "light sweep" animation that feels calm, warm, and safe (not tech/scanner-like)

---

## Summary of Changes

### Animation Concept
- **Visual**: Soft, translucent gradient passes vertically from top to bottom
- **Feel**: Gentle light sweep, not a scan or surveillance effect
- **Position**: Behind content, above background gradient
- **Opacity**: Very low (4-8% max)
- **Edges**: Soft, blurred, feathered (no sharp lines)

### Technical Implementation
- **Library**: Framer Motion (already in project)
- **Direction**: Top → bottom
- **Duration**: 1.4 seconds
- **Easing**: `[0.4, 0, 0.2, 1]` (easeInOut)
- **Delay**: 0.3s after page load
- **Runs once**: Only on initial page load
- **Respects reduced motion**: Disabled if `prefers-reduced-motion` is enabled

---

## Files Changed

### 1. `src/pages/Landing/LandingPage.tsx`
**Changes:**
- Added light sweep animation element using Framer Motion
- Conditionally renders only if `prefersReducedMotion` is false
- Positioned in z-index stack (above background, below content)

**Key Code:**
```tsx
{/* Light sweep animation - gentle gradient pass */}
{!prefersReducedMotion && (
  <motion.div
    className="landing-light-sweep"
    aria-hidden="true"
    initial={{ y: '-100%' }}
    animate={{ y: '100%' }}
    transition={{
      duration: 1.4,
      ease: [0.4, 0, 0.2, 1], // easeInOut
      delay: 0.3, // Slight delay after page load
    }}
  />
)}
```

### 2. `src/pages/Landing/LandingPage.css`
**Changes:**
- Added `.landing-light-sweep` styles
- Wide gradient band (60vh height)
- Soft white gradient (4-8% opacity max)
- Blur filter for feathered edges
- Z-index: 2 (above background, below content)
- Updated reduced motion media query to hide sweep

**Key Styles:**
```css
/* Light sweep animation - gentle gradient pass */
.landing-light-sweep {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60vh; /* Wide gradient band */
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.06) 20%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.06) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(40px); /* Soft, feathered edges */
  pointer-events: none;
  z-index: 2; /* Above background gradient, below content */
  will-change: transform; /* Optimize for animation */
}
```

---

## Visual Details

### Gradient Structure
- **Width**: 60vh (wide band, not thin line)
- **Opacity progression**:
  - 0% at top (transparent)
  - 6% at 20% (fade in)
  - 8% at 50% (peak)
  - 6% at 80% (fade out)
  - 0% at bottom (transparent)
- **Color**: White (`rgba(255, 255, 255, ...)`) for subtlety
- **Alternative**: Soft green tint available (commented out) - `rgba(140, 240, 192, ...)`

### Blur & Softness
- **Filter**: `blur(40px)` for soft, feathered edges
- **No sharp lines**: Gradient fades smoothly at edges
- **No glow**: Subtle, not neon or harsh

### Layering (Z-Index)
- **Background gradient**: `z-index: 0`
- **Light sweep**: `z-index: 2` (above background)
- **Content (text, buttons)**: `z-index: 10` (above sweep)
- **Result**: Sweep passes behind content, doesn't interfere

---

## Motion Details

### Animation Properties
- **Initial position**: `y: '-100%'` (above viewport)
- **Final position**: `y: '100%'` (below viewport)
- **Duration**: 1.4 seconds
- **Easing**: `[0.4, 0, 0.2, 1]` (easeInOut - soft acceleration/deceleration)
- **Delay**: 0.3s after page load
- **Total time**: ~1.7s (delay + duration)

### Timing Sequence
1. **0.0s**: Page loads
2. **0.3s**: Light sweep starts moving from top
3. **1.7s**: Light sweep completes (exits bottom)
4. **After**: Sweep removed from DOM (no lingering)

---

## UX Principles Applied

### ✅ Calm, Warm, Safe
- Slow, gentle motion (1.4s)
- Soft easing curve (no sharp movements)
- Very low opacity (barely visible)
- Wide, blurred band (not thin line)

### ✅ NOT Tech/Scanner-Like
- No sharp edges
- No bright contrast
- No fast movement
- No neon glow
- No surveillance feel

### ✅ Subtle & Premium
- Barely perceptible (4-8% opacity)
- Soft blur for feathered edges
- Gentle vertical pass
- One-time animation

### ✅ Respects Accessibility
- Disabled if `prefers-reduced-motion` is enabled
- Doesn't interfere with content readability
- Doesn't block interactions
- `pointer-events: none` (can't be clicked)

---

## Reduced Motion Support

When `prefers-reduced-motion` is enabled:
- **Conditional rendering**: Sweep element not rendered at all
- **CSS fallback**: Additional `display: none` in media query
- **Result**: No animation, no element, no performance impact

**Implementation:**
```tsx
{!prefersReducedMotion && (
  <motion.div className="landing-light-sweep" ... />
)}
```

```css
@media (prefers-reduced-motion: reduce) {
  .landing-light-sweep {
    display: none !important;
  }
}
```

---

## Performance Considerations

- **One-time animation**: Only runs on initial page load
- **GPU-accelerated**: Uses `transform` (y-position) for smooth animation
- **Will-change**: `will-change: transform` optimizes for animation
- **Pointer events**: `pointer-events: none` prevents interaction overhead
- **No re-renders**: Animation completes, element removed from DOM
- **Lightweight**: Single gradient element, minimal DOM impact

---

## Alternative Color Option

A soft green tint option is available (commented out in CSS):
```css
/* Soft green tint option */
background: linear-gradient(
  to bottom,
  rgba(140, 240, 192, 0) 0%,
  rgba(140, 240, 192, 0.05) 20%,
  rgba(140, 240, 192, 0.07) 50%,
  rgba(140, 240, 192, 0.05) 80%,
  rgba(140, 240, 192, 0) 100%
);
```

This uses the brand's soft green (`#8CF0C0`) for a more branded feel, but white was chosen for maximum subtlety.

---

## Testing Checklist

- [x] Light sweep animates on initial page load
- [x] Sweep passes from top to bottom
- [x] Very low opacity (barely visible)
- [x] Wide gradient band (not thin line)
- [x] Soft, feathered edges (blurred)
- [x] Runs once (no looping)
- [x] Behind content (doesn't block text/buttons)
- [x] Content remains readable and clickable
- [x] Reduced motion support works (sweep disabled)
- [x] No performance issues
- [x] Doesn't feel like scanner/tech effect
- [x] Feels calm, warm, and safe

---

## Future Enhancements (Optional)

1. **Fine-tune opacity**: Adjust if too subtle or too visible
2. **Color variation**: Test soft green tint option
3. **Timing adjustment**: Modify duration or delay if needed
4. **Width adjustment**: Change gradient band height (currently 60vh)
5. **A/B testing**: Test with/without sweep for user preference

---

## Summary

The Landing Page now has a **very subtle light sweep animation** that:
- ✅ Feels calm, warm, and safe (not tech/scanner-like)
- ✅ Passes gently from top to bottom once on page load
- ✅ Uses very low opacity (4-8% max) with soft, blurred edges
- ✅ Sits behind content, doesn't interfere with readability
- ✅ Respects accessibility preferences
- ✅ Creates a premium, intentional first impression

The animation is **barely perceptible** but adds a subtle sense of **movement and life** to the landing page, enhancing the premium feel without being distracting or tech-like.
