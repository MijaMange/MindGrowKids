import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { API_BASE, apiFetch } from '../../utils/config';
import { getPlatformInfo } from '../../utils/mobileView';

export function StatusPage() {
  const [health, setHealth] = useState<any>();
  const [me, setMe] = useState<any>();
  const [dbInfo, setDbInfo] = useState<any>();
  const [testLogin, setTestLogin] = useState<any>();
  const [platformInfo, setPlatformInfo] = useState<ReturnType<typeof getPlatformInfo> | null>(null);
  const [testing, setTesting] = useState(false);
  
  useEffect(() => {
    setPlatformInfo(getPlatformInfo());
    
    apiFetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch((err) => setHealth({ error: err.message }));
    apiFetch('/api/auth/me')
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ ok: false }));
    apiFetch('/api/db-info')
      .then((r) => r.json())
      .then(setDbInfo)
      .catch((err) => setDbInfo({ error: err.message }));
  }, []);
  
  async function testChildLogin() {
    setTesting(true);
    setTestLogin(null);
    try {
      const r = await apiFetch('/api/auth/child-login', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', classCode: '1234' }),
      });
      const text = await r.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }
      const headers: any = {};
      if ('headers' in r && r.headers) {
        try {
          if (typeof r.headers.entries === 'function') {
            headers.parsed = Object.fromEntries(r.headers.entries());
          } else {
            headers.raw = r.headers;
          }
        } catch {
          headers.error = 'Could not parse headers';
        }
      }
      
      setTestLogin({
        status: r.status,
        statusText: r.statusText || '',
        ok: r.ok,
        data,
        headers,
      });
    } catch (err: any) {
      setTestLogin({
        error: err.message,
        stack: err.stack,
      });
    } finally {
      setTesting(false);
    }
  }
  
  const warn = typeof window !== 'undefined' && location.protocol === 'http:' && !import.meta.env.DEV;
  
  return (
    <div className="container">
      <div className="card">
        <h2>Diagnostik</h2>
        {platformInfo && (
          <div style={{ marginBottom: '1rem', padding: '12px', background: platformInfo.isNative ? '#e3f2fd' : '#f5f5f5', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <strong>Läge:</strong>
              {platformInfo.isNative ? (
                <span style={{ background: '#2196f3', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
                  📱 Native App ({platformInfo.platform.toUpperCase()})
                </span>
              ) : platformInfo.isPWA ? (
                <span style={{ background: '#4caf50', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
                  🌐 PWA (Web App)
                </span>
              ) : (
                <span style={{ background: '#757575', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
                  💻 Webbläsare
                </span>
              )}
              {platformInfo.isMobile && <span>📱 Mobil enhet</span>}
            </div>
          </div>
        )}
        <div><strong>Plattform:</strong> {platformInfo?.platform || 'web'}</div>
        <div><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</div>
        <div><strong>Protocol:</strong> {typeof window !== 'undefined' ? location.protocol : 'N/A'}</div>
        <div><strong>API_BASE:</strong> {API_BASE}</div>
        <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 80) + '...' : 'N/A'}</div>
        <h3>API Status</h3>
        <pre style={{ fontSize: '0.85rem', overflow: 'auto' }}>health: {JSON.stringify(health, null, 2)}</pre>
        <pre style={{ fontSize: '0.85rem', overflow: 'auto' }}>me: {JSON.stringify(me, null, 2)}</pre>
        <pre style={{ fontSize: '0.85rem', overflow: 'auto' }}>db-info: {JSON.stringify(dbInfo, null, 2)}</pre>
        
        <h3>Test Child Login</h3>
        <button className="cta" onClick={testChildLogin} disabled={testing} style={{ marginBottom: '12px' }}>
          {testing ? 'Testar...' : 'Testa Child Login (Test / 1234)'}
        </button>
        {testLogin && (
          <pre style={{ fontSize: '0.85rem', overflow: 'auto', background: testLogin.ok ? '#e8f5e9' : '#ffebee', padding: '12px', borderRadius: '8px' }}>
            {JSON.stringify(testLogin, null, 2)}
          </pre>
        )}
        
        {warn && <div style={{ color: '#b00' }}>⚠️ Varning: http i produktion.</div>}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a
            className="cta"
            href={`${API_BASE.replace(/\/$/, '')}/api/health`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Öppna /api/health
          </a>
          <a
            className="cta"
            href={`${API_BASE.replace(/\/$/, '')}/api/db-info`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Öppna /api/db-info
          </a>
        </div>
      </div>
    </div>
  );
}

