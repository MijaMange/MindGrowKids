import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import './parent.css';
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

export function ParentPage() {
  const [code, setCode] = useState('');
  const [weekly, setWeekly] = useState<any>({ buckets: {}, timeSeries: [], total: 0 });
  const [summary, setSummary] = useState<any>({ summaryText: '', topEmotion: '', total: 0 });

  async function link() {
    if (!code.trim()) {
      alert('Ange PIN eller länkkod');
      return;
    }
    try {
      // Försök först med länkkod (6 siffror), annars PIN (4 siffror)
      const isLinkCode = code.length === 6 && /^\d+$/.test(code);
      const body = isLinkCode ? { linkCode: code } : { pin: code };
      
      console.log('[Parent] Linking with:', isLinkCode ? 'linkCode' : 'pin', code);
      
      const r = await fetch('/api/pin/link', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const responseText = await r.text();
      let d;
      try {
        d = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        console.error('[Parent] JSON parse error:', parseErr, 'Response:', responseText);
        alert('Ogiltigt svar från servern. Kontrollera konsolen för detaljer.');
        return;
      }
      
      console.log('[Parent] Response:', r.status, d);
      
      if (r.ok) {
        alert('Kopplat! Ladda om sidan för att se data.');
        setCode('');
        window.location.reload();
      } else {
        const errorMsg = d.message || d.error || 'Något gick fel.';
        console.error('[Parent] Link failed:', errorMsg, d);
        alert(errorMsg);
      }
    } catch (err) {
      console.error('[Parent] Link error:', err);
      alert('Kunde inte koppla. Försök igen. Kontrollera konsolen för detaljer.');
    }
  }

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
          '#FFE66D', // happy - gul
          '#B7D9CF', // calm - teal
          '#D4C5E8', // tired - lila
          '#A8DADC', // sad - blå
          '#FFB3BA', // curious - rosa
          '#FF9A8B', // angry - röd
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 12 }}>
        <h2>Länka mitt barn</h2>
        <div className="parent-actions">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Länkkod (6 siffror) eller PIN (4 siffror)"
            className="pin-input"
            maxLength={6}
          />
          <button className="cta next" onClick={link}>
            Länka
          </button>
          <a
            className="cta"
            href={`/api/export.csv?from=${new Date(Date.now() - 7 * 86400000).toISOString()}&to=${new Date().toISOString()}`}
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Exportera CSV
          </a>
        </div>
        <small style={{ color: '#666', marginTop: 8, display: 'block' }}>
          Ange din barns <strong>permanenta länkkod</strong> (6 siffror, alltid giltig) eller en <strong>temporär PIN</strong> (4 siffror, giltig 5 minuter).
          <br />
          Länkkoden hittar du i din barns dagbok under "Koppla till min förälder".
        </small>
      </div>

      {summary.summaryText && (
        <div className="card" style={{ marginBottom: 16, background: '#f9f9f9' }}>
          <h3>Veckans bild</h3>
          <p style={{ color: '#555', lineHeight: 1.6, margin: 0 }}>{summary.summaryText}</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Veckans känslor (fördelning)</h2>
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
        <h2>Veckotrend</h2>
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

