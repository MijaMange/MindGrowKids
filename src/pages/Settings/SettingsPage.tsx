import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { setMuted, isMuted } from '../../utils/sound';
import { useState, useEffect } from 'react';
import { AdultPageShell } from '../../components/AdultPageShell/AdultPageShell';
import { JourneyHeader } from '../../components/JourneyHeader/JourneyHeader';
import './SettingsPage.css';

/**
 * SettingsPage - Inställningar för barn (Ljud, Lugn visning, Logga ut) och vuxen (konto, ljud, logga ut).
 * Barn når sidan via hamburgermenyn "Inställningar".
 */
const AGE_OPTIONS: Array<{ group: '4-5' | '6-7' | '8-10'; emoji: string; label: string }> = [
  { group: '4-5', emoji: '🧸', label: '4–5 år' },
  { group: '6-7', emoji: '🎈', label: '6–7 år' },
  { group: '8-10', emoji: '🚀', label: '8–10 år' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { ageGroup, setAgeGroup } = useAge();
  const [muted, setMuteState] = useState(() => isMuted());
  const [calmMode, setCalmMode] = useState(() => localStorage.getItem('mgk-calm-mode') === '1');
  const [savingAge, setSavingAge] = useState(false);

  useEffect(() => {
    setMuteState(isMuted());
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-calm', calmMode ? '1' : '0');
  }, [calmMode]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  function toggleMute() {
    const newVal = !muted;
    setMuteState(newVal);
    setMuted(newVal);
  }

  function toggleCalmMode() {
    const newVal = !calmMode;
    setCalmMode(newVal);
    localStorage.setItem('mgk-calm-mode', newVal ? '1' : '0');
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  const roleLabel =
    user.role === 'parent'
      ? 'Förälder'
      : user.role === 'pro'
        ? 'Lärare'
        : user.role ?? '–';

  const isChild = user.role === 'child';

  // Child view: simple Inställningar (Ljud, Lugn visning, Logga ut)
  if (isChild) {
    return (
      <div className="journey-root">
        <JourneyHeader title="Inställningar" onBack={() => navigate('/hub')} />
        <main className="journey-stage">
          <div className="step-card avatar-page-card">
            <div className="settings-child-content">
              <section className="settings-section" aria-labelledby="settings-child-age">
                <h2 id="settings-child-age" className="settings-section-title">Ålder</h2>
                <div className="settings-age-grid">
                  {AGE_OPTIONS.map((option) => {
                    const isSelected = ageGroup === option.group;
                    return (
                      <motion.button
                        key={option.group}
                        type="button"
                        className={`settings-age-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleAgeSelect(option.group)}
                        disabled={savingAge}
                        aria-pressed={isSelected}
                        whileHover={{ scale: savingAge ? 1 : 1.05, y: savingAge ? 0 : -2 }}
                        whileTap={{ scale: savingAge ? 1 : 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <span className="settings-age-emoji" aria-hidden>
                          {option.emoji}
                        </span>
                        <span className="settings-age-label">{option.label}</span>
                        {isSelected && (
                          <motion.div
                            className="settings-age-ring"
                            layoutId="settings-age-ring"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {savingAge && (
                  <p className="settings-age-saving" aria-live="polite">
                    Sparar…
                  </p>
                )}
              </section>
              <section className="settings-section" aria-labelledby="settings-child-sound">
                <h2 id="settings-child-sound" className="settings-section-title">Ljud</h2>
                <button
                  type="button"
                  className="settings-toggle settings-toggle-big"
                  onClick={toggleMute}
                  aria-pressed={muted}
                  aria-label={muted ? 'Ljud på' : 'Ljud av'}
                >
                  <span className="settings-toggle-emoji" aria-hidden>{muted ? '🔇' : '🔈'}</span>
                  <span className="settings-toggle-label">{muted ? 'Av' : 'På'}</span>
                </button>
              </section>
              <section className="settings-section" aria-labelledby="settings-child-calm">
                <h2 id="settings-child-calm" className="settings-section-title">Visning</h2>
                <button
                  type="button"
                  className="settings-toggle settings-toggle-big"
                  onClick={toggleCalmMode}
                  aria-pressed={calmMode}
                  aria-label={calmMode ? 'Normal visning' : 'Lugn visning'}
                >
                  <span className="settings-toggle-emoji" aria-hidden>{calmMode ? '🌙' : '☀️'}</span>
                  <span className="settings-toggle-label">{calmMode ? 'Lugn visning' : 'Normal visning'}</span>
                </button>
              </section>
              <div className="settings-footer">
                <button type="button" className="settings-logout-btn" onClick={handleLogout}>
                  Logga ut
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Adult view – same shell as Klassens statistik / Mina barn
  const adultPillLabel = user.role === 'parent' ? 'Föräldravy' : 'Lärarvy';
  return (
    <AdultPageShell pillLabel={adultPillLabel} title="Inställningar">
      <div className="pro-class-soft-card settings-adult-card">
        <h1 className="settings-page-title">Vuxeninställningar</h1>

        <section className="settings-section" aria-labelledby="settings-account-heading">
          <h2 id="settings-account-heading" className="settings-section-title">
            Konto
          </h2>
          <dl className="settings-dl">
            <dt className="settings-dt">Roll</dt>
            <dd className="settings-dd">{roleLabel}</dd>
            {user.name && (
              <>
                <dt className="settings-dt">Namn</dt>
                <dd className="settings-dd">{user.name}</dd>
              </>
            )}
            {user.classCode && (
              <>
                <dt className="settings-dt">Klasskod</dt>
                <dd className="settings-dd">{user.classCode}</dd>
              </>
            )}
          </dl>
        </section>

        {user.role === 'parent' && (
          <section className="settings-section" aria-labelledby="settings-children-heading">
            <h2 id="settings-children-heading" className="settings-section-title">
              Kopplade barn
            </h2>
            <p className="settings-muted">Hanteras i Mina barn.</p>
          </section>
        )}

        {user.role === 'pro' && user.classCode && (
          <section className="settings-section" aria-labelledby="settings-class-heading">
            <h2 id="settings-class-heading" className="settings-section-title">
              Klass
            </h2>
            <p className="settings-muted">Klasskod: {user.classCode}</p>
          </section>
        )}

        <section className="settings-section" aria-labelledby="settings-sound-heading">
          <h2 id="settings-sound-heading" className="settings-section-title">
            Ljud
          </h2>
          <button
            type="button"
            className="settings-toggle"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Ljud på' : 'Ljud av'}
          >
            <span className="settings-toggle-label">{muted ? 'Av' : 'På'}</span>
          </button>
        </section>

        <section className="settings-section" aria-labelledby="settings-calm-heading">
          <h2 id="settings-calm-heading" className="settings-section-title">
            Visning
          </h2>
          <button
            type="button"
            className="settings-toggle"
            onClick={toggleCalmMode}
            aria-pressed={calmMode}
            aria-label={calmMode ? 'Normal visning' : 'Lugn visning'}
          >
            <span className="settings-toggle-label">{calmMode ? 'Lugn visning' : 'Normal visning'}</span>
          </button>
        </section>

        <div className="settings-footer">
          <button type="button" className="settings-logout-btn" onClick={handleLogout}>
            Logga ut
          </button>
        </div>
      </div>
    </AdultPageShell>
  );
}
