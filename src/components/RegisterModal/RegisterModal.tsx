import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './RegisterModal.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Call when user clicks "Logga in" (close register, open login) */
  onOpenLogin?: () => void;
  /** Pre-select role when opening (e.g. from landing) */
  defaultRole?: 'child' | 'parent' | 'pro';
}

/**
 * RegisterModal - Popup for creating account (same style as LoginModal)
 */
export function RegisterModal({ isOpen, onClose, onSuccess, defaultRole = 'child' }: RegisterModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState<'child' | 'parent'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
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
    if (role === 'child' && dateOfBirth.trim()) {
      const d = new Date(dateOfBirth);
      if (Number.isNaN(d.getTime())) {
        setError('Ogiltigt födelsedatum');
        return;
      }
      if (d > new Date()) {
        setError('Födelsedatum kan inte vara i framtiden');
        return;
      }
    }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: username,
          password,
          role,
          name: name || username,
          classCode: role === 'child' ? classCode : undefined,
          dateOfBirth: role === 'child' && dateOfBirth.trim() ? dateOfBirth.trim() : undefined,
        }),
      });
      const text = await r.text();
      let d: { role?: string; message?: string; error?: string } = {};
      try {
        d = text ? JSON.parse(text) : {};
      } catch {
        setError('Ogiltigt svar från servern');
        setLoading(false);
        return;
      }
      if (r.ok) {
        const loginResult = await login({ username, password });
        if (loginResult.success) {
          onSuccess?.();
          onClose();
          const path = d.role === 'child' ? '/hub' : d.role === 'parent' ? '/hub' : '/hub';
          setTimeout(() => navigate(path, { replace: true }), 50);
        } else {
          setError(loginResult.error || 'Registrering lyckades men inloggning misslyckades.');
        }
      } else {
        if (d.error === 'email_exists') setError('Detta användarnamn finns redan. Logga in istället.');
        else setError(d.message || d.error || 'Registrering misslyckades');
      }
    } catch (err) {
      setError('Ett fel uppstod: ' + (err instanceof Error ? err.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="register-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
    >
      <div ref={modalRef} className="register-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="register-modal-close" onClick={onClose} aria-label="Stäng">
          ×
        </button>
        <h2 id="register-modal-title" className="register-modal-title">
          Skapa konto
        </h2>
        <form onSubmit={handleSubmit} className="register-modal-form" noValidate>
          <div className="register-modal-roles">
            <button type="button" className={`register-modal-role ${role === 'child' ? 'active' : ''}`} onClick={() => setRole('child')}>
              Barn
            </button>
            <button type="button" className={`register-modal-role ${role === 'parent' ? 'active' : ''}`} onClick={() => setRole('parent')}>
              Förälder
            </button>
          </div>
          <input
            type="text"
            className="register-modal-input"
            placeholder="Användarnamn (e-post)"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            autoComplete="email"
            required
            aria-invalid={!!error}
            disabled={loading}
          />
          <input
            type="password"
            className="register-modal-input"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoComplete="new-password"
            required
            disabled={loading}
          />
          <input
            type="text"
            className="register-modal-input"
            placeholder="Namn (valfritt)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
          />
          {role === 'child' && (
            <>
              <label className="register-modal-label" htmlFor="register-dob">
                Födelsedatum (för att anpassa upplevelsen)
              </label>
              <input
                id="register-dob"
                type="date"
                className="register-modal-input"
                value={dateOfBirth}
                onChange={(e) => { setDateOfBirth(e.target.value); setError(''); }}
                disabled={loading}
                aria-optional="true"
              />
              <input
                type="text"
                className="register-modal-input"
                placeholder="Klasskod (valfritt)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                autoComplete="off"
                disabled={loading}
              />
            </>
          )}
          {error && <div className="register-modal-error" role="alert">{error}</div>}
          <button type="submit" className="register-modal-button" disabled={loading}>
            {loading ? 'Skapar konto...' : 'Skapa konto'}
          </button>
        </form>
        <p className="register-modal-footer">
          Har du redan ett konto? <button type="button" className="register-modal-link" onClick={() => { onClose(); onOpenLogin?.(); }}>Logga in</button>
        </p>
      </div>
    </div>
  );
}
