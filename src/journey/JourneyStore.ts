import { create } from 'zustand';

export type Emotion = 'glad' | 'lugn' | 'trött' | 'ledsen' | 'nyfiken' | 'arg';

type JourneyState = {
  step: number; // 0..N
  emotion?: Emotion;
  note?: string;
  drawingData?: string; // dataURL
  rewards: number;
  pokedAt?: number;
  setEmotion: (e: Emotion) => void;
  next: () => void;
  prev: () => void;
  setNote: (s: string) => void;
  setDrawing: (d: string) => void;
  addReward: (n: number) => void;
  pokeAvatar: () => void;
  reset: () => void;
};

export const useJourney = create<JourneyState>((set) => ({
  step: 0,
  rewards: 0,
  setEmotion: (emotion) => set({ emotion }),
  next: () => set((s) => ({ step: s.step + 1 })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  setNote: (note) => set({ note }),
  setDrawing: (drawingData) => set({ drawingData }),
  addReward: (n) => set((s) => ({ rewards: s.rewards + n })),
  pokeAvatar: () => set({ pokedAt: Date.now() }),
  reset: () => set({ step: 0, emotion: undefined, note: undefined, drawingData: undefined, rewards: 0, pokedAt: undefined }),
}));

