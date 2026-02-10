import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/config';

type Role = 'child' | 'parent' | 'pro' | null;
export type User = { role: Role; name?: string; classCode?: string; id?: string } | null;

export type LoginResult = { success: true } | { success: false; error: string };

interface AuthContextValue {
  user: User;
  login: (credentials: { username: string; password: string }) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue>({
  user: null,
  login: async () => ({ success: false, error: '' }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Återställ session vid start (cookie finns kvar)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await apiFetch('/api/auth/me', { credentials: 'include' });
        if (cancelled || !r.ok) return;
        const d = await r.json();
        if (d.ok && d.role) {
          setUser({ role: d.role, id: d.id });
        }
      } catch {
        // Tyst – användaren är bara inte inloggad
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function login({ username, password }: { username: string; password: string }): Promise<LoginResult> {
    try {
      const r = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: username, password }),
      });

      if (r.ok) {
        const d = await r.json();
        setUser({
          role: d.role,
          name: d.name,
          classCode: d.classCode,
          id: d.id,
        });
        return { success: true };
      }
      const body = await r.json().catch(() => ({}));
      const message = body?.message || body?.error || 'Fel användarnamn eller lösenord';
      return { success: false, error: message };
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      const message = err instanceof Error ? err.message : 'Kunde inte ansluta. Kontrollera att servern körs.';
      return { success: false, error: message };
    }
  }

  async function logout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      setUser(null);
    }
  }

  return (
    <Ctx.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
