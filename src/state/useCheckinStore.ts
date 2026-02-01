import { create } from 'zustand';

export type Mode = 'text' | 'drawing' | 'voice';
export type Emotion = 'happy' | 'calm' | 'tired' | 'sad' | 'curious' | 'angry' | '';

interface CheckinState {
  emotion: Emotion;
  note: string;
  mode: Mode;
  setEmotion: (e: Emotion) => void;
  setNote: (t: string) => void;
  setMode: (m: Mode) => void;
  reset: () => void;
}

export const useCheckinStore = create<CheckinState>((set) => ({
  emotion: '',
  note: '',
  mode: 'text',
  setEmotion: (emotion) => set({ emotion }),
  setNote: (note) => set({ note }),
  setMode: (mode) => set({ mode }),
  reset: () => set({ emotion: '', note: '', mode: 'text' }),
}));




