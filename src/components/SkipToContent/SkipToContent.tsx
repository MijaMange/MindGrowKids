import './SkipToContent.css';

/**
 * SkipToContent - "Skip to main content" link for keyboard navigation
 * 
 * Accessibility: Allows keyboard users to skip repetitive navigation
 * and jump directly to the main content area.
 * 
 * Visible only when focused (keyboard navigation).
 */
export function SkipToContent() {
  return (
    <a href="#main-content" className="skip-to-content">
      Hoppa till huvudinnehåll
    </a>
  );
}
