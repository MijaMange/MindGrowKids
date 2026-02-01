import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './register.css';

/**
 * RegisterPage - Separate registration flow
 * 
 * Allows role selection only during registration
 * Keeps login minimal and calm
 */
export function RegisterPage() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [role, setRole] = useState<'child' | 'parent' | 'pro'>('child');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        const userData = { role: d.role, name: d.name, classCode: d.classCode };
        setUser(userData);
        // Redirect based on role
        const redirectPath = d.role === 'child' ? '/dashboard' : d.role === 'parent' ? '/parent' : '/pro';
        setTimeout(() => nav(redirectPath), 100);
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

  return (
    <div className="register-page">
      <div className="register-container">
        <Link to="/login" className="register-back">
          ← Tillbaka
        </Link>
        
        <form onSubmit={handleRegister} className="register-form">
          <h1 className="register-title">Skapa konto</h1>
          
          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

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
            <button
              type="button"
              className={`register-role-btn ${role === 'pro' ? 'active' : ''}`}
              onClick={() => setRole('pro')}
            >
              Lärare
            </button>
          </div>

          <input
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
            disabled={loading}
          />

          <input
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
            disabled={loading}
          />

          <input
            type="text"
            className="register-input"
            placeholder="Namn (valfritt)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
          />

          {role === 'child' && (
            <input
              type="text"
              className="register-input"
              placeholder="Klasskod (valfritt)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              autoComplete="off"
              disabled={loading}
            />
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

