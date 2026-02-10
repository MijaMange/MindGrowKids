import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../utils/config';
import type { AgeGroup } from '../config/ageConfig';

interface AgeContextValue {
  ageGroup: AgeGroup | null;
  setAgeGroup: (age: AgeGroup) => Promise<void>;
  loading: boolean;
}

const AgeContext = createContext<AgeContextValue>({
  ageGroup: null,
  setAgeGroup: async () => {},
  loading: true,
});

export function AgeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ageGroup, setAgeGroupState] = useState<AgeGroup | null>(null);
  const [loading, setLoading] = useState(true);

  // Load age group from server when user is available
  useEffect(() => {
    if (!user || user.role !== 'child') {
      setLoading(false);
      return;
    }

    async function loadAgeGroup() {
      try {
        const res = await apiFetch('/api/children/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAgeGroupState(data.ageGroup || null);
        }
      } catch (err) {
        console.error('[AgeContext] Failed to load age group:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAgeGroup();
  }, [user]);

  async function setAgeGroup(age: AgeGroup) {
    if (!user || user.role !== 'child') {
      throw new Error('User not authenticated or not a child');
    }

    try {
      const res = await apiFetch('/api/children/age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ageGroup: age }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Get error message from response
        const errorMessage = data.message || data.error || res.statusText || `Serverfel (${res.status})`;
        console.error('[AgeContext] Failed to save age group:', res.status, errorMessage);
        throw new Error(errorMessage);
      }

      setAgeGroupState(data.ageGroup || age);
    } catch (err) {
      console.error('[AgeContext] Failed to save age group:', err);
      // Re-throw with a user-friendly message if it's not already an Error
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Kunde inte spara ålder. Försök igen.');
    }
  }

  return (
    <AgeContext.Provider value={{ ageGroup, setAgeGroup, loading }}>
      {children}
    </AgeContext.Provider>
  );
}

export function useAge() {
  return useContext(AgeContext);
}
