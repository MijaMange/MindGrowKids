# Landing Page CTA Structure Redesign

**Date:** 2025-01-27  
**Goal:** Simplify and professionalize the Landing Page CTA structure for adult-facing entry point

---

## Summary of Changes

### 1. Primary CTA
- **Changed**: "Börja här" → "Logga in"
- **Behavior**: Opens LoginModal directly (unchanged)
- **Style**: Remains the most visually prominent button (white background, primary color text)
- **No icon**: Clean text-only button

### 2. Secondary CTA (New)
- **Added**: "För skolor & verksamheter" link
- **Style**: Text-link style, lower emphasis
- **Position**: Below primary CTA, centered
- **Purpose**: For decision-makers/organizations seeking access
- **Current behavior**: Prevents default navigation (TODO: Link to contact/sales page)

### 3. Removed Public Signup
- ✅ No "Skapa konto" button (was already absent)
- ✅ No public self-signup encouragement
- ✅ Account creation remains via schools/admin flows only

### 4. Updated Eyebrow Label
- **Changed**: "För skolor, lärare och vuxna runt barn" → "För skolor och verksamheter"
- **Tone**: More professional, organization-focused

---

## Files Changed

### 1. `src/pages/Landing/LandingPage.tsx`
**Changes:**
- Updated component documentation to reflect adult-facing, professional tone
- Changed primary CTA button text: "Börja här" → "Logga in"
- Added secondary CTA link: "För skolor & verksamheter"
- Wrapped CTAs in `.landing-cta-section` container
- Updated eyebrow label: "För skolor och verksamheter"

**Key Code:**
```tsx
{/* CTA Section */}
<div className="landing-cta-section">
  {/* Primary CTA */}
  <button
    className="landing-btn-primary"
    onClick={() => setShowLogin(true)}
  >
    Logga in
  </button>
  
  {/* Secondary CTA - for schools/organizations */}
  <a
    href="#contact"
    className="landing-cta-secondary"
    onClick={(e) => {
      e.preventDefault();
      // TODO: Link to contact/sales page or open contact form
    }}
  >
    För skolor & verksamheter
  </a>
</div>
```

### 2. `src/pages/Landing/LandingPage.css`
**Changes:**
- Added `.landing-cta-section` styles (flex column, centered, gap)
- Updated `.landing-btn-primary` (removed margin-top, added min-width)
- Added `.landing-cta-secondary` styles (text-link style, subtle hover)
- Added mobile responsive styles for CTA section

**Key Styles:**
```css
/* CTA Section */
.landing-cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: var(--mg-section-gap);
  width: 100%;
}

/* Primary CTA Button - Pill shape */
.landing-btn-primary {
  background: var(--mg-white);
  color: var(--mg-primary-dark);
  /* ... existing styles ... */
  min-width: 200px;
}

/* Secondary CTA - Text link style */
.landing-cta-secondary {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--mg-white);
  text-decoration: none;
  opacity: 0.85;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: var(--mg-radius-sm);
}

.landing-cta-secondary:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  text-decoration: underline;
}
```

---

## UX Principles Applied

### ✅ Calm, Serious, Trustworthy
- Removed casual "Börja här" language
- Professional "Logga in" (standard login terminology)
- Clear separation between existing users and new organizations

### ✅ Adult-Facing Language
- Eyebrow label focuses on organizations ("För skolor och verksamheter")
- No child-facing copy mixed into adult entry points
- Professional tone throughout

### ✅ Clear User Segmentation
1. **Existing users**: "Logga in" (primary, prominent)
2. **New organizations**: "För skolor & verksamheter" (secondary, subtle)

### ✅ No Public Self-Signup
- No "Skapa konto" button
- No encouragement for private individuals to register
- Account creation remains via schools/admin flows only

---

## Visual Hierarchy

### Desktop:
- **Primary CTA**: Large white button, prominent, min-width 200px
- **Secondary CTA**: Smaller text link, subtle, below primary
- **Gap**: 16px between CTAs

### Mobile:
- **Primary CTA**: Full width (max-width constraint), responsive height
- **Secondary CTA**: Smaller font (0.9rem), reduced padding
- **Gap**: 12px between CTAs

---

## Accessibility

- ✅ **ARIA labels**: Button has implicit label ("Logga in")
- ✅ **Keyboard navigation**: Both CTAs are keyboard accessible
- ✅ **Focus indicators**: Clear focus-visible styles
- ✅ **Touch targets**: Primary button meets minimum size (48px height)
- ✅ **Color contrast**: White text on green background (secondary link) meets WCAG AA

---

## Next Steps (Future Enhancements)

1. **Secondary CTA functionality**: 
   - Link to contact/sales page
   - Or open contact form modal
   - Or navigate to dedicated "För skolor" page

2. **Analytics**: Track clicks on secondary CTA to measure interest

3. **A/B testing**: Test different secondary CTA copy:
   - "För skolor & verksamheter"
   - "Välj abonnemang"
   - "För skolor"

---

## Testing Checklist

- [x] Primary CTA button displays "Logga in"
- [x] Primary CTA opens LoginModal on click
- [x] Secondary CTA displays "För skolor & verksamheter"
- [x] Secondary CTA has subtle styling (lower emphasis)
- [x] No "Skapa konto" or signup buttons visible
- [x] Eyebrow label updated to "För skolor och verksamheter"
- [x] Mobile layout works correctly
- [x] Keyboard navigation works
- [x] Focus indicators visible
- [x] Screen reader announces buttons correctly

---

## Summary

The Landing Page now has a **clear, professional CTA structure**:
- ✅ Single primary action: "Logga in" (for existing users)
- ✅ Subtle secondary action: "För skolor & verksamheter" (for new organizations)
- ✅ No public signup (account creation via schools/admin flows)
- ✅ Calm, serious, trustworthy tone
- ✅ Adult-facing language throughout

The page now clearly separates:
1. **Users who already have access** → "Logga in"
2. **Schools/organizations that want access** → "För skolor & verksamheter"

This creates a professional entry point that respects the adult-facing nature of the landing page while maintaining clear paths for both existing users and potential new customers.
