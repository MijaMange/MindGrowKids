# Accessibility Improvements

## Summary

This document outlines the accessibility improvements implemented for MindGrow Kids, focusing on high-impact changes that improve keyboard navigation, screen reader support, and form accessibility.

## Changes Made

### 1. Skip to Content Link

**File**: `src/components/SkipToContent/SkipToContent.tsx`

**What**: Global "Skip to main content" link that appears when focused via keyboard navigation.

**Why**: Allows keyboard users to skip repetitive navigation and jump directly to main content, improving efficiency.

**Implementation**:
- Link is hidden by default (`top: -40px`)
- Becomes visible when focused (`top: 0` on focus)
- Links to `#main-content` anchor
- Styled with high contrast colors

**Usage**: Added to `App.tsx` at the top level, before all other content.

### 2. Focus Trap for Modals/Drawers

**File**: `src/hooks/useFocusTrap.ts`

**What**: Custom hook that traps focus within a modal or drawer component.

**Why**: Prevents keyboard users from tabbing outside the modal, ensuring they stay within the interactive area. Also closes on Escape key.

**Features**:
- Traps Tab key within container
- Loops focus (last element → first, first element → last)
- Closes on Escape key
- Auto-focuses first element when opened

**Usage**: Applied to:
- `LoginModal` - Login popup
- `AppHeader` navigation drawer - Hamburger menu panel

### 3. Form Accessibility Improvements

**Files**: 
- `src/components/LoginModal/LoginModal.tsx`
- `src/pages/Login/LoginPage.tsx`
- `src/pages/Register/RegisterPage.tsx`

**What**: Enhanced form fields with proper ARIA attributes and error handling.

**Changes**:

#### a) Labels
- Added hidden labels (`sr-only` class) for all form inputs
- Labels are visually hidden but available to screen readers
- Each input has a unique `id` and corresponding `htmlFor` on label

#### b) Required Fields
- Added `aria-required="true"` to all required inputs
- Keeps native `required` attribute for browser validation

#### c) Error Messages
- Error containers have `role="alert"` and `aria-live="polite"`
- `aria-atomic="true"` ensures entire message is announced
- Inputs use `aria-describedby` to link to error message
- `aria-invalid="true"` when error exists

#### d) Form Validation
- Added `noValidate` to forms (we handle validation manually)
- Error messages are announced immediately via `aria-live`

**Example**:
```tsx
<label htmlFor="username" className="sr-only">Användarnamn</label>
<input
  id="username"
  type="text"
  required
  aria-required="true"
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? 'error-id' : undefined}
/>
<div id="error-id" role="alert" aria-live="polite" aria-atomic="true">
  {error && error}
</div>
```

### 4. Modal/Drawer ARIA Attributes

**Files**:
- `src/components/LoginModal/LoginModal.tsx`
- `src/components/layout/AppHeader.tsx`

**What**: Added proper ARIA attributes to modals and drawers.

**Changes**:
- `role="dialog"` on modal overlay
- `aria-modal="true"` to indicate modal behavior
- `aria-labelledby` pointing to modal title
- `aria-label` on close buttons with descriptive text

**Example**:
```tsx
<div 
  className="modal-overlay" 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Logga in</h2>
  <button aria-label="Stäng inloggningsdialog">×</button>
</div>
```

### 5. Image Alt Text Improvements

**Files**:
- `src/pages/DiarySimple/DiarySimplePage.tsx`
- `src/pages/ProSimple/ProSimplePage.tsx`
- `src/pages/Pro/ProPage.tsx`
- `src/components/Logo/LogoIcon.tsx`

**What**: Enhanced alt text for images to be more descriptive.

**Changes**:
- **Diary drawings**: Changed from `"Ritning"` to `"Ritning från [date]"` (includes date context)
- **QR codes**: Changed from `"QR"` to `"QR-kod för klassloggning"` (describes purpose)
- **Logo icon**: Already had `aria-label="MindGrow logo"`, enhanced to `"MindGrow logotyp"` and added `role="img"`

**Why**: More descriptive alt text helps screen reader users understand the context and purpose of images.

### 6. Main Content Container

**File**: `src/App.tsx`

**What**: Wrapped main routes in `<main id="main-content">` element.

**Why**: 
- Provides semantic landmark for screen readers
- Serves as target for "Skip to content" link
- Improves document structure

## CSS Utilities

### Screen Reader Only Class

Added `.sr-only` class to multiple CSS files:
- `src/components/LoginModal/LoginModal.css`
- `src/pages/Login/login.css`
- `src/pages/Register/register.css`

**Purpose**: Visually hides labels while keeping them accessible to screen readers.

**Implementation**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Testing Recommendations

### Keyboard Navigation
1. Tab through the entire page - focus should be visible and logical
2. Open LoginModal - focus should trap within modal
3. Press Escape in modal - should close
4. Open hamburger menu - focus should trap within drawer
5. Press Escape in drawer - should close
6. Tab to "Skip to content" link - should appear and jump to main content

### Screen Reader
1. Navigate forms - labels should be announced
2. Submit form with errors - error messages should be announced
3. Open modals - modal title should be announced
4. Navigate images - alt text should be descriptive

### Visual
1. Focus indicators should be visible on all interactive elements
2. Error messages should be clearly associated with inputs
3. Skip link should appear when focused

## Compliance

These improvements align with:
- **WCAG 2.1 Level AA** guidelines
- **WAI-ARIA 1.1** best practices
- **Keyboard accessibility** standards

## Future Enhancements

Potential future improvements:
- [ ] High contrast mode support
- [ ] Reduced motion preferences (partially implemented)
- [ ] Focus visible indicators on all interactive elements
- [ ] Form validation announcements
- [ ] Landmark regions (nav, main, aside)
- [ ] Heading hierarchy validation
