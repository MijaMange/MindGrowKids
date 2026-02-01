import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
 * ProDiarySimplePage - Klassdagbok för lärare
 * 
 * Visar alla elevers checkins i klassen, anonymiserat för att visa trender.
 */
export function ProDiarySimplePage() {
  // CRITICAL: All hooks must be called at the top
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'pro') return;

    async function load() {
      try {
        // Hämta lärarens klass och elever
        const classRes = await fetch('/api/pro/my-class', { credentials: 'include' });
        if (classRes.ok) {
          const classData = await classRes.json();
          setStudents(classData.students || []);

          // Hämta alla checkins för eleverna i klassen
          if (classData.classCode) {
            const checkinsRes = await fetch(`/api/classes/${classData.classCode}/checkins`, {
              credentials: 'include',
            });
            if (checkinsRes.ok) {
              const data = await checkinsRes.json();
              setCheckins(data || []);
            }
          }
        }
      } catch (err) {
        console.error('Kunde inte ladda klassdata:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'pro') {
    return <Navigate to="/test-hub" replace />;
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
          onClick={() => navigate('/test-hub')}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Tillbaka till hub
        </button>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h2>Klassens dagbok</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Översikt över klassens mående. Data är anonymiserad för att visa trender.
        </p>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
          {students.length} {students.length === 1 ? 'elev' : 'elever'} i klassen
        </p>
      </div>

      {loading ? (
        <div className="card">
          <p>Laddar...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="card">
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
            Ingen data ännu. När eleverna börjar använda appen visas deras anteckningar här.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedDates.map((date) => {
            const dayCheckins = checkinsByDate[date];
            const emotionCounts = dayCheckins.reduce((acc, c) => {
              acc[c.emotion] = (acc[c.emotion] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div key={date} className="card">
                <h3 style={{ marginBottom: '12px' }}>
                  {format(new Date(date), 'EEEE d MMMM', { locale: sv })}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  {Object.entries(emotionCounts).map(([emotion, count]) => (
                    <div
                      key={emotion}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{EMOTION_EMOJIS[emotion]}</span>
                      <span style={{ fontWeight: 600 }}>{EMOTION_LABELS[emotion]}</span>
                      <span style={{ color: '#666' }}>({count})</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                  Totalt {dayCheckins.length} {dayCheckins.length === 1 ? 'anteckning' : 'anteckningar'} denna dag
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


