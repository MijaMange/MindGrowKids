import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
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
  const errorId = 'login-modal-error';
  const usernameId = 'login-modal-username';
  const passwordId = 'login-modal-password';

  // Focus trap for accessibility
  const modalRef = useFocusTrap(isOpen, onClose);

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
      const result = await login({ username: username.trim(), password });
      if (result.success) {
        onSuccess();
        onClose();
        console.log('[LoginModal] Login successful, navigating to /hub');
        setTimeout(() => {
          navigate('/hub', { replace: true });
        }, 50);
      } else {
        setError(result.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Okänt fel';
      const isNetwork = /ansluta|nätverk|network|failed to fetch/i.test(msg);
      setError(isNetwork
        ? 'Kunde inte ansluta. Kontrollera att servern körs (t.ex. backend på port 4000).'
        : 'Ett fel uppstod: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div 
        ref={modalRef}
        className="login-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="login-modal-close" 
          onClick={onClose} 
          aria-label="Stäng inloggningsdialog"
        >
          ×
        </button>
        <h2 id="login-modal-title" className="login-modal-title">Logga in</h2>
        <form onSubmit={handleSubmit} className="login-modal-form" noValidate>
          <div>
            <label htmlFor={usernameId} className="sr-only">
              E-post
            </label>
            <input
              id={usernameId}
              type="text"
              className="login-modal-input"
              placeholder="E-post"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : undefined}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor={passwordId} className="sr-only">
              Lösenord
            </label>
            <input
              id={passwordId}
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
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : undefined}
              disabled={loading}
            />
          </div>
          <div 
            id={errorId}
            className="login-modal-error" 
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {error && error}
          </div>
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

