import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import '../Diary/diary.css';

const EMOTION_EMOJIS: Record<string, string> = {
  happy: '😊',
  calm: '🫶',
  tired: '😪',
  sad: '😔',
  curious: '🧐',
  angry: '😠',
};

const EMOTION_LABELS: Record<string, string> = {
  happy: 'Glad',
  calm: 'Lugn',
  tired: 'Trött',
  sad: 'Ledsen',
  curious: 'Nyfiken',
  angry: 'Arg',
};

/**
 * ParentDiarySimplePage - Dagbok för ett specifikt barn (för föräldrar)
 * 
 * Visar dagbok för det valda barnet.
 */
export function ParentDiarySimplePage() {
  // CRITICAL: All hooks must be called at the top
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(true);

  const childId = searchParams.get('childId');

  useEffect(() => {
    if (!user || user.role !== 'parent' || !childId) return;

    async function load() {
      try {
        // Hämta barnets checkins
        // TODO: Skapa API endpoint /api/parent/children/:childId/checkins
        const res = await fetch(`/api/parent/children/${childId}/checkins`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setCheckins(data.checkins || []);
          setChildName(data.childName || '');
        } else {
          // Fallback: försök hämta direkt via checkins endpoint om vi har rätt scope
          const checkinsRes = await fetch('/api/checkins', { credentials: 'include' });
          if (checkinsRes.ok) {
            const checkinsData = await checkinsRes.json();
            setCheckins(checkinsData || []);
          }
        }
      } catch (err) {
        console.error('Kunde inte ladda dagbok:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, childId]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'parent') {
    return <Navigate to="/test-hub" replace />;
  }

  if (!childId) {
    return <Navigate to="/app/parent-children" replace />;
  }

  // Gruppera checkins per datum
  const checkinsByDate = checkins.reduce((acc, checkin) => {
    const date = format(new Date(checkin.dateISO), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(checkin);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(checkinsByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/app/parent-children')}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Tillbaka till Mina barn
        </button>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h2>Dagbok{childName ? ` - ${childName}` : ''}</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Här ser du ditt barns känslouttryck över tid.
        </p>
      </div>

      {loading ? (
        <div className="card">
          <p>Laddar...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="card">
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
            Ingen data ännu. När ditt barn börjar använda appen visas deras anteckningar här.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedDates.map((date) => {
            const dayCheckins = checkinsByDate[date];
            return (
              <div key={date} className="card">
                <h3 style={{ marginBottom: '12px' }}>
                  {format(new Date(date), 'EEEE d MMMM', { locale: sv })}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dayCheckins.map((checkin, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${EMOTION_EMOJIS[checkin.emotion] ? '#11998e' : '#ddd'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                          {EMOTION_EMOJIS[checkin.emotion] || '😊'}
                        </span>
                        <span style={{ fontWeight: 600 }}>
                          {EMOTION_LABELS[checkin.emotion] || checkin.emotion}
                        </span>
                        <span style={{ color: '#666', fontSize: '0.9rem', marginLeft: 'auto' }}>
                          {format(new Date(checkin.dateISO), 'HH:mm')}
                        </span>
                      </div>
                      {checkin.note && (
                        <p style={{ color: '#555', margin: 0, lineHeight: 1.5 }}>{checkin.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


