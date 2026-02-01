import { useAuth } from '../../auth/AuthContext';
import { GameLayout } from '../../layout/GameLayout';
import { Outlet } from 'react-router-dom';

/**
 * GameLayoutWrapper - Wraps GameLayout and ensures it only renders when authenticated
 * 
 * This component is CRITICAL to prevent React error #310:
 * - It checks auth status BEFORE rendering GameLayout
 * - GameLayout hooks never run when user is not authenticated
 * - This prevents hook order issues when components unmount during redirect
 */
export function GameLayoutWrapper() {
  const { user, status } = useAuth();

  // CRITICAL: Do NOT render GameLayout if user is not authenticated or still loading
  // This prevents GameLayout hooks from running when user is not authenticated
  // AuthGuard should handle this, but this is a safety check
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(250, 252, 250, 0.98)',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#1a5e3d',
          fontSize: '1.1rem',
        }}>
          Laddar...
        </div>
      </div>
    );
  }

  if (status !== 'authed' || !user) {
    // Return null - AuthGuard will handle redirect
    // This ensures GameLayout never mounts when user is not authenticated
    return null;
  }

  // ONLY render GameLayout when user is authenticated
  // This ensures all hooks in GameLayout run in consistent order
  return (
    <GameLayout>
      <Outlet />
    </GameLayout>
  );
}

