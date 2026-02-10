import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { JourneyHeader } from '../../components/JourneyHeader/JourneyHeader';
import { LoadingSpinner } from '../../components/Loading/LoadingSpinner';
import '../Journey/journey.css';
import './ChildLinkPage.css';

/**
 * ChildLinkPage – Länkkod och PIN för att koppla förälder.
 * Barn når sidan via hamburgermenyn "Länkkod". Samma layout som övriga app-sidor.
 */
export function ChildLinkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [linkCode, setLinkCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'child') return;

    async function load() {
      try {
        const r = await fetch('/api/child/linkcode', { credentials: 'include' });
        if (r.ok) {
          const d = await r.json();
          setLinkCode(d.linkCode || '');
        }
      } catch (err) {
        console.error('Kunde inte ladda länkkod:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  async function generatePin() {
    setPinLoading(true);
    setPin('');
    try {
      const r = await fetch('/api/pin/request', {
        method: 'POST',
        credentials: 'include',
      });
      const d = await r.json();
      if (d.pin) {
        setPin(d.pin);
        setTimeout(() => setPin(''), 5 * 60 * 1000);
      }
    } catch (err) {
      console.error('Kunde inte generera PIN:', err);
      alert('Kunde inte generera PIN. Försök igen.');
    } finally {
      setPinLoading(false);
    }
  }

  function handleBack() {
    navigate('/hub');
  }

  async function copyPin() {
    if (!pin) return;
    try {
      await navigator.clipboard.writeText(pin);
      setPinCopied(true);
      setTimeout(() => setPinCopied(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera PIN:', err);
    }
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'child') {
    return <Navigate to="/hub" replace />;
  }

  return (
    <div className="journey-root">
      <JourneyHeader title="Länkkod" onBack={handleBack} />

      <main className="journey-stage child-link-stage">
        <div className="step-card child-link-card">
          {loading ? (
            <div className="child-link-loading">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="child-link-content">
              <p className="child-link-intro">Ge koden till din förälder. De skriver in den i Mina barn → Lägg till barn.</p>

              {linkCode && (
                <section className="child-link-section" aria-labelledby="child-linkcode-heading">
                  <h2 id="child-linkcode-heading" className="child-link-heading">Min länkkod (alltid giltig)</h2>
                  <div className="child-link-code" aria-label={`Länkkod: ${linkCode}`}>
                    {linkCode}
                  </div>
                </section>
              )}

              <section className="child-link-section" aria-labelledby="child-pin-heading">
                <h2 id="child-pin-heading" className="child-link-heading">Temporär PIN (5 min)</h2>
                <button
                  type="button"
                  className="child-link-pin-btn cta next"
                  onClick={generatePin}
                  disabled={pinLoading}
                >
                  {pinLoading ? 'Skapar…' : 'Generera PIN'}
                </button>
                {pin && (
                  <div className="child-link-pin-row">
                    <div className="child-link-pin-display" aria-label={`PIN: ${pin}`}>
                      {pin}
                    </div>
                    <button
                      type="button"
                      className="child-link-copy-btn"
                      onClick={copyPin}
                      title="Kopiera PIN"
                      aria-label="Kopiera PIN-kod"
                    >
                      {pinCopied ? (
                        <span className="child-link-copy-feedback" aria-live="polite">Kopierad!</span>
                      ) : (
                        <span className="child-link-copy-icon" aria-hidden>📋</span>
                      )}
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
