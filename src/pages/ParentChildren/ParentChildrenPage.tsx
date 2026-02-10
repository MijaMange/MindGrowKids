import { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../utils/config';
import { AdultPageShell } from '../../components/AdultPageShell/AdultPageShell';
import { LoadingSpinner } from '../../components/Loading/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { getEmotionEmoji, getEmotionLabel } from '../../config/emotions';
import type { AgeGroup } from '../../config/ageConfig';
import '../Journey/journey.css';
import './ParentChildrenPage.css';

interface LinkedChild {
  id: string;
  name: string;
}

interface CheckinItem {
  id?: string;
  emotion?: string;
  note?: string;
  dateISO?: string;
  mode?: string;
}

/**
 * ParentChildrenPage – Mina barn, same design system as child-facing views.
 * Visual child cards (emoji + name), one primary CTA when empty, minimal add flow.
 */
export function ParentChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [linkCode, setLinkCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [linking, setLinking] = useState(false);
  const [stats, setStats] = useState<{
    childName: string;
    byEmotion: Record<string, number>;
    /** Andelar 0–100, för diagram (ingen exakt antal) */
    emotionShares: { emotion: string; share: number }[];
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [childAgeGroup, setChildAgeGroup] = useState<AgeGroup | null>(null);
  const [updatingAge, setUpdatingAge] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;

    async function load() {
      try {
        const res = await apiFetch('/api/parent/my-children');
        if (res.ok) {
          const data = await res.json();
          setChildren(data.children || []);
        } else {
          if ((user as any).childId) {
            const childRes = await apiFetch(`/api/children/${(user as any).childId}`);
            if (childRes.ok) {
              const childData = await childRes.json();
              setChildren([{ id: childData.id, name: childData.name }]);
            }
          }
        }
      } catch (err) {
        console.error('Kunde inte ladda barn:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // Ladda statistik för första barnet när barn finns
  useEffect(() => {
    if (children.length === 0) {
      setStats(null);
      return;
    }
    const firstChild = children[0];
    setStatsLoading(true);
    apiFetch(`/api/parent/children/${firstChild.id}/checkins`)
      .then((r) => (r.ok ? r.json() : { checkins: [], childName: firstChild.name }))
      .then((data) => {
        const checkins: CheckinItem[] = data.checkins || [];
        const byEmotion: Record<string, number> = {};
        checkins.forEach((c) => {
          if (c.emotion) {
            byEmotion[c.emotion] = (byEmotion[c.emotion] || 0) + 1;
          }
        });
        const total = Object.values(byEmotion).reduce((a, b) => a + b, 0);
        const emotionShares =
          total > 0
            ? Object.entries(byEmotion)
                .map(([emotion, count]) => ({ emotion, share: Math.round((count / total) * 100) }))
                .filter((e) => e.share > 0)
                .sort((a, b) => b.share - a.share)
            : [];
        setStats({
          childName: data.childName || firstChild.name,
          byEmotion,
          emotionShares,
        });
      })
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [children]);

  async function handleLink() {
    if (!linkCode.trim()) return;

    setLinking(true);
    try {
      const isLinkCode = linkCode.length === 6 && /^\d+$/.test(linkCode);
      const body = isLinkCode ? { linkCode } : { pin: linkCode };

      const r = await apiFetch('/api/pin/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (r.ok) {
        setLinkCode('');
        setShowAddForm(false);
        const res = await apiFetch('/api/parent/my-children');
        if (res.ok) {
          const data = await res.json();
          setChildren(data.children || []);
        } else {
          window.location.reload();
        }
      } else {
        const d = await r.json().catch(() => ({}));
        alert(d.message || d.error || 'Kunde inte koppla. Kontrollera koden.');
      }
    } catch (err) {
      console.error('Link error:', err);
      alert('Kunde inte koppla. Försök igen.');
    } finally {
      setLinking(false);
    }
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'parent') {
    return <Navigate to="/hub" replace />;
  }

  return (
    <AdultPageShell pillLabel="Föräldravy" title="Mina barn">
      <div className="pro-class-soft-card parent-children-card" style={{ marginBottom: 0 }}>
          {loading ? (
            <div className="parent-children-loading">
              <LoadingSpinner />
            </div>
          ) : children.length === 0 ? (
            <>
              {!showAddForm ? (
                <EmptyState
                  title="Inga barn kopplade"
                  description="Lägg till ett barn med PIN eller länkkod."
                  icon="👨‍👩‍👧"
                  actionLabel="Lägg till barn"
                  onAction={() => {
                    setShowAddForm(true);
                    setTimeout(() => linkInputRef.current?.focus(), 100);
                  }}
                  className="empty-state-in-card parent-empty-state"
                />
              ) : (
                <div className="parent-add-section">
                  <h2 className="parent-add-heading">Lägg till barn</h2>
                  <label className="parent-add-label" htmlFor="parent-link-input">
                    Kod
                  </label>
                  <input
                    ref={linkInputRef}
                    id="parent-link-input"
                    type="text"
                    inputMode="numeric"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="PIN eller länkkod"
                    maxLength={6}
                    className="parent-add-input"
                    aria-label="PIN eller länkkod"
                  />
                  <div className="parent-add-actions">
                    <button
                      type="button"
                      className="parent-add-back"
                      onClick={() => setShowAddForm(false)}
                    >
                      Tillbaka
                    </button>
                    <button
                      type="button"
                      className="parent-add-submit cta next"
                      onClick={handleLink}
                      disabled={!linkCode.trim() || linking}
                    >
                      {linking ? 'Kopplar…' : 'Koppla'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="parent-children-content">
              {/* ID-kort – första barnet högst upp med profil-silhuett */}
              {children.length > 0 && (
                <>
                  <div className="parent-id-card" aria-label={`Kopplat barn: ${children[0].name}`}>
                    <div className="parent-id-card-silhouette" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <span className="parent-id-card-name">{children[0].name}</span>
                  </div>

                  {/* Age group selector */}
                  <div className="parent-age-selector">
                    <label htmlFor="parent-age-select" className="parent-age-label">
                      Åldersgrupp
                    </label>
                    <select
                      id="parent-age-select"
                      className="parent-age-select"
                      value={childAgeGroup || ''}
                      onChange={async (e) => {
                        const newAge = e.target.value as AgeGroup;
                        if (!newAge || !children[0]) return;
                        
                        setUpdatingAge(true);
                        try {
                          const res = await apiFetch(`/api/children/${children[0].id}/age`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ageGroup: newAge }),
                          });
                          if (res.ok) {
                            setChildAgeGroup(newAge);
                          } else {
                            alert('Kunde inte uppdatera åldersgrupp');
                          }
                        } catch (err) {
                          console.error('Failed to update age:', err);
                          alert('Kunde inte uppdatera åldersgrupp');
                        } finally {
                          setUpdatingAge(false);
                        }
                      }}
                      disabled={updatingAge}
                    >
                      <option value="">Välj åldersgrupp</option>
                      <option value="4-5">🧸 4–5 år</option>
                      <option value="6-7">🎈 6–7 år</option>
                      <option value="8-10">🚀 8–10 år</option>
                    </select>
                  </div>
                </>
              )}

              {/* Statistikdashboard – visas när barn är kopplade */}
              {statsLoading && children.length > 0 && (
                <div className="parent-stats-skeleton">
                  <LoadingSpinner />
                </div>
              )}
              {!statsLoading && stats && children.length > 0 && (
                <section className="parent-stats-dashboard" aria-labelledby="parent-stats-heading">
                  <h2 id="parent-stats-heading" className="parent-stats-heading">
                    Känsloläge – översikt
                  </h2>
                  <p className="parent-stats-intro">
                    Samlad bild över tid. Inga datum eller antal – bara en översikt.
                  </p>
                  {stats.emotionShares.length > 0 ? (
                    <>
                      <div className="parent-stats-bars" role="img" aria-label="Fördelning av känslor">
                        {stats.emotionShares.map(({ emotion, share }) => (
                          <div
                            key={emotion}
                            className="parent-stats-bar-row"
                            title={`${getEmotionLabel(emotion)}: ${share}%`}
                          >
                            <span className="parent-stats-bar-emoji" aria-hidden>
                              {getEmotionEmoji(emotion) || '•'}
                            </span>
                            <span className="parent-stats-bar-label">
                              {getEmotionLabel(emotion)}
                            </span>
                            <div className="parent-stats-bar-track">
                              <div
                                className="parent-stats-bar-fill"
                                style={{ width: `${Math.max(share, 4)}%` }}
                              />
                            </div>
                            <span className="parent-stats-bar-percent">{share}%</span>
                          </div>
                        ))}
                      </div>
                      <p className="parent-stats-summary">
                        {stats.emotionShares[0] && (
                          <>
                            Mest {getEmotionLabel(stats.emotionShares[0].emotion)?.toLowerCase() ?? 'varierat'}.
                            {stats.emotionShares.length > 1 && (
                              <>
                                {' '}
                                Blandat med{' '}
                                {stats.emotionShares
                                  .slice(1, 3)
                                  .map((e) => getEmotionLabel(e.emotion)?.toLowerCase() ?? e.emotion)
                                  .join(' och ')}
                                .
                              </>
                            )}
                          </>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="parent-stats-empty">Ingen översikt än – fler inlägg ger en bättre bild över tid.</p>
                  )}
                </section>
              )}

              {children.length > 1 && (
                <div className="parent-child-cards">
                  {children.slice(1).map((child) => (
                    <div
                      key={child.id}
                      className="parent-child-card parent-child-card-display"
                      aria-label={`Kopplat barn: ${child.name}`}
                    >
                      <span className="parent-child-avatar" aria-hidden>
                        👤
                      </span>
                      <span className="parent-child-name">{child.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {showAddForm ? (
                <div className="parent-add-section parent-add-inline">
                  <label className="parent-add-label" htmlFor="parent-link-input-inline">
                    Lägg till barn
                  </label>
                  <input
                    ref={linkInputRef}
                    id="parent-link-input-inline"
                    type="text"
                    inputMode="numeric"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="PIN eller länkkod"
                    maxLength={6}
                    className="parent-add-input"
                    aria-label="PIN eller länkkod"
                  />
                  <div className="parent-add-actions">
                    <button
                      type="button"
                      className="parent-add-back"
                      onClick={() => setShowAddForm(false)}
                    >
                      Avbryt
                    </button>
                    <button
                      type="button"
                      className="parent-add-submit cta next"
                      onClick={handleLink}
                      disabled={!linkCode.trim() || linking}
                    >
                      {linking ? 'Kopplar…' : 'Koppla'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="parent-add-trigger"
                  onClick={() => {
                    setShowAddForm(true);
                    setTimeout(() => linkInputRef.current?.focus(), 100);
                  }}
                >
                  <span className="parent-add-trigger-icon" aria-hidden>➕</span>
                  Lägg till barn
                </button>
              )}
            </div>
          )}
      </div>
    </AdultPageShell>
  );
}
