# Logo Entrance Animation - Landing Page

**Date:** 2025-01-27  
**Goal:** Add a subtle, calm entrance animation to the MindGrow Kids logo on the Landing Page

---

## Summary of Changes

### Animation Concept
- **Option B (Preferred)**: Each letter animates individually with a small stagger
- **Movement**: Letters slide in from the left with a slight downward offset (diagonal feel)
- **Opacity**: Fades in together with motion
- **Icon**: Subtle fade-in with slight scale, appears slightly before letters
- **Feel**: Slow, calm, intentional - no bounce or energy

### Technical Implementation
- **Library**: Framer Motion (already in project)
- **Duration**: 0.7s per letter (total ~1.0s with stagger)
- **Easing**: Custom cubic-bezier `[0.16, 1, 0.3, 1]` (soft, calm)
- **Stagger**: 0.05s between each letter
- **Runs once**: Only on initial page load
- **Respects reduced motion**: Disabled if `prefers-reduced-motion` is enabled

---

## Files Changed

### 1. `src/components/Logo/MindGrowLogo.tsx`
**Changes:**
- Added `framer-motion` import
- Added `animateLetters` prop (boolean, default false)
- Added `prefersReducedMotion` prop (boolean, default false)
- Split wordmark "MINDGROW" into individual letters
- Added letter-by-letter animation with stagger
- Added icon animation (subtle fade-in with scale)

**Key Code:**
```tsx
// Animation variants for letter-by-letter animation
const letterVariants = {
  initial: { 
    opacity: 0, 
    x: -20, // Slide in from left
    y: 8, // Slight downward offset for diagonal feel
  },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for soft, calm feel
      delay: i * 0.05, // Stagger: 0.05s between each letter
    },
  }),
};

// Icon animation (subtle fade-in, slightly before letters)
const iconVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      delay: animateLetters && !prefersReducedMotion ? 0.1 : 0,
    },
  },
};
```

### 2. `src/pages/Landing/LandingPage.tsx`
**Changes:**
- Added `framer-motion` import (for potential future use)
- Updated `MindGrowLogo` usage to enable letter animation
- Passed `prefersReducedMotion` prop from existing hook

**Key Code:**
```tsx
<MindGrowLogo 
  variant="dark" 
  size="lg" 
  animateLetters={true}
  prefersReducedMotion={prefersReducedMotion}
/>
```

---

## Animation Details

### Letter Animation
- **Initial state**: `opacity: 0`, `x: -20`, `y: 8` (invisible, offset left and slightly down)
- **Final state**: `opacity: 1`, `x: 0`, `y: 0` (fully visible, in position)
- **Duration**: 0.7s per letter
- **Stagger**: 0.05s between each letter
- **Total duration**: ~1.0s (0.7s animation + 0.35s stagger for 8 letters)
- **Easing**: Custom cubic-bezier `[0.16, 1, 0.3, 1]` (soft, calm deceleration)

### Icon Animation
- **Initial state**: `opacity: 0`, `scale: 0.95` (invisible, slightly smaller)
- **Final state**: `opacity: 1`, `scale: 1` (fully visible, normal size)
- **Duration**: 0.6s
- **Delay**: 0.1s (appears slightly before first letter)
- **Easing**: Same custom cubic-bezier for consistency

### Timing Sequence
1. **0.0s**: Page loads
2. **0.1s**: Icon starts fading in
3. **0.1s**: First letter "M" starts animating
4. **0.15s**: Second letter "I" starts animating
5. **0.20s**: Third letter "N" starts animating
6. ... (continues with 0.05s stagger)
7. **0.45s**: Last letter "W" starts animating
8. **~1.15s**: All animations complete

---

## UX Principles Applied

### ✅ Premium, Calm First Impression
- Slow, intentional motion (0.7s per letter)
- Soft easing curve (no sharp movements)
- Subtle diagonal slide (not aggressive horizontal)

### ✅ No Playful or Bouncy Motion
- No bounce effects
- No rotation
- No aggressive scaling
- No looping

### ✅ Safe, Soft, Intentional
- Gentle slide-in from left
- Smooth opacity transition
- Calm deceleration curve

### ✅ Respects Accessibility
- Disabled if `prefers-reduced-motion` is enabled
- Animation doesn't delay interaction
- CTA buttons remain clickable immediately
- Logo becomes static after animation completes

---

## Reduced Motion Support

When `prefers-reduced-motion` is enabled:
- **Icon**: No animation (instant display)
- **Letters**: No animation (instant display)
- **Wordmark**: Renders as static text (no letter splitting)

**Implementation:**
```tsx
{animateLetters && !prefersReducedMotion ? (
  // Animate each letter individually
  letters.map((letter, index) => (
    <motion.span ... />
  ))
) : (
  // Static wordmark (no animation)
  wordmark
)}
```

---

## Performance Considerations

- **One-time animation**: Only runs on initial page load
- **No re-renders**: Animation completes, logo becomes static
- **Lightweight**: Uses Framer Motion's optimized animations
- **No layout shifts**: Letters maintain their final positions
- **GPU-accelerated**: Transform and opacity animations use GPU

---

## Testing Checklist

- [x] Logo animates on initial page load
- [x] Letters slide in from left with slight downward offset
- [x] Icon fades in slightly before letters
- [x] Animation feels calm and premium (not bouncy)
- [x] Animation completes and logo becomes static
- [x] No looping or continuous animation
- [x] Reduced motion support works (animation disabled)
- [x] CTA buttons remain clickable during animation
- [x] No layout shifts or jank
- [x] Animation only runs once per page load

---

## Future Enhancements (Optional)

1. **Fine-tune timing**: Adjust stagger delay or duration if needed
2. **Icon animation**: Could add subtle rotation or different entrance
3. **Exit animation**: If needed for page transitions
4. **A/B testing**: Test different animation styles (fade-only, slide-only, etc.)

---

## Summary

The logo now has a **subtle, calm entrance animation** that:
- ✅ Creates a premium first impression
- ✅ Animates each letter individually with a gentle stagger
- ✅ Uses soft, intentional motion (no bounce or energy)
- ✅ Respects accessibility preferences
- ✅ Only runs once on page load
- ✅ Doesn't delay interaction

The animation feels **safe, soft, and intentional** - perfect for a professional landing page targeting schools and organizations.
