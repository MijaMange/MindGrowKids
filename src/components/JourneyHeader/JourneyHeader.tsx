import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useEmojiAvatarStore } from '../../state/useEmojiAvatarStore';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { LogoIcon } from '../Logo/LogoIcon';
import './JourneyHeader.css';

interface JourneyHeaderProps {
  /** Step indicator "Steg X/Y" – omit if title is set or showStepCounter is false */
  currentStep?: number;
  totalSteps?: number;
  /** Optional title in center instead of step indicator (e.g. "Jag") */
  title?: string;
  /** When false, never show "Steg X/Y" (child-friendly) */
  showStepCounter?: boolean;
  onBack: () => void;
  hasDrawing?: boolean;
  hasWriting?: boolean;
  /** Opens "Mina sparade saker" modal (folder button on journey) */
  onFolderClick?: () => void;
}

/**
 * JourneyHeader - Pure navigation header for emotion journey
 * 
 * Features:
 * - Left: Back arrow button (icon-only)
 * - Center: Step indicator "Steg X/Y" (no question text)
 * - Right: Profile button (avatar/icon) + Hamburger menu
 * - Consistent across all journey steps
 */
export function JourneyHeader({ 
  currentStep, 
  totalSteps, 
  title,
  showStepCounter = true,
  onBack,
  hasDrawing = false,
  hasWriting = false,
  onFolderClick,
}: JourneyHeaderProps) {
  const navigate = useNavigate();
  const showStep = showStepCounter && title == null && currentStep != null && totalSteps != null;
  const { user, logout } = useAuth();
  const { emoji, loadFromServer } = useEmojiAvatarStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerRef = useFocusTrap(isMenuOpen, () => setIsMenuOpen(false));

  useEffect(() => {
    if (user?.role === 'child') loadFromServer();
  }, [user?.role, loadFromServer]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
    setIsMenuOpen(false);
  }

  // Role-based navigation items (mappen med teckningar alltid nåbar)
  const navItems = user?.role === 'child' 
    ? [
        { icon: '🏠', label: 'Översikt', to: '/hub' },
        { icon: '💬', label: 'Hur känner jag mig idag?', to: '/app/journey-simple' },
        { icon: '📅', label: 'Mina dagar', to: '/app/diary-simple' },
        { icon: emoji || '😊', label: 'Jag', to: '/app/avatar-simple' },
        { icon: '🔗', label: 'Länkkod', to: '/app/child-link' },
        { icon: '⚙️', label: 'Inställningar', to: '/app/settings' },
      ]
    : user?.role === 'parent'
    ? [
        { icon: '🏠', label: 'Översikt', to: '/hub' },
        { icon: '👨‍👩‍👧', label: 'Mina barn', to: '/app/parent-children' },
      ]
    : user?.role === 'pro'
    ? [
        { icon: '🏠', label: 'Översikt', to: '/hub' },
        { icon: '🏫', label: 'Klassens statistik', to: '/app/pro-simple' },
        { icon: '📘', label: 'Klassens dagbok', to: '/app/pro-diary-simple' },
      ]
    : [
        { icon: '🏠', label: 'Översikt', to: '/hub' },
      ];

  return (
    <>
      <header className="journey-header">
        {/* Left: Back button (icon-only) */}
        <button
          className="journey-header-back"
          onClick={onBack}
          aria-label="Tillbaka"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Center: Step indicator or title */}
        <div className="journey-header-step">
          {showStep ? `Steg ${currentStep}/${totalSteps}` : (title ?? '')}
        </div>

        {/* Right: Folder + Profile + Hamburger */}
        <div className="journey-header-right">
          {/* Folder button – always visible when on journey so "Mina sparade saker" is reachable */}
          {onFolderClick && (
            <button
              className="journey-header-folder"
              onClick={onFolderClick}
              aria-label="Visa sparade teckningar och anteckningar"
            >
              <span className="folder-icon-small">📁</span>
              {(hasDrawing || hasWriting) && (
                <span className="folder-badge-small">
                  {hasDrawing && hasWriting ? '2' : '1'}
                </span>
              )}
            </button>
          )}

          {/* Användarnamn + profil (emoji) – så man ser vem som är inloggad */}
          {(user?.name || user?.role === 'child') && (
            <span className="journey-header-name" aria-hidden="true">
              {user?.name || 'Jag'}
            </span>
          )}
          <button
            className="journey-header-profile"
            onClick={() => navigate('/app/avatar-simple')}
            aria-label={user?.name ? `Min profil, ${user.name}` : 'Min profil'}
          >
            <span className="profile-icon">{user?.role === 'child' ? (emoji || '😊') : '🙂'}</span>
          </button>

          {/* Hamburger menu button */}
          <button
            className="journey-header-menu"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Öppna meny"
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Navigation drawer – portal till body så den alltid är i viewport (fixar mobil “utanför åt vänster”) */}
      {isMenuOpen && createPortal(
        <div 
          className="journey-header-overlay" 
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label="Navigationsmeny"
        >
          <nav 
            ref={drawerRef}
            className="journey-header-nav-panel" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="journey-header-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Stäng navigationsmeny"
            >
              ×
            </button>

            {/* Navigation items */}
            <ul className="journey-header-nav-list">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="journey-header-nav-link"
                  >
                    <span className="nav-link-icon">{item.icon}</span>
                    <span className="nav-link-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Logout button */}
            <div className="journey-header-nav-footer">
              <button
                className="journey-header-logout"
                onClick={handleLogout}
              >
                Logga ut
              </button>
            </div>
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}
