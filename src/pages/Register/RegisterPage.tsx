import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './register.css';

/**
 * RegisterPage - Separate registration flow
 * 
 * Supports ?role=child from landing "Skapa konto" so barn can pre-select child role.
 */
export function RegisterPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [role, setRole] = useState<'child' | 'parent'>('child');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'child' || r === 'parent') setRole(r);
  }, [searchParams]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!username) {
      setError('Användarnamn krävs');
      return;
    }
    
    if (!password) {
      setError('Lösenord krävs');
      return;
    }

    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: username, 
          password: password, 
          role: role,
          name: name || username,
          classCode: role === 'child' ? classCode : undefined,
        }),
      });
      
      const text = await r.text();
      let d;
      try {
        d = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('[Register] JSON parse error:', parseErr, 'Response:', text);
        setError('Ogiltigt svar från servern');
        return;
      }

      if (r.ok) {
        // Logga in med samma uppgifter så session och cookie sätts
        const loginResult = await login({ username, password });
        if (loginResult.success) {
          const redirectPath = d.role === 'child' ? '/dashboard' : '/parent';
          setTimeout(() => nav(redirectPath), 100);
        } else {
          setError(loginResult.error || 'Registrering lyckades men inloggning misslyckades.');
        }
      } else {
        const errorMsg = d?.message || d?.error || 'Registrering misslyckades';
        if (d?.error === 'email_exists') {
          setError('Detta användarnamn finns redan. Logga in istället.');
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Ett fel uppstod: ' + (err instanceof Error ? err.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }

  const errorId = 'register-error';
  const usernameId = 'register-username';
  const passwordId = 'register-password';
  const nameId = 'register-name';
  const classCodeId = 'register-classcode';

  return (
    <div className="register-page">
      <div className="register-container">
        <Link to="/login" className="register-back">
          ← Tillbaka
        </Link>
        
        <form onSubmit={handleRegister} className="register-form" noValidate>
          <h1 className="register-title">Skapa konto</h1>
          
          <div 
            id={errorId}
            className="register-error" 
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {error && error}
          </div>

          <div className="register-role-select">
            <button
              type="button"
              className={`register-role-btn ${role === 'child' ? 'active' : ''}`}
              onClick={() => setRole('child')}
            >
              Barn
            </button>
            <button
              type="button"
              className={`register-role-btn ${role === 'parent' ? 'active' : ''}`}
              onClick={() => setRole('parent')}
            >
              Förälder
            </button>
          </div>

          <div>
            <label htmlFor={usernameId} className="sr-only">
              Användarnamn
            </label>
            <input
              id={usernameId}
              type="text"
              className="register-input"
              placeholder="Användarnamn"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              autoComplete="username"
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
              className="register-input"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : undefined}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor={nameId} className="sr-only">
              Namn (valfritt)
            </label>
            <input
              id={nameId}
              type="text"
              className="register-input"
              placeholder="Namn (valfritt)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </div>

          {role === 'child' && (
            <div>
              <label htmlFor={classCodeId} className="sr-only">
                Klasskod (valfritt)
              </label>
              <input
                id={classCodeId}
                type="text"
                className="register-input"
                placeholder="Klasskod (valfritt)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                autoComplete="off"
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Skapar konto...' : 'Skapa konto'}
          </button>
        </form>

        <div className="register-footer">
          <span className="register-footer-text">Har du redan ett konto?</span>
          <Link to="/login" className="register-link">
            Logga in
          </Link>
        </div>
      </div>
    </div>
  );
}

