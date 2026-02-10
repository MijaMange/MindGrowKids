import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { RegisterModal } from '../../components/RegisterModal/RegisterModal';
import './login.css';

/**
 * LoginPage - Minimal, calm, universal login
 * 
 * Design principles:
 * - Only two inputs: Username and Password
 * - One primary button: "Logga in"
 * - No role selection, no explanations
 * - Calm, confident, child-safe
 * - Feels like entering a safe space
 */
export function LoginPage() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  const nav = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // Conditional redirect is fine AFTER all hooks have been called
  // If already authenticated, redirect to hub
  if (user) {
    nav('/hub', { replace: true });
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('E-post och lösenord krävs');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username, password });
      if (result.success) {
        const from = (location.state as any)?.from?.pathname;
        const redirectPath = from || '/hub';
        nav(redirectPath, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ett fel uppstod: ' + (err instanceof Error ? err.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }

  const errorId = 'login-error';
  const usernameId = 'login-username';
  const passwordId = 'login-password';

  return (
    <div className="login-page">
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form" noValidate>
          <h1 className="login-title">Logga in</h1>
          
          <div 
            id={errorId}
            className="login-error" 
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {error && error}
          </div>

          <div>
            <label htmlFor={usernameId} className="sr-only">
              E-post
            </label>
            <input
              id={usernameId}
              type="email"
              className="login-input"
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
              className="login-input"
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
          
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="login-link"
            onClick={() => setShowRegister(true)}
          >
            Skapa konto
          </button>
        </div>
      </div>

      {/* Skapa konto som popup ovanpå sidan */}
      {typeof document !== 'undefined' && document.body && showRegister && createPortal(
        <RegisterModal
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSuccess={() => {}}
          onOpenLogin={() => setShowRegister(false)}
        />,
        document.body
      )}
    </div>
  );
}
