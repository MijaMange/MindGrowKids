import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { LogoIcon } from '../Logo/LogoIcon';
import { useAuth } from '../../auth/AuthContext';
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
  const [isOpen, setIsOpen] = useState(false);

  function handleClose() {
    setIsOpen(false);
  }

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
        { icon: '🙂', label: 'Jag', to: '/app/avatar-simple' },
      ]
    : user?.role === 'parent'
    ? [
        { icon: '🏠', label: 'Översikt', to: '/hub' },
        { icon: '👨‍👩‍👧', label: 'Mina barn', to: '/app/parent-children' },
        { icon: '📘', label: 'Dagbok', to: '/app/parent-diary-simple' },
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
        {/* Logo button */}
        <button
          className="app-header-logo-btn"
          onClick={() => navigate('/hub')}
          aria-label="Gå till översikt"
        >
          <LogoIcon variant="dark" size="md" />
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
      </header>

      {/* Overlay + Navigation Panel */}
      {isOpen && (
        <div className="app-header-overlay" onClick={handleOverlayClick}>
          <nav className="app-header-nav-panel" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              className="app-header-close-btn"
              onClick={handleClose}
              aria-label="Stäng meny"
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
        </div>
      )}
    </>
  );
}


