/**
 * Canonical list of basic emotions for MindGrow – child-friendly, emoji-first.
 * Final locked set: Glad, Ledsen, Arg, Trött, Rädd, Orolig.
 * No "Lugn" – not a clear child emotion; emoji does not communicate without text.
 */

export type EmotionKey = 'happy' | 'sad' | 'angry' | 'tired' | 'afraid' | 'worried';

export interface EmotionOption {
  key: EmotionKey;
  label: string;
  emoji: string;
}

/** All 6 base emotions – understandable without reading; emoji is primary. No "Lugn". */
export const BASE_EMOTIONS: EmotionOption[] = [
  { key: 'happy', label: 'Glad', emoji: '🙂' },
  { key: 'sad', label: 'Ledsen', emoji: '😢' },
  { key: 'angry', label: 'Arg', emoji: '😠' },
  { key: 'tired', label: 'Trött', emoji: '😴' },
  { key: 'afraid', label: 'Rädd', emoji: '😨' },
  { key: 'worried', label: 'Orolig', emoji: '😟' },
];

/** Emotion keys in display order. */
export const EMOTION_KEYS: EmotionKey[] = BASE_EMOTIONS.map((e) => e.key);

export function getEmotionOption(key: EmotionKey): EmotionOption | undefined {
  return BASE_EMOTIONS.find((e) => e.key === key);
}

/** Legacy keys (no longer selectable) – for display of old checkins only */
const LEGACY_LABELS: Record<string, string> = {
  calm: 'Lugn',
  curious: 'Nyfiken',
  nervous: 'Nervös',
  stomach: 'Ont i magen',
};

const LEGACY_EMOJIS: Record<string, string> = {
  calm: '🫶',
  curious: '🧐',
  nervous: '😰',
  stomach: '🤢',
};

export function getEmotionLabel(key: string): string {
  return getEmotionOption(key as EmotionKey)?.label ?? LEGACY_LABELS[key] ?? key;
}

export function getEmotionEmoji(key: string): string {
  return getEmotionOption(key as EmotionKey)?.emoji ?? LEGACY_EMOJIS[key] ?? '💭';
}
