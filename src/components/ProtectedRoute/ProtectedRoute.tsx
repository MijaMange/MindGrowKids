import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allow?: ('child' | 'parent' | 'pro')[];
  redirectTo?: string;
}

/**
 * ProtectedRoute - Handles authentication and authorization
 * 
 * - Shows loader while auth status is loading
 * - Redirects guests to login
 * - Checks role permissions if allow prop is provided
 * - Never crashes, always handles null user gracefully
 */
export function ProtectedRoute({ 
  children, 
  allow,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  // ALL hooks must be called before any early returns
  const { user, status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loader while checking auth status - MUST be before useEffect to prevent hook order issues
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

  // Redirect guests to login using useEffect - MUST be after early return for loading
  useEffect(() => {
    if (status === 'guest' || !user) {
      navigate(redirectTo, { replace: true, state: { from: location } });
    }
  }, [status, user, navigate, redirectTo, location]);

  // Don't render children if not authenticated (redirect will happen via useEffect)
  // Return null immediately to prevent children from rendering and causing hook issues
  if (status === 'guest' || !user) {
    return null;
  }

  // Check role permissions if allow prop is provided
  if (allow && user.role && !allow.includes(user.role)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(250, 252, 250, 0.98)',
        padding: '24px',
      }}>
        <div style={{
          maxWidth: '500px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#1a5e3d', marginTop: 0 }}>Ingen behörighet</h2>
          <p style={{ color: '#2e7d32', marginBottom: '8px' }}>
            Du har roll: <strong>{user.role}</strong>
          </p>
          <p style={{ color: '#2e7d32', marginBottom: '24px' }}>
            Denna sida kräver: {allow.join(' eller ')}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.9), rgba(56, 239, 125, 0.9))',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Logga in igen
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
}

