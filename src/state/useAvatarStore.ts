import { create } from 'zustand';

export type AvatarData = {
  bodyTone: string;
  eye: string;
  eyeColor: string;
  mouth: string;
  hair: { style: string; color: string };
  outfitType: 'set' | 'topsBottoms';
  top: string;
  bottom: string;
  set: string;
  accessory: string;
  bg: string;
};

const DEFAULT_AVATAR: AvatarData = {
  bodyTone: '#F6D8C2',
  eye: 'round',
  eyeColor: '#2b2b2b',
  mouth: 'smile',
  hair: { style: 'short', color: '#3b2d2a' },
  outfitType: 'set',
  top: 'tee',
  bottom: 'shorts',
  set: 'overalls',
  accessory: '',
  bg: 'mint',
};

type S = {
  avatar: AvatarData;
  set: (patch: Partial<AvatarData>) => void;
  reset: () => void;
  loadFromServer: () => Promise<void>;
  saveToServer: () => Promise<boolean>;
};

export const useAvatarStore = create<S>((set, get) => ({
  avatar: DEFAULT_AVATAR,
  set: (patch) => set({ avatar: { ...get().avatar, ...patch } }),
  reset: () => set({ avatar: DEFAULT_AVATAR }),
  loadFromServer: async () => {
    try {
      const r = await fetch('/api/avatar/me', { credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        if (data && Object.keys(data).length)
          set({ avatar: { ...DEFAULT_AVATAR, ...data } });
      }
    } catch {
      // Silent fail
    }
  },
  saveToServer: async () => {
    try {
      const r = await fetch('/api/avatar/me', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(get().avatar),
      });
      return r.ok;
    } catch {
      return false;
    }
  },
}));




