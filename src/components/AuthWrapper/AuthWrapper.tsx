import { useAuth } from '../../auth/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * AuthWrapper - Wraps GameLayout and ensures it only renders when authenticated
 * This prevents GameLayout hooks from running when user is not authenticated,
 * which causes React error #310
 * 
 * CRITICAL: This component MUST return early BEFORE rendering children
 * to prevent children's hooks from running when not authenticated
 */
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  // Only use useAuth hook - minimal hooks to avoid React error #310
  const { user, status } = useAuth();

  // CRITICAL: Early returns MUST happen before children are rendered
  // This prevents children (GameLayout) from mounting and running hooks
  
  // Show loader while checking auth
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

  // Redirect if not authenticated - use Navigate component (not a hook)
  // This MUST happen before children are rendered
  if (status === 'guest' || !user) {
    return <Navigate to="/login" replace />;
  }

  // Only render children when authenticated AND status is 'authed'
  // This ensures GameLayout never mounts when user is not authenticated
  if (status !== 'authed' || !user) {
    return null;
  }

  return <>{children}</>;
}

