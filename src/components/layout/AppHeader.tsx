import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MindGrowLogo } from '../Logo/MindGrowLogo';
import { useAuth } from '../../auth/AuthContext';
import { useEmojiAvatarStore } from '../../state/useEmojiAvatarStore';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { setMuted, isMuted } from '../../utils/sound';
import './AppHeader.css';

/**
 * AppHeader - Global header with logo and hamburger menu
 * 
 * Features:
 * - Logo button (left) - navigates to hub
 * - Hamburger menu button (right) - opens navigation drawer
 * - Navigation drawer with role-based links
 * - Overlay that closes menu on click
 */
export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { emoji, loadFromServer } = useEmojiAvatarStore();
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuteState] = useState(() => isMuted());
  const [calmMode, setCalmMode] = useState(() => localStorage.getItem('mgk-calm-mode') === '1');

  useEffect(() => {
    if (user?.role === 'child') loadFromServer();
  }, [user?.role, loadFromServer]);

  useEffect(() => {
    setMuteState(isMuted());
  }, [location.pathname]);

  useEffect(() => {
    document.body.setAttribute('data-calm', calmMode ? '1' : '0');
  }, [calmMode]);

  function toggleMute() {
    const newVal = !muted;
    setMuteState(newVal);
    setMuted(newVal);
  }

  function toggleCalmMode() {
    const newVal = !calmMode;
    setCalmMode(newVal);
    localStorage.setItem('mgk-calm-mode', newVal ? '1' : '0');
  }

  function handleClose() {
    setIsOpen(false);
  }

  // Focus trap for navigation drawer (must be after handleClose definition)
  const drawerRef = useFocusTrap(isOpen, handleClose);

  function handleOverlayClick(e: React.MouseEvent) {
    // Only close if clicking directly on overlay, not on panel
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
    handleClose();
  }

  // Role-based navigation items
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
      <header className="app-header">
        {/* MindGrow logo (icon + wordmark) – identity and safety */}
        <Link
          to="/hub"
          className="app-header-logo-btn app-header-logo-link"
          aria-label="Gå till översikt"
        >
          <MindGrowLogo variant="dark" size="sm" withWordmark animateLetters={false} />
        </Link>

        <div className="app-header-right">
          {/* Namn + profil – så man ser vem som är inloggad */}
          {user && (
            <>
              {(user.name || user.role === 'child') && (
                <span className="app-header-user-name" aria-hidden="true">
                  {user.name || 'Jag'}
                </span>
              )}
              <button
                type="button"
                className="app-header-profile-btn"
                onClick={() => navigate('/hub')}
                title={user.name ? `Till översikt, ${user.name}` : 'Till översikt'}
                aria-label={user.name ? `Till översikt, ${user.name}` : 'Till översikt'}
              >
                <span className="app-header-profile-icon" aria-hidden="true">{user.role === 'child' ? (emoji || '😊') : '🙂'}</span>
              </button>
            </>
          )}
          {/* Ljud på/av – megafon med kryss när tyst */}
          <button
            type="button"
            className="app-header-sound-btn"
            onClick={toggleMute}
            title={muted ? 'Ljud på' : 'Ljud av'}
            aria-label={muted ? 'Ljud på' : 'Ljud av'}
            aria-pressed={muted}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8v8h2l5 4V4L7 8H5zM19 8l-2 4 2 4 2-4-2-4z" />
              {muted && <line x1="3" y1="21" x2="21" y2="3" strokeWidth="2.2" />}
            </svg>
          </button>

          {/* Hamburger menu button */}
          <button
            className="app-header-menu-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Öppna meny"
            aria-expanded={isOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Overlay + Navigation Panel – portal till body så menyn alltid är i viewport på mobil */}
      {isOpen && createPortal(
        <div 
          className="app-header-overlay" 
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label="Navigationsmeny"
        >
          <nav 
            ref={drawerRef}
            className="app-header-nav-panel" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="app-header-close-btn"
              onClick={handleClose}
              aria-label="Stäng navigationsmeny"
            >
              ×
            </button>

            {/* Navigation items */}
            <ul className="app-header-nav-list">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    onClick={handleClose}
                    className={`app-header-nav-link ${
                      location.pathname === item.to ? 'active' : ''
                    }`}
                  >
                    <span className="nav-link-icon">{item.icon}</span>
                    <span className="nav-link-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Adult settings – only for parent/pro, not shown to children */}
            {(user?.role === 'parent' || user?.role === 'pro') && (
              <div className="app-header-nav-adult-settings">
                <Link
                  to="/app/settings"
                  onClick={handleClose}
                  className={`app-header-nav-link app-header-nav-link-adult ${
                    location.pathname === '/app/settings' ? 'active' : ''
                  }`}
                >
                  <span className="nav-link-icon nav-link-icon-gear" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </span>
                  <span className="nav-link-label">Vuxeninställningar</span>
                </Link>
              </div>
            )}

            {/* Calm mode toggle */}
            <div className="app-header-nav-calm">
              <button
                type="button"
                className="app-header-calm-btn"
                onClick={toggleCalmMode}
                aria-pressed={calmMode}
                title={calmMode ? 'Normal visning' : 'Lugn visning'}
              >
                <span className="app-header-calm-icon" aria-hidden="true">{calmMode ? '🌙' : '☀'}</span>
                <span className="app-header-calm-label">{calmMode ? 'Lugn visning' : 'Normal visning'}</span>
              </button>
            </div>

            {/* Logout button */}
            <div className="app-header-nav-footer">
              <button
                className="app-header-logout-btn"
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


