import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import './pro.css';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

export function ProPage() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('Min klass');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [weekly, setWeekly] = useState<any>({ buckets: {}, timeSeries: [], total: 0 });
  const [summary, setSummary] = useState<any>({ summaryText: '', topEmotion: '', total: 0 });
  const [selectedClass, setSelectedClass] = useState('klass-1');
  const [selectedPeriod, setSelectedPeriod] = useState('vecka');
  const [loading, setLoading] = useState(true);

  // Hook: useEffect 1 - Load class data
  useEffect(() => {
    async function loadMyClass() {
      try {
        const r = await fetch('/api/pro/my-class', { credentials: 'include' });
        if (r.ok) {
          const d = await r.json();
          if (d.classCode) {
            setCode(d.classCode);
            setStudents(d.students || []);
          }
        }
      } catch (err) {
        console.error('Kunde inte ladda min klass:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMyClass();
  }, []);

  async function createClass() {
    try {
      const r = await fetch('/api/classes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const d = await r.json();
      setCode(d.code);
      loadStudents(d.code);
    } catch (err) {
      console.error('Kunde inte skapa klass:', err);
    }
  }

  async function loadStudents(c = code) {
    if (!c) return;
    try {
      const r = await fetch(`/api/classes/${c}/students`, { credentials: 'include' });
      const d = await r.json();
      setStudents(d);
    } catch (err) {
      console.error('Kunde inte ladda elever:', err);
      setStudents([]);
    }
  }

  // Uppdatera elever när code ändras
  useEffect(() => {
    if (code) {
      loadStudents(code);
    }
  }, [code]);

  useEffect(() => {
    const from = new Date(Date.now() - 7 * 86400000).toISOString();
    const to = new Date().toISOString();

    // Ladda weekly analytics
    fetch(`/api/analytics/weekly?from=${from}&to=${to}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setWeekly)
      .catch(() => {
        setWeekly({ buckets: {}, timeSeries: [], total: 0 });
      });

    // Ladda summary
    fetch(`/api/analytics/summary?from=${from}&to=${to}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {
        setSummary({ summaryText: '', topEmotion: '', total: 0 });
      });
  }, []);

  const labels = Object.keys(weekly.buckets || {});
  const values = Object.values(weekly.buckets || {});

  const emotionLabels: Record<string, string> = {
    happy: 'Glad',
    calm: 'Lugn',
    tired: 'Trött',
    sad: 'Ledsen',
    curious: 'Nyfiken',
    angry: 'Arg',
  };

  const doughnutData = {
    labels: labels.map((l) => emotionLabels[l] || l),
    datasets: [
      {
        data: values,
        backgroundColor: [
          '#FFE66D',
          '#B7D9CF',
          '#D4C5E8',
          '#A8DADC',
          '#FFB3BA',
          '#FF9A8B',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Conditional rendering is fine AFTER all hooks have been called
  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card pro-class-section">
        <h2>Min klass</h2>
        {!code ? (
          <div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Du har ingen klass ännu. Skapa en klasskod som dina elever kan använda när de loggar in.
            </p>
            <div className="pro-class-form">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Klassens namn"
              />
              <button className="cta next" onClick={createClass}>
                Skapa klasskod
              </button>
            </div>
          </div>
        ) : (
          <div className="pro-class-info">
            <div>
              <strong>Klasskod:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.2em', fontWeight: 700 }}>{code}</span>
            </div>
            <img
              alt="QR"
              src={`/api/classes/${code}/qrcode`}
              style={{ width: 160, height: 160, border: '1px solid #ddd', borderRadius: 8 }}
            />
            <small style={{ color: '#666' }}>
              Elever kan skanna QR eller skriva in koden vid barninloggning.
            </small>
            <button
              onClick={() => {
                loadStudents(code);
              }}
              style={{
                marginTop: 12,
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              🔄 Uppdatera elever
            </button>
          </div>
        )}
      </div>

      <div className="card pro-class-section">
        <h3>Elever</h3>
        <ul className="pro-students-list">
          {students.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
          {students.length === 0 && (
            <li style={{ color: '#666' }}>Inga elever ännu.</li>
          )}
        </ul>
        <div style={{ marginTop: 12 }}>
          <a
            className="cta"
            href={`/api/export.csv?from=${new Date(Date.now() - 7 * 86400000).toISOString()}&to=${new Date().toISOString()}`}
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Exportera CSV
          </a>
        </div>
      </div>

      <div className="card pro-class-section">
        <h2>Översikt för klass/grupp</h2>
        <div className="pro-filters">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="klass-1">Klass 1</option>
            <option value="klass-2">Klass 2</option>
          </select>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="vecka">Vecka</option>
            <option value="månad">Månad</option>
          </select>
        </div>
      </div>
      {summary.summaryText && (
        <div className="card" style={{ marginBottom: 12, background: '#f9f9f9' }}>
          <h3>Veckans bild</h3>
          <p style={{ color: '#555', lineHeight: 1.6, margin: 0 }}>{summary.summaryText}</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 12 }}>
        <h3>Emotionfördelning</h3>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          {labels.length > 0 ? (
            <Doughnut data={doughnutData} />
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>
              Ingen data ännu. Anteckningar visas här när de skapas.
            </p>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Veckotrend</h3>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {weekly.timeSeries && weekly.timeSeries.length > 0 ? (
            <Line
              data={{
                labels: weekly.timeSeries.map((ts: any) => {
                  const d = new Date(ts.date);
                  return d.toLocaleDateString('sv-SE', { weekday: 'short' });
                }),
                datasets: [
                  {
                    label: 'Totalt per dag',
                    data: weekly.timeSeries.map((ts: any) => {
                      return Object.values(ts.buckets || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
                    }),
                    tension: 0.3,
                    borderColor: '#B7D9CF',
                    backgroundColor: 'rgba(183, 217, 207, 0.1)',
                  },
                ],
              }}
            />
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Ingen tidsdata ännu.</p>
          )}
        </div>
      </div>
    </div>
  );
}

