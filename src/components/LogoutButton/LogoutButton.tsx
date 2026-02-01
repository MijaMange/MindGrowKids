import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './LogoutButton.css';

interface LogoutButtonProps {
  className?: string;
}

/**
 * LogoutButton - Återanvändbar logout-knapp
 * 
 * Design principles:
 * - Vit bakgrund, röd text
 * - Soft shadow
 * - Tydlig men inte aggressiv
 */
export function LogoutButton({ className }: LogoutButtonProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <button
      className={`logout-button ${className || ''}`}
      onClick={handleLogout}
    >
      Logga ut
    </button>
  );
}


