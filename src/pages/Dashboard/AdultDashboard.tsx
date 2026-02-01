import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
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
import { useAuth } from '../../auth/AuthContext';
import './AdultDashboard.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

interface AdultDashboardProps {
  role: 'parent' | 'pro';
}

export function AdultDashboard({ role }: AdultDashboardProps) {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  // Hook 1: useNavigate
  const navigate = useNavigate();
  // Hook 2: useAuth
  const { logout } = useAuth();
  // Hook 3: useState (weekly)
  const [weekly, setWeekly] = useState<any>({ buckets: {}, timeSeries: [], total: 0 });
  // Hook 4: useState (summary)
  const [summary, setSummary] = useState<any>({ summaryText: '', topEmotion: '', total: 0 });
  // Hook 5: useState (loading)
  const [loading, setLoading] = useState(true);
  // Hook 6: useEffect
  useEffect(() => {
    const from = new Date(Date.now() - 7 * 86400000).toISOString();
    const to = new Date().toISOString();

    setLoading(true);
    Promise.all([
      fetch(`/api/analytics/weekly?from=${from}&to=${to}`, { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => ({ buckets: {}, timeSeries: [], total: 0 })),
      fetch(`/api/analytics/summary?from=${from}&to=${to}`, { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => ({ summaryText: '', topEmotion: '', total: 0 })),
    ]).then(([weeklyData, summaryData]) => {
      setWeekly(weeklyData);
      setSummary(summaryData);
      setLoading(false);
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

  return (
    <div className="adult-dashboard">
      <div className="adult-dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h1>Översikt</h1>
            {role === 'pro' && (
              <p className="adult-dashboard-note">
                Detta är anonymiserad data. Detta reflekterar trender, inte individer.
              </p>
            )}
            {role === 'parent' && (
              <p className="adult-dashboard-note">
                Översikt över ditt barns känslor den senaste veckan.
              </p>
            )}
          </div>
          <button
            className="adult-logout-btn"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            Logga ut
          </button>
        </div>
      </div>

      {loading ? (
        <div className="adult-dashboard-loading">
          <p>Laddar data...</p>
        </div>
      ) : (
        <>
          {summary.summaryText && (
            <div className="adult-dashboard-card adult-dashboard-summary">
              <h2>Veckans bild</h2>
              <p>{summary.summaryText}</p>
            </div>
          )}

          <div className="adult-dashboard-grid">
            <div className="adult-dashboard-card">
              <h2>Känslofördelning</h2>
              <div className="adult-dashboard-chart">
                {labels.length > 0 ? (
                  <Doughnut data={doughnutData} options={{ maintainAspectRatio: true }} />
                ) : (
                  <p className="adult-dashboard-empty">Ingen data ännu.</p>
                )}
              </div>
            </div>

            <div className="adult-dashboard-card">
              <h2>Veckotrend</h2>
              <div className="adult-dashboard-chart">
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
                            return Object.values(ts.buckets || {}).reduce(
                              (a: number, b: any) => a + (typeof b === 'number' ? b : 0),
                              0
                            );
                          }),
                          tension: 0.3,
                          borderColor: '#B7D9CF',
                          backgroundColor: 'rgba(183, 217, 207, 0.1)',
                        },
                      ],
                    }}
                    options={{ maintainAspectRatio: true }}
                  />
                ) : (
                  <p className="adult-dashboard-empty">Ingen tidsdata ännu.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

