import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { LoadingSpinner } from '../Loading/LoadingSpinner';
import { getEmotionLabel, getEmotionEmoji } from '../../config/emotions';

/**
 * Samma data och rendering som den separata sidan "Klassens dagbok".
 * Används både i översiktsfliken och på /app/pro-diary-simple.
 */
export function ClassDiaryContent() {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCheckins([]);
    setStudents([]);

    (async function load() {
      try {
        const classRes = await fetch('/api/pro/my-class', { credentials: 'include' });
        if (!classRes.ok) {
          setLoading(false);
          return;
        }
        const classData = await classRes.json();
        if (!classData?.classCode) {
          setLoading(false);
          return;
        }
        if (cancelled) return;
        setStudents(Array.isArray(classData.students) ? classData.students : []);

        const checkinsRes = await fetch(`/api/classes/${encodeURIComponent(classData.classCode)}/checkins`, {
          credentials: 'include',
        });
        if (cancelled) return;
        if (!checkinsRes.ok) {
          setLoading(false);
          return;
        }
        const data = await checkinsRes.json();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.checkins ?? data?.data ?? []);
        setCheckins(Array.isArray(list) ? list : []);
      } catch (_) {
        if (!cancelled) setCheckins([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const checkinsByDate = (checkins || []).reduce((acc: Record<string, any[]>, checkin: any) => {
    const iso = checkin?.dateISO;
    if (!iso) return acc;
    try {
      const date = format(new Date(iso), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(checkin);
    } catch (_) {}
    return acc;
  }, {});
  const sortedDates = Object.keys(checkinsByDate).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <div className="pro-class-soft-card" style={{ marginBottom: 20 }}>
        <h2 className="pro-class-soft-card-title">Klassens dagbok</h2>
        <p style={{ color: 'var(--mg-grey-text)', margin: '0 0 8px 0' }}>
          Översikt över klassens mående. Data är anonymiserad för att visa trender.
        </p>
        <p style={{ color: 'var(--mg-grey-text)', fontSize: '0.9rem', margin: 0 }}>
          {students.length} {students.length === 1 ? 'elev' : 'elever'} i klassen
        </p>
      </div>

      {loading ? (
        <div className="pro-class-soft-card">
          <LoadingSpinner />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="pro-class-soft-card">
          <p style={{ color: 'var(--mg-grey-text)', textAlign: 'center', padding: '40px', margin: 0 }}>
            Ingen data ännu. När eleverna börjar använda appen visas deras anteckningar här.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedDates.map((date) => {
            const dayCheckins = checkinsByDate[date] ?? [];
            const emotionCounts = (dayCheckins as any[]).reduce((acc: Record<string, number>, c: any) => {
              const e = c?.emotion;
              if (e != null && typeof e === 'string') acc[e] = (acc[e] || 0) + 1;
              return acc;
            }, {});
            return (
              <div key={date} className="pro-class-soft-card">
                <h3 className="pro-class-soft-card-title" style={{ marginBottom: 12 }}>
                  {format(new Date(date), 'EEEE d MMMM', { locale: sv })}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  {Object.entries(emotionCounts).map(([emotion, count]) => (
                    <div
                      key={emotion}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 'var(--mg-radius)',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{getEmotionEmoji(emotion)}</span>
                      <span style={{ fontWeight: 600, color: 'var(--mg-white)' }}>{getEmotionLabel(emotion)}</span>
                      <span style={{ color: 'var(--mg-grey-text)' }}>({count})</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: 'var(--mg-grey-text)', fontSize: '0.9rem', margin: 0 }}>
                  Totalt {dayCheckins.length} {dayCheckins.length === 1 ? 'anteckning' : 'anteckningar'} denna dag
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
