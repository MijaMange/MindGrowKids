import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * LoginModal - Simple login popup
 * 
 * Only username + password + "Logga in" button
 * Calls login() from AuthContext on success
 */
export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Conditional return is fine AFTER all hooks have been called
  // This ensures hooks are always called in the same order regardless of isOpen
  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Användarnamn och lösenord krävs');
      return;
    }

    setLoading(true);
    try {
      const success = await login({ username, password });
      if (success) {
        // Close modal first
        onSuccess();
        onClose();
        // Navigate to hub after successful login
        // Use setTimeout to ensure state is fully updated
        console.log('[LoginModal] Login successful, navigating to /hub');
        setTimeout(() => {
          navigate('/hub', { replace: true });
        }, 50);
      } else {
        setError('Fel användarnamn eller lösenord');
      }
    } catch (err) {
      setError('Ett fel uppstod: ' + (err instanceof Error ? err.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose} aria-label="Stäng">
          ×
        </button>
        <h2 className="login-modal-title">Logga in</h2>
        <form onSubmit={handleSubmit} className="login-modal-form">
          <input
            type="text"
            className="login-modal-input"
            placeholder="Användarnamn"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            autoComplete="username"
            required
            disabled={loading}
          />
          <input
            type="password"
            className="login-modal-input"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            autoComplete="current-password"
            required
            disabled={loading}
          />
          {error && <p className="login-modal-error">{error}</p>}
          <button
            type="submit"
            className="login-modal-button"
            disabled={loading}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  );
}

