import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { LoadingSpinner } from '../../components/Loading/LoadingSpinner';
import './DiagnosticsPage.css';

interface DiagnosticData {
  auth: {
    user: any;
    token: string | null;
    decoded: any;
  };
  api: {
    health: any;
    dbInfo: any;
    me: any;
  };
  database: {
    parents: any[];
    kids: any[];
    pins: any[];
    checkins: any[];
  };
  linking: {
    parentChildLinks: any[];
    availablePins: any[];
  };
}

export function DiagnosticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    loadDiagnostics();
  }, [authLoading, user]);

  async function loadDiagnostics() {
    setLoading(true);
    setError(null);
    
    try {
      const diagnostics: DiagnosticData = {
        auth: {
          user: user,
          token: getCookie('token') || null,
          decoded: null,
        },
        api: {
          health: null,
          dbInfo: null,
          me: null,
        },
        database: {
          parents: [],
          kids: [],
          pins: [],
          checkins: [],
        },
        linking: {
          parentChildLinks: [],
          availablePins: [],
        },
      };

      // Dekoda JWT-token om den finns
      if (diagnostics.auth.token) {
        try {
          const payload = diagnostics.auth.token.split('.')[1];
          diagnostics.auth.decoded = JSON.parse(atob(payload));
        } catch (e) {
          console.warn('Could not decode token:', e);
        }
      }

      // Testa API-endpoints
      try {
        const healthRes = await fetch('/api/health', { credentials: 'include' });
        const healthText = await healthRes.text();
        diagnostics.api.health = {
          status: healthRes.status,
          statusText: healthRes.statusText,
          ok: healthRes.ok,
          headers: Object.fromEntries(healthRes.headers.entries()),
        };
        if (healthText) {
          try {
            diagnostics.api.health.data = JSON.parse(healthText);
          } catch (parseErr) {
            diagnostics.api.health.raw = healthText.substring(0, 500);
            diagnostics.api.health.parseError = String(parseErr);
          }
        } else {
          diagnostics.api.health.empty = true;
        }
      } catch (e) {
        diagnostics.api.health = { 
          error: String(e), 
          type: e instanceof TypeError ? 'network' : 'other',
          message: e instanceof Error ? e.message : 'Unknown error'
        };
      }

      try {
        const dbInfoRes = await fetch('/api/db-info', { credentials: 'include' });
        const dbInfoText = await dbInfoRes.text();
        diagnostics.api.dbInfo = {
          status: dbInfoRes.status,
          statusText: dbInfoRes.statusText,
          ok: dbInfoRes.ok,
        };
        if (dbInfoText) {
          try {
            diagnostics.api.dbInfo.data = JSON.parse(dbInfoText);
          } catch (parseErr) {
            diagnostics.api.dbInfo.raw = dbInfoText.substring(0, 500);
            diagnostics.api.dbInfo.parseError = String(parseErr);
          }
        } else {
          diagnostics.api.dbInfo.empty = true;
        }
      } catch (e) {
        diagnostics.api.dbInfo = { 
          error: String(e), 
          type: e instanceof TypeError ? 'network' : 'other',
          message: e instanceof Error ? e.message : 'Unknown error'
        };
      }

      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        const meText = await meRes.text();
        diagnostics.api.me = {
          status: meRes.status,
          statusText: meRes.statusText,
          ok: meRes.ok,
        };
        if (meText) {
          try {
            diagnostics.api.me.data = JSON.parse(meText);
          } catch (parseErr) {
            diagnostics.api.me.raw = meText.substring(0, 500);
            diagnostics.api.me.parseError = String(parseErr);
          }
        } else {
          diagnostics.api.me.empty = true;
        }
      } catch (e) {
        diagnostics.api.me = { 
          error: String(e), 
          type: e instanceof TypeError ? 'network' : 'other',
          message: e instanceof Error ? e.message : 'Unknown error'
        };
      }

      // Hämta databasdata (endast om inloggad som parent/pro)
      if (user?.role === 'parent' || user?.role === 'pro') {
        try {
          // Försök hämta via en debug-endpoint (vi skapar den)
          const debugRes = await fetch('/api/debug/db', { credentials: 'include' });
          const debugText = await debugRes.text();
          if (debugRes.ok && debugText) {
            try {
              const debugData = JSON.parse(debugText);
              diagnostics.database = debugData;
            } catch (parseErr) {
              diagnostics.database = { 
                error: 'Parse error', 
                raw: debugText.substring(0, 200),
                status: debugRes.status
              };
            }
          } else {
            diagnostics.database = { 
              error: 'Not OK or empty', 
              status: debugRes.status,
              statusText: debugRes.statusText
            };
          }
        } catch (e) {
          console.warn('Could not fetch debug data:', e);
          diagnostics.database = { error: String(e) };
        }
      }

      // Hämta PIN-data om inloggad som child
      if (user?.role === 'child') {
        try {
          const linkCodeRes = await fetch('/api/child/linkcode', { credentials: 'include' });
          if (linkCodeRes.ok) {
            const linkCode = await linkCodeRes.json();
            diagnostics.linking.availablePins = [{ type: 'linkCode', value: linkCode.linkCode }];
          }
        } catch (e) {
          console.warn('Could not fetch link code:', e);
        }
      }

      setData(diagnostics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Okänt fel');
      console.error('Diagnostics error:', err);
    } finally {
      setLoading(false);
    }
  }

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  function formatDate(timestamp: number | string): string {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleString('sv-SE');
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Diagnostik (Development)</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Diagnostik (Development)</h2>
          <div className="diagnostics-error">
            <p>Fel: {error}</p>
            <button className="cta" onClick={loadDiagnostics}>
              Försök igen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container diagnostics-container">
      <div className="card">
        <h2>🔍 Diagnostik (Development)</h2>
        <p className="diagnostics-note">
          Denna sida visar diagnostisk information för development. Använd den för att debugga inloggning och databasproblem.
        </p>
        <button className="cta secondary" onClick={loadDiagnostics} style={{ marginBottom: 24 }}>
          Uppdatera
        </button>
      </div>

      {/* Auth Status */}
      <div className="card diagnostics-section">
        <h3>🔐 Autentisering</h3>
        <div className="diagnostics-grid">
          <div>
            <strong>Inloggad:</strong> {user ? 'Ja' : 'Nej'}
          </div>
          <div>
            <strong>Roll:</strong> {user?.role || 'Ingen'}
          </div>
          <div>
            <strong>Namn:</strong> {user?.name || 'N/A'}
          </div>
          <div>
            <strong>ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>Token finns:</strong> {data?.auth.token ? 'Ja' : 'Nej'}
          </div>
          {data?.auth.decoded && (
            <div>
              <strong>Token payload:</strong>
              <pre className="diagnostics-code">{JSON.stringify(data.auth.decoded, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* API Status */}
      <div className="card diagnostics-section">
        <h3>🌐 API Status</h3>
        <div className="diagnostics-grid">
          <div>
            <strong>/api/health:</strong>
            {data?.api.health?.status === 500 && (
              <div className="diagnostics-error" style={{ marginBottom: 8, padding: 8 }}>
                ⚠️ Serverfel (500) - Kontrollera att servern körs
              </div>
            )}
            {data?.api.health?.type === 'network' && (
              <div className="diagnostics-error" style={{ marginBottom: 8, padding: 8 }}>
                ⚠️ Nätverksfel - Servern svarar inte. Kontrollera att servern körs på port 4000.
              </div>
            )}
            <pre className="diagnostics-code">{JSON.stringify(data?.api.health, null, 2)}</pre>
          </div>
          <div>
            <strong>/api/db-info:</strong>
            {data?.api.dbInfo?.status === 500 && (
              <div className="diagnostics-error" style={{ marginBottom: 8, padding: 8 }}>
                ⚠️ Serverfel (500) - Databasproblem
              </div>
            )}
            <pre className="diagnostics-code">{JSON.stringify(data?.api.dbInfo, null, 2)}</pre>
          </div>
          <div>
            <strong>/api/auth/me:</strong>
            {data?.api.me?.status === 401 && (
              <div style={{ marginBottom: 8, padding: 8, background: '#fff3cd', borderRadius: 4 }}>
                ℹ️ Inte inloggad (401) - Detta är normalt om du inte är inloggad
              </div>
            )}
            {data?.api.me?.status === 500 && (
              <div className="diagnostics-error" style={{ marginBottom: 8, padding: 8 }}>
                ⚠️ Serverfel (500) - Autentiseringsproblem
              </div>
            )}
            <pre className="diagnostics-code">{JSON.stringify(data?.api.me, null, 2)}</pre>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 12, background: '#e3f2fd', borderRadius: 8 }}>
          <strong>💡 Tips:</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>Om alla endpoints returnerar 500: Kontrollera att servern körs (<code>npm run dev:api</code>)</li>
            <li>Om nätverksfel: Kontrollera att servern lyssnar på port 4000</li>
            <li>Kolla serverns terminal för felmeddelanden</li>
          </ul>
        </div>
      </div>

      {/* Database Data */}
      {(user?.role === 'parent' || user?.role === 'pro') && (
        <div className="card diagnostics-section">
          <h3>💾 Databasdata</h3>
          <div className="diagnostics-grid">
            <div>
              <strong>Föräldrar:</strong> {data?.database.parents?.length || 0}
              {data?.database.parents && data.database.parents.length > 0 && (
                <ul className="diagnostics-list">
                  {data.database.parents.slice(0, 5).map((p: any, i: number) => (
                    <li key={i}>
                      {p.email} (ID: {p.id}) {p.childId ? `→ Länkad till: ${p.childId}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <strong>Barn:</strong> {data?.database.kids?.length || 0}
              {data?.database.kids && data.database.kids.length > 0 && (
                <ul className="diagnostics-list">
                  {data.database.kids.slice(0, 5).map((k: any, i: number) => (
                    <li key={i}>
                      {k.name} (ID: {k.id}, LinkCode: {k.linkCode || 'N/A'})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <strong>Aktiva PIN:ar:</strong> {data?.database.pins?.length || 0}
              {data?.database.pins && data.database.pins.length > 0 && (
                <ul className="diagnostics-list">
                  {data.database.pins.map((p: any, i: number) => (
                    <li key={i}>
                      PIN: {p.pin} → Child: {p.childId} (Giltig till: {formatDate(p.expiresAt)})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <strong>Checkins:</strong> {data?.database.checkins?.length || 0}
            </div>
          </div>
        </div>
      )}

      {/* Linking Info */}
      {user?.role === 'child' && (
        <div className="card diagnostics-section">
          <h3>🔗 Länkningsinfo</h3>
          <div className="diagnostics-grid">
            <div>
              <strong>Din länkkod:</strong>
              {data?.linking.availablePins && data.linking.availablePins.length > 0 ? (
                <div className="diagnostics-linkcode">
                  {data.linking.availablePins[0].value}
                </div>
              ) : (
                <LoadingSpinner size="sm" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Parent Linking Info */}
      {user?.role === 'parent' && (
        <div className="card diagnostics-section">
          <h3>🔗 Länkningsinfo</h3>
          <div className="diagnostics-grid">
            <div>
              <strong>Länkad till barn:</strong> {data?.database.parents?.find((p: any) => p.id === user?.id)?.childId || 'Ingen'}
            </div>
            <div>
              <strong>Tillgängliga PIN:ar:</strong>
              {data?.database.pins && data.database.pins.length > 0 ? (
                <ul className="diagnostics-list">
                  {data.database.pins.map((p: any, i: number) => (
                    <li key={i}>
                      PIN: <strong>{p.pin}</strong> → Child: {p.childId} (Giltig till: {formatDate(p.expiresAt)})
                    </li>
                  ))}
                </ul>
              ) : (
                <span>Inga aktiva PIN:ar</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

