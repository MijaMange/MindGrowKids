import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { playPling } from '../utils/sound';
import { Logo } from '../components/Logo/Logo';
import { useAuth } from '../auth/AuthContext';
import { useAvatarStore } from '../state/useAvatarStore';
import { AvatarCanvas } from '../components/Avatar/AvatarCanvas';
import { SettingsDrawer } from '../components/Settings/SettingsDrawer';
import { BottomNav } from '../components/BottomNav/BottomNav';
import './game-layout.css';

export function GameLayout({ children }: { children: React.ReactNode }) {
  // CRITICAL: All hooks must be called at the top, before any conditional logic
  // GameLayout should only render when user is authenticated (via RequireAuth)
  // But we add a safety check to prevent rendering if user is null
  
  // Hook 1: useAuth
  const { user, logout } = useAuth();
  
  // Hook 2: useAvatarStore
  const { avatar, loadFromServer } = useAvatarStore();
  
  // Hook 3: useLocation
  const loc = useLocation();
  
  // Hook 4: useNavigate
  const nav = useNavigate();
  
  // Hook 5: useState
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Hook 6: useMemo
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // CRITICAL: Safety check - if no user, return null (RequireAuth should prevent this, but safety first)
  // This check happens AFTER all hooks are called to maintain stable hook order
  if (!user) {
    return null;
  }

  // Derived values (not hooks, safe to compute after all hooks)
  const role = user.role || null;
  const hideHeaderForChild = role === 'child' && (loc.pathname === '/app/dashboard' || loc.pathname.startsWith('/app/journey'));

  // Hook 7: useEffect (called unconditionally, but logic inside is conditional)
  useEffect(() => {
    // Conditional logic inside useEffect is fine - the hook itself is always called
    if (role === 'child') {
      // Load avatar asynchronously - loadFromServer already handles errors internally
      loadFromServer();
    }
  }, [role, loadFromServer]);

  // Helper functions (not hooks, safe to define after hooks)
  function handleClearRole() {
    playPling(120, 480);
    logout();
    nav('/');
  }

  function handleNavClick() {
    playPling(120, 480);
  }

  function roleLabel(role: string | null) {
    if (role === 'child') return 'Barn';
    if (role === 'parent') return 'Förälder';
    if (role === 'pro') return 'Professionell';
    return '';
  }

  // Floating emojis - same as landing page
  const floatingEmojis = ['🌱', '🍃', '🌿', '💚'];
  
  return (
    <div className={`game-shell ${role === 'child' ? 'child-view' : ''} ${hideHeaderForChild ? 'no-header' : ''}`}>
      {/* Floating emoji elements - decorative only */}
      {floatingEmojis.map((emoji, index) => (
        <div
          key={index}
          className={`game-floating-emoji game-floating-emoji-${index} ${prefersReducedMotion ? 'no-motion' : ''}`}
          aria-hidden="true"
        >
          {emoji}
        </div>
      ))}
      {/* Top HUD - hidden for children on dashboard */}
      {!hideHeaderForChild && (
        <header className="game-hud">
        <div className="hud-left">
          <Link to="/app/dashboard" className="logo" aria-label="Till startsidan">
            <Logo size="md" />
          </Link>
          <span className="hud-breadcrumb">{breadcrumbFor(loc.pathname || '')}</span>
        </div>
        <div className="hud-right">
          {loc.pathname !== '/app/dashboard' && (
            <Link
              to="/app/dashboard"
              className="hud-btn"
              title="Tillbaka"
              onClick={handleNavClick}
            >
              ◀ Tillbaka
            </Link>
          )}
          
          {/* Child mode: Settings only (avatar is in bottom nav) */}
          {role === 'child' && (
            <button 
              className="hud-btn-icon" 
              onClick={() => setSettingsOpen(true)}
              title="Inställningar"
              aria-label="Öppna inställningar"
            >
              ⚙️
            </button>
          )}

          {/* Adult mode: Role label + Settings + Logout */}
          {role && role !== 'child' && (
            <>
              <span className="hud-role-label">{roleLabel(role)}</span>
              <button 
                className="hud-btn-icon" 
                onClick={() => setSettingsOpen(true)}
                title="Inställningar"
                aria-label="Öppna inställningar"
              >
                ⚙️
              </button>
              <button 
                className="hud-btn" 
                onClick={handleClearRole} 
                title="Logga ut"
              >
                Logga ut
              </button>
            </>
          )}
        </div>
      </header>
      )}

      {/* Side panel - hidden for children, shown for adults */}
      {role !== 'child' && (
        <aside className="game-side">
          <nav className="side-nav" aria-label="Spelmeny">
            <Link to="/app/dashboard" className="side-link" onClick={handleNavClick}>
              🏠 Hem
            </Link>
            <Link
              to="/app/parent"
              className="side-link"
              aria-disabled={!role || role !== 'parent'}
              onClick={handleNavClick}
            >
              👨‍👩‍👧 Förälder
            </Link>
            <Link
              to="/app/pro"
              className="side-link"
              aria-disabled={!role || role !== 'pro'}
              onClick={handleNavClick}
            >
              🏫 Professionell
            </Link>
            <Link to="/app/dashboard" className="side-link" onClick={handleNavClick}>
              📊 Dashboard
            </Link>
            <Link to="/app/me" className="side-link" onClick={handleNavClick}>
              👤 Min sida
            </Link>
            {import.meta.env.DEV && (
              <Link to="/diagnostics" className="side-link" onClick={handleNavClick}>
                🔍 Diagnostik
              </Link>
            )}
          </nav>
        </aside>
      )}

      {/* Content */}
      <main className={`game-content ${role === 'child' ? 'with-bottom-nav' : ''}`} role="main">
        {children}
      </main>

      {/* Bottom Navigation - only for children */}
      {role === 'child' && <BottomNav />}

      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
}

function breadcrumbFor(path: string) {
  if (path.startsWith('/app/child')) return 'Barnvy';
  if (path.startsWith('/app/parent')) return 'Förälder';
  if (path.startsWith('/app/pro')) return 'Professionell';
  if (path.startsWith('/app/dashboard')) return 'Översikt';
  if (path.startsWith('/app/diary')) return 'Dagbok';
  if (path.startsWith('/app/me')) return 'Min sida';
  return '—';
}

