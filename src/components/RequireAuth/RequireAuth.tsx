import { useAuth } from '../../auth/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * RequireAuth - Simple auth guard using React Router Outlet pattern
 * 
 * CRITICAL: Only uses useAuth() hook at the top
 * No extra hooks, no conditional hooks
 * Follows Rules of Hooks strictly
 * 
 * Uses <Outlet /> pattern so React Router doesn't render children
 * until auth is confirmed
 */
export function RequireAuth() {
  // ALL hooks must be called at the top, before any conditional returns
  const { user } = useAuth();

  // CRITICAL: If no user, redirect to landing page
  // Return Navigate BEFORE <Outlet /> to prevent children from rendering
  // This prevents hook ordering issues when user is null
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render child routes via Outlet
  return <Outlet />;
}

