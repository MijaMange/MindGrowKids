import { useAuth } from '../../auth/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

/**
 * AuthBlock - Blocks rendering of children until user is authenticated
 * 
 * This component prevents React Router from rendering child routes
 * until authentication is confirmed, preventing React error #310
 */
interface AuthBlockProps {
  children: ReactNode;
}

export function AuthBlock({ children }: AuthBlockProps) {
  // ALL hooks must be called at the top
  const { user } = useAuth();
  const location = useLocation();

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Only render children when authenticated
  return <>{children}</>;
}

