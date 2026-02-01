import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
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

  // Conditional redirect is fine AFTER all hooks have been called
  // If already authenticated, redirect to hub
  if (user) {
    nav('/test-hub', { replace: true });
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Användarnamn och lösenord krävs');
      return;
    }

    setLoading(true);
    try {
      // Use login function from AuthContext
      const success = await login({ username, password });
      if (success) {
        // Redirect to test-hub (new minimal hub)
        const from = (location.state as any)?.from?.pathname;
        const redirectPath = from || '/test-hub';
        nav(redirectPath, { replace: true });
      } else {
        setError('Fel användarnamn eller lösenord');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ett fel uppstod: ' + (err instanceof Error ? err.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h1 className="login-title">Logga in</h1>
          
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <input
            type="text"
            className="login-input"
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
            className="login-input"
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
          
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/register" className="login-link">
            Skapa konto
          </Link>
        </div>
      </div>
    </div>
  );
}
