import { createContext, useContext, useState } from 'react';
import { apiFetch } from '../utils/config';

type Role = 'child' | 'parent' | 'pro' | null;
export type User = { role: Role; name?: string; classCode?: string; id?: string } | null;

interface AuthContextValue {
  user: User;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue>({
  user: null,
  login: async () => false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  async function login({ username, password }: { username: string; password: string }): Promise<boolean> {
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
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      return false;
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
