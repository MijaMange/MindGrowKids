import { apiRequest } from './http';

export const API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000');

// Debug: logga API_BASE i produktion
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  console.log('[API] API_BASE:', API_BASE);
  console.log('[API] VITE_API_URL:', (import.meta as any).env?.VITE_API_URL || '(not set)');
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  
  // Ensure credentials are always included for cookie-based auth
  const options: RequestInit = {
    credentials: 'include',
    ...init,
  };
  
  // Logga endast i development, och hoppa över 401 (normalt när inte inloggad)
  if (import.meta.env.DEV && !path.includes('/auth/me')) {
    console.log('[apiFetch]', options.method || 'GET', url);
  }
  
  try {
    const res = await apiRequest(path, options);
    
    // 401 är normalt när användaren inte är inloggad - logga inte som fel
    if (res.status === 401 && path.includes('/auth/me')) {
      // Tyst fail för auth check
      return res;
    }
    
    if (import.meta.env.DEV && !path.includes('/auth/me')) {
      console.log('[apiFetch] Response:', res.status, res.statusText || '');
    }
    
    // Om servern inte svarar (t.ex. krasch), kasta ett tydligt fel
    if (!res.ok && res.status >= 500) {
      const text = await res.text().catch(() => '');
      throw new Error(`Serverfel (${res.status}): ${text || 'Inget svar från servern'}`);
    }
    
    return res;
  } catch (err) {
    // Logga endast riktiga fel, inte 401
    if (!(err instanceof Error && err.message.includes('401'))) {
      console.error('[apiFetch] Error:', path, err);
    }
    // Om det är ett nätverksfel (t.ex. ECONNREFUSED), ge ett tydligt meddelande
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Kunde inte ansluta till servern. Kontrollera att servern körs.');
    }
    throw err;
  }
}

