import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { MindGrowLogo } from '../../components/Logo/MindGrowLogo';
import { LoginModal } from '../../components/LoginModal/LoginModal';
import { useAuth } from '../../auth/AuthContext';
import './LandingPage.css';

/**
 * LandingPage - Public entry point
 * 
 * Design principles:
 * - Logo and single CTA button "Börja här"
 * - Clicking button opens LoginModal (popup)
 * - No auth checks, no protected components
 * - Clean, simple, public-facing
 */
export function LandingPage() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  // Hook 1: useNavigate
  const navigate = useNavigate();
  // Hook 2: useState
  const [showLogin, setShowLogin] = useState(false);
  // Hook 3: useAuth (to check if user is logged in)
  const { user } = useAuth();
  // Hook 4: useMemo
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Hook 5: useEffect - redirect to hub if user is logged in (but not during login flow)
  // Only redirect if user is already logged in when landing page loads
  // LoginModal handles navigation after successful login
  useEffect(() => {
    // Only auto-redirect if user is already logged in (e.g., direct navigation to /)
    // Don't redirect during active login flow - LoginModal handles that
    if (user && !showLogin) {
      console.log('[LandingPage] User logged in, redirecting to /hub');
      navigate('/hub', { replace: true });
    }
  }, [user, navigate, showLogin]);

  function handleLoginSuccess() {
    // Don't navigate here - let useEffect handle it when user state updates
    // This prevents timing issues with React state updates
  }

  // Floating emojis - very slow, low opacity, decorative only
  const floatingEmojis = ['🌱', '🍃', '🌿', '💚'];
  
  return (
    <div className="landing-container">
      {/* Breathing background gradient */}
      <div 
        className={`landing-bg-gradient ${prefersReducedMotion ? 'no-motion' : ''}`}
        aria-hidden="true"
      />
      
      {/* Floating emoji elements - decorative only */}
      {floatingEmojis.map((emoji, index) => (
        <div
          key={index}
          className={`floating-emoji floating-emoji-${index} ${prefersReducedMotion ? 'no-motion' : ''}`}
          aria-hidden="true"
        >
          {emoji}
        </div>
      ))}

      {/* Subtle blurred shape layers for depth */}
      <div className="landing-shape-1" aria-hidden="true" />
      <div className="landing-shape-2" aria-hidden="true" />

      {/* Content - centered column, no card */}
      <div className="landing-content">
        {/* Eyebrow label */}
        <p className="landing-eyebrow">
          För skolor, lärare och vuxna runt barn
        </p>
        
        {/* Main headline */}
        <h1 className="landing-headline">
          Emotionell utveckling i skolan
        </h1>
        
        {/* Logo block */}
        <div className="landing-logo">
          <MindGrowLogo variant="dark" size="lg" />
        </div>
        
        {/* Supporting paragraph */}
        <p className="landing-body">
          MindGrow hjälper barn att förstå, uttrycka och följa sina känslor över tid –
          samtidigt som vuxna kan se mönster och stötta när det behövs.
        </p>
        
        {/* Primary CTA */}
        <button
          className="landing-btn-primary"
          onClick={() => setShowLogin(true)}
        >
          Börja här
        </button>
      </div>

      {/* Login Modal - always render (returns null when closed) to maintain stable hook order */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
