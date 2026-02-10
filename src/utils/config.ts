import { apiRequest } from './http';

export const API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000');

// Custom error types for better error handling
export class OfflineError extends Error {
  constructor(message: string = 'Du är offline. Kontrollera din internetanslutning.') {
    super(message);
    this.name = 'OfflineError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Kunde inte ansluta till servern. Kontrollera din internetanslutning.') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Debug: logga API_BASE i produktion
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  console.log('[API] API_BASE:', API_BASE);
  console.log('[API] VITE_API_URL:', (import.meta as any).env?.VITE_API_URL || '(not set)');
}

/**
 * apiFetch - Enhanced fetch wrapper with offline detection and structured errors
 * 
 * Features:
 * - Early offline detection (throws OfflineError if navigator.onLine is false)
 * - Network error detection (throws NetworkError for fetch failures)
 * - Structured error types for better error handling
 * - No alert() calls - errors are returned to callers
 * 
 * Error handling:
 * - OfflineError: User is offline (navigator.onLine === false)
 * - NetworkError: Fetch failed (network error, server unreachable, etc.)
 * - Regular Error: Other errors (server errors, etc.)
 * 
 * Usage:
 * try {
 *   const res = await apiFetch('/api/checkins');
 *   const data = await res.json();
 * } catch (err) {
 *   if (err instanceof OfflineError) {
 *     // Handle offline state
 *   } else if (err instanceof NetworkError) {
 *     // Handle network error
 *   }
 * }
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  
  // Early offline detection
  if (typeof window !== 'undefined' && !navigator.onLine) {
    throw new OfflineError();
  }
  
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
    // Handle offline/network errors
    if (err instanceof TypeError) {
      // TypeError usually means fetch failed (network error, CORS, etc.)
      // Check if we're actually offline
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new OfflineError();
      }
      // Otherwise, it's a network error (server unreachable, etc.)
      throw new NetworkError();
    }
    
    // Re-throw our custom errors
    if (err instanceof OfflineError || err instanceof NetworkError) {
      throw err;
    }
    
    // Logga endast riktiga fel, inte 401
    if (!(err instanceof Error && err.message.includes('401'))) {
      console.error('[apiFetch] Error:', path, err);
    }
    
    // Re-throw other errors as-is
    throw err;
  }
}

