import { useAuth } from '../../auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

/**
 * AuthGuard - Route guard that protects routes requiring authentication
 * 
 * This component is used as a route element and ensures that:
 * 1. Children (like GameLayout) are NEVER rendered when user is not authenticated
 * 2. All hooks run in consistent order to avoid React error #310
 * 3. Redirects happen before any child components mount
 */
export function AuthGuard() {
  const { user, status } = useAuth();

  // CRITICAL: Show loader while checking auth - this prevents ANY children from mounting
  // This is essential to prevent React error #310
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

  // CRITICAL: Redirect if not authenticated - return Navigate BEFORE any children mount
  // This MUST happen before <Outlet /> is rendered to prevent GameLayout from mounting
  // Redirect to "/" (landing page with login) instead of "/login" to avoid extra navigation
  if (status !== 'authed' || !user) {
    return <Navigate to="/" replace />;
  }

  // ONLY render children when we are 100% sure user is authenticated
  // Outlet will render the child routes (GameLayout)
  // This ensures GameLayout never mounts when user is not authenticated
  return <Outlet />;
}

