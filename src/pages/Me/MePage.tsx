import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useMoodStore } from '../../state/useMoodStore';
import { useAvatarStore } from '../../state/useAvatarStore';
import { MoodMeters } from '../../components/Stats/MoodMeters';
import { AvatarCanvas } from '../../components/Avatar/AvatarCanvas';
import { LoadingSpinner } from '../../components/Loading/LoadingSpinner';
import { motion } from 'framer-motion';
import { getEmotionLabel } from '../../config/emotions';
import './me.css';

export function MePage() {
  const { user } = useAuth();
  const { emoji, overlay, loadFromServer } = useEmojiAvatarStore();
  const { values, load } = useMoodStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState<string>('');
  const [linkCode, setLinkCode] = useState<string>('');

  useEffect(() => {
    // Tillfälligt: hämta från localStorage eller API
    if (!user) {
      setLoading(false);
      return;
    }

    // Ladda avatar och mood om barn
    if (user?.role === 'child') {
      loadFromServer();
      load();
      loadLinkCode();
    }

    // Försök hämta från API, annars mocka data
    fetch('/api/my/summary', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        // Mock-data om API misslyckas
        if (!user?.id) {
          setData({ role: user?.role || 'child', counts: {}, total: 0 });
          return;
        }
        const storedCheckins = localStorage.getItem(`mgk-checkins-${user.id}`);
        if (storedCheckins) {
          try {
            const checkins = JSON.parse(storedCheckins);
            const counts = checkins.reduce((m: any, r: any) => {
              m[r.emotion] = (m[r.emotion] || 0) + 1;
              return m;
            }, {});
            setData({ role: user.role, counts, total: checkins.length });
          } catch {
            setData({ role: user.role, counts: {}, total: 0 });
          }
        } else {
          setData({ role: user.role, counts: {}, total: 0 });
        }
      })
      .finally(() => setLoading(false));
  }, [user, load, loadFromServer]);

  async function loadLinkCode() {
    try {
      const r = await fetch('/api/child/linkcode', {
        method: 'GET',
        credentials: 'include',
      });
      if (r.ok) {
        const d = await r.json();
        setLinkCode(d.linkCode);
      }
    } catch (err) {
      console.error('Kunde inte ladda länkkod:', err);
    }
  }

  async function genPin() {
    try {
      const r = await fetch('/api/pin/request', {
        method: 'POST',
        credentials: 'include',
      });
      const d = await r.json();
      setPin(d.pin);
      // Rensa PIN efter 5 minuter
      setTimeout(() => setPin(''), 5 * 60 * 1000);
    } catch (err) {
      console.error('Kunde inte generera PIN:', err);
      alert('Kunde inte generera PIN. Försök igen.');
    }
  }

  const emotionLabels = (key: string) => {
    const { getEmotionLabel } = require('../../config/emotions');
    return getEmotionLabel(key);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Min sida</h2>
        {loading ? (
          <LoadingSpinner />
        ) : !data ? (
          <p>Kunde inte ladda data.</p>
        ) : (
          <>
            {/* Profilbild (emoji-avatar) om barn */}
            {user?.role === 'child' && (
              <div className="me-avatar-container">
                <EmojiAvatarDisplay emoji={emoji} overlay={overlay} size={160} />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <strong>Roll:</strong> {data.role}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Totalt:</strong> {data.total} anteckningar
            </div>

            {/* Mood-mätare om barn */}
            {user?.role === 'child' && (
              <div style={{ marginBottom: 24, padding: 16, background: '#f9f9f9', borderRadius: 12 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Mitt humör</h3>
                <MoodMeters values={values} />
              </div>
            )}

            {Object.keys(data.counts || {}).length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {Object.entries(data.counts || {}).map(([k, v]) => (
                  <li key={k} style={{ marginBottom: 8, padding: 8, background: '#f7f7f7', borderRadius: 8 }}>
                    <strong>{getEmotionLabel(k) || k}:</strong> {v as any}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>Inga känslor registrerade ännu.</p>
            )}

            {/* Koppla till förälder - endast för barn */}
            {user?.role === 'child' && (
              <div style={{ marginTop: 32, padding: 20, background: '#f9f9f9', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Koppla till min förälder</h3>
                
                {linkCode && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>
                      Min permanenta länkkod (alltid giltig):
                    </div>
                    <div style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold', 
                      color: 'var(--mg-good, #66c6a3)',
                      fontFamily: 'monospace',
                      letterSpacing: '4px',
                      padding: '12px 16px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '2px solid var(--mg-good, #66c6a3)',
                      textAlign: 'center'
                    }}>
                      {linkCode}
                    </div>
                    <small style={{ color: '#666', marginTop: 8, display: 'block' }}>
                      Ge denna kod till din förälder. Den fungerar alltid.
                    </small>
                  </div>
                )}

                <div style={{ paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
                  <motion.button
                    className="cta secondary"
                    onClick={genPin}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ marginBottom: 12 }}
                  >
                    Generera temporär PIN (5 min)
                  </motion.button>
                  {pin && (
                    <div style={{ 
                      padding: '12px 16px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>
                        Temporär PIN (giltig 5 minuter):
                      </div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#333',
                        fontFamily: 'monospace',
                        letterSpacing: '2px',
                        textAlign: 'center'
                      }}>
                        {pin}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

