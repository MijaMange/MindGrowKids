import { create } from 'zustand';

type MoodVals = { love: number; joy: number; calm: number; energy: number; sadness: number; anger: number };

type S = {
  values: MoodVals;
  loaded: boolean;
  load: () => Promise<void>;
  award: (reason: string, delta?: Partial<MoodVals>) => Promise<void>;
};

export const useMoodStore = create<S>((set, get) => ({
  values: { love: 50, joy: 50, calm: 50, energy: 50, sadness: 50, anger: 50 },
  loaded: false,
  load: async () => {
    try {
      const r = await fetch('/api/mood/me', { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        set({ values: d.values, loaded: true });
      }
    } catch {
      // Silent fail
    }
  },
  award: async (reason, delta) => {
    try {
      const r = await fetch('/api/mood/award', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(delta ? { reason, delta } : { reason }),
      });
      if (r.ok) {
        const d = await r.json();
        set({ values: d.values });
      }
    } catch {
      // Silent fail
    }
  },
}));




