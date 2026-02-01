import { Capacitor } from '@capacitor/core';

// Lazy load CapacitorHttp (endast när det behövs)
async function getCapacitorHttp() {
  try {
    const { Http } = await import('@capacitor-community/http');
    return Http;
  } catch {
    return null;
  }
}

export async function apiRequest(url: string, options: RequestInit & { base?: string } = {}) {
  const base = options.base || (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000'));
  const full = `${base.replace(/\/$/, '')}${url}`;

  if (Capacitor.isNativePlatform()) {
    // Prova att använda CapacitorHttp i app-läge
    const Http = await getCapacitorHttp();
    if (Http) {
      const headers: any = { ...(options.headers as any || {}) };
      if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      try {
        const res = await Http.request({
          method: (options.method || 'GET') as any,
          url: full,
          headers,
          data: typeof options.body === 'string' ? JSON.parse(options.body) : (options.body as any) || {},
        });

        return {
          ok: res.status >= 200 && res.status < 300,
          status: res.status,
          statusText: '',
          json: async () => res.data,
          text: async () => JSON.stringify(res.data),
        };
      } catch (err: any) {
        console.error('[apiRequest] CapacitorHttp error:', err);
        throw err;
      }
    }
  }
  
  // Använd vanlig fetch (webbläsare eller fallback)
  const opts: RequestInit = {
    credentials: 'include',
    ...options,
  };
  if (opts.body && !(opts.headers as any)?.['Content-Type']) {
    opts.headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' };
  }
  
  try {
    const res = await fetch(full, opts);
    // Logga i produktion för debugging
    if (typeof window !== 'undefined' && !import.meta.env.DEV) {
      console.log('[apiRequest] Fetch response:', res.status, res.statusText, 'URL:', full);
    }
    return res;
  } catch (fetchErr: any) {
    console.error('[apiRequest] Fetch error:', fetchErr, 'URL:', full);
    // Kasta ett mer informativt fel
    if (fetchErr instanceof TypeError && fetchErr.message.includes('fetch')) {
      throw new Error(`Kunde inte ansluta till API: ${full}. Kontrollera att backend körs och CORS är korrekt konfigurerad.`);
    }
    throw fetchErr;
  }
}

