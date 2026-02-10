import { create } from 'zustand';

const DEFAULT_EMOJI = '😊';

type S = {
  emoji: string;
  setEmoji: (emoji: string) => void;
  loadFromServer: () => Promise<void>;
  saveToServer: () => Promise<boolean>;
};

export const useEmojiAvatarStore = create<S>((set, get) => ({
  emoji: DEFAULT_EMOJI,

  setEmoji: (emoji) => set({ emoji }),

  loadFromServer: async () => {
    try {
      const r = await fetch('/api/avatar/me', { credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        if (data && typeof data.emoji === 'string') {
          set({ emoji: data.emoji });
          return;
        }
      }
      set({ emoji: DEFAULT_EMOJI });
    } catch {
      set({ emoji: DEFAULT_EMOJI });
    }
  },

  saveToServer: async () => {
    try {
      const { emoji } = get();
      const r = await fetch('/api/avatar/me', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      return r.ok;
    } catch {
      return false;
    }
  },
}));
