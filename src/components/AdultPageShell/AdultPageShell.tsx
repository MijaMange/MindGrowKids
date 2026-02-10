import { createPortal } from 'react-dom';
import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { MindGrowLogo } from '../Logo/MindGrowLogo';
import { setMuted } from '../../utils/sound';
import '../../pages/ProSimple/ProSimplePage.css';
import './AdultPageShell.css';

function VolumeIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export interface AdultPageShellProps {
  /** T.ex. "Lärarvy" eller "Föräldravy" */
  pillLabel: string;
  /** T.ex. "Översikt", "Klassens dagbok", "Mina barn" */
  title: string;
  children: ReactNode;
}

/**
 * Vuxenskal: samma gröna ton som övriga vyer, MindGrow-logo till vänster, namn + Lärarvy/Föräldravy + full meny.
 */
export function AdultPageShell({ pillLabel, title, children }: AdultPageShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [muted, setMutedState] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMutedState(false);
  }, []);

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  const navItems = user?.role === 'pro'
    ? [
        { icon: '🏠', label: 'Översikt', to: '/hub' },
        { icon: '🏫', label: 'Klassens statistik', to: '/app/pro-simple' },
        { icon: '📘', label: 'Klassens dagbok', to: '/app/pro-diary-simple' },
        { icon: '⚙️', label: 'Inställningar', to: '/app/settings' },
      ]
    : user?.role === 'parent'
    ? [
        { icon: '🏠', label: 'Översikt', to: '/hub' },
        { icon: '👨‍👩‍👧', label: 'Mina barn', to: '/app/parent-children' },
        { icon: '⚙️', label: 'Inställningar', to: '/app/settings' },
      ]
    : [{ icon: '🏠', label: 'Översikt', to: '/hub' }];

  return (
    <div className="pro-class-page">
      <header className="pro-class-header">
        <div className="pro-class-header-left">
          <Link
            to="/hub"
            className="pro-class-logo-link"
            aria-label="Till översikt"
          >
            <MindGrowLogo variant="dark" size="sm" withWordmark animateLetters={false} />
          </Link>
          <span className="pro-class-header-title">{title}</span>
        </div>
        <div className="pro-class-header-right">
          <span className="pro-class-pill pro-class-pill-label">{pillLabel}</span>
          <span className="pro-class-header-name" title={user?.name || undefined}>{user?.name || 'Lärare'}</span>
          <button
            type="button"
            className="pro-class-ghost-btn"
            onClick={toggleMute}
            aria-label={muted ? 'Ljud på' : 'Ljud av'}
          >
            <VolumeIcon muted={muted} />
          </button>
          <button
            type="button"
            className="pro-class-ghost-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Meny"
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {menuOpen && createPortal(
        <div
          className="adult-shell-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Navigationsmeny"
          onClick={() => setMenuOpen(false)}
        >
          <nav
            className="adult-shell-nav-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="adult-shell-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Stäng meny"
            >
              ×
            </button>
            <ul className="adult-shell-nav-list">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`adult-shell-nav-link ${location.pathname === item.to ? 'active' : ''}`}
                  >
                    <span className="adult-shell-nav-icon">{item.icon}</span>
                    <span className="adult-shell-nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="adult-shell-nav-footer">
              <button type="button" className="adult-shell-logout" onClick={handleLogout}>
                Logga ut
              </button>
            </div>
          </nav>
        </div>,
        document.body
      )}

      <main className="pro-class-content">
        {children}
      </main>
    </div>
  );
}
