import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MindGrowLogo } from '../../components/Logo/MindGrowLogo';
import { LoginModal } from '../../components/LoginModal/LoginModal';
import { RegisterModal } from '../../components/RegisterModal/RegisterModal';
import { useAuth } from '../../auth/AuthContext';
import './LandingPage.css';

/**
 * LandingPage - Public entry point for adult users (schools, teachers, decision-makers)
 * 
 * All CTAs open popup modals (like Logga in), no full-page navigation:
 * - Primary: "Logga in" (LoginModal)
 * - Subtle next to it: "Skapa konto" (RegisterModal)
 * - At bottom: "Abonnemang för skolor och verksamheter" (school modal)
 */
export function LandingPage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Open school modal when arriving with ?show=verksamhet or ?context=school_linked
  useEffect(() => {
    if (searchParams.get('show') === 'verksamhet' || searchParams.get('context') === 'school_linked') setShowSchoolModal(true);
  }, [searchParams]);

  // Redirect to hub if user is logged in (but not when they came to see verksamhet modal)
  useEffect(() => {
    const showVerksamhet = searchParams.get('show') === 'verksamhet' || searchParams.get('context') === 'school_linked';
    if (user && !showLogin && !showVerksamhet) {
      console.log('[LandingPage] User logged in, redirecting to /hub');
      navigate('/hub', { replace: true });
    }
  }, [user, navigate, showLogin, searchParams]);

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

      {/* Content - centered column, no card */}
      <div className="landing-content">
        {/* Eyebrow label */}
        <p className="landing-eyebrow">
          För skolor och verksamheter
        </p>
        
        {/* Main headline */}
        <h1 className="landing-headline">
          Emotionell utveckling i skolan
        </h1>
        
        {/* Logo block with entrance animation */}
        <div className="landing-logo">
          <MindGrowLogo 
            variant="dark" 
            size="lg" 
            animateLetters={true}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
        
        {/* Supporting paragraph */}
        <p className="landing-body">
          MindGrow hjälper barn att förstå, uttrycka och följa sina känslor över tid –
          samtidigt som vuxna kan se mönster och stötta när det behövs.
        </p>
        
        {/* CTA Section – Logga in + Skapa konto i samma rad */}
        <div className="landing-cta-section">
          <div className="landing-cta-row">
            <button
              className="landing-btn-primary"
              onClick={() => setShowLogin(true)}
            >
              Logga in
            </button>
            <button
              type="button"
              className="landing-cta-register"
              onClick={() => setShowRegister(true)}
            >
              Skapa konto
            </button>
          </div>
          <button
            type="button"
            className="landing-cta-school-text"
            onClick={() => setShowSchoolModal(true)}
          >
            Abonnemang för skolor och verksamheter
          </button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Register Modal (popup som Logga in) */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={handleLoginSuccess}
        onOpenLogin={() => setShowLogin(true)}
        defaultRole="child"
      />

      {/* Skolor & verksamheter – popup som Logga in */}
      {showSchoolModal && (
        <div
          className="landing-school-modal-backdrop"
          onClick={() => { setShowSchoolModal(false); if (searchParams.get('show') || searchParams.get('context')) setSearchParams({}, { replace: true }); }}
          onKeyDown={(e) => { if (e.key === 'Escape') { setShowSchoolModal(false); if (searchParams.get('show') || searchParams.get('context')) setSearchParams({}, { replace: true }); } }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="school-modal-title"
        >
          <div
            className="landing-school-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="landing-school-modal-header">
              <h2 id="school-modal-title">Abonnemang för skolor</h2>
              <button
                type="button"
                className="landing-school-modal-close"
                onClick={() => { setShowSchoolModal(false); if (searchParams.get('show') || searchParams.get('context')) setSearchParams({}, { replace: true }); }}
                aria-label="Stäng"
              >
                ×
              </button>
            </div>
            <p className="landing-school-modal-intro">Välj plan.</p>
            <div className="landing-school-modal-cards">
              {/* Klass (enskild lärare) – single teacher, no school connection. Hidden/disabled when school exists. */}
              {(() => {
                const schoolLinked = searchParams.get('context') === 'school_linked';
                if (schoolLinked) {
                  return (
                    <div className="landing-school-card landing-school-card-disabled">
                      <p className="landing-school-card-school-message">
                        Din skola använder MindGrow. Kontakta ansvarig eller gå med via skolans konto.
                      </p>
                      <button type="button" className="landing-school-card-cta" onClick={() => { setShowSchoolModal(false); setShowLogin(true); }}>
                        Starta verksamhet
                      </button>
                    </div>
                  );
                }
                return (
                  <div className="landing-school-card landing-school-card-individual">
                    <h3 className="landing-school-card-title">Klass (enskild lärare)</h3>
                    <p className="landing-school-card-price">49 kr / elev / månad</p>
                    <p className="landing-school-card-note">För en lärare som använder MindGrow själv med en klass.</p>
                    <ul className="landing-school-card-list">
                      <li>En klass</li>
                      <li>En lärare</li>
                      <li>Ingen skolkoppling</li>
                      <li>För piloter eller enskild användning</li>
                    </ul>
                    <button type="button" className="landing-school-card-cta landing-school-card-cta-secondary" onClick={() => { setShowSchoolModal(false); setShowLogin(true); }}>
                      Starta klass
                    </button>
                  </div>
                );
              })()}
              {/* Verksamhet – school/organization, visually dominant, recommended */}
              <div className="landing-school-card landing-school-card-featured">
                <span className="landing-school-card-badge" aria-hidden="true">Rekommenderas</span>
                <h3 className="landing-school-card-title">Verksamhet</h3>
                <p className="landing-school-card-price">Från 2 990 kr / månad</p>
                <p className="landing-school-card-note">För skolor och verksamheter med flera klasser.</p>
                <ul className="landing-school-card-list">
                  <li>Alla klasser</li>
                  <li>Alla lärare</li>
                  <li>Ledning får översikt</li>
                </ul>
                <button type="button" className="landing-school-card-cta" onClick={() => { setShowSchoolModal(false); setShowLogin(true); }}>
                  Starta verksamhet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
