import type { Emotion } from '../state/useCheckinStore';
import { EMOTION_KEYS } from './emotions';
import { DEFAULT_AGE_BAND } from '../utils/age';

export type AgeGroup = '2-4' | '4-5' | '6-7' | '8-10';

export interface AgeConfig {
  emotions: Emotion[];
  allowText: boolean;
  allowFreeDrawing: boolean;
  maxChoices: number;
  allowFreeWriting: boolean;
}

/** All 6 base emotions. */
const BASE_EMOTIONS_LIST: Emotion[] = EMOTION_KEYS;

/** 4 emotions for youngest (2–4): Glad, Ledsen, Arg, Trött */
const EMOTIONS_2_4: Emotion[] = EMOTION_KEYS.slice(0, 4);

/**
 * Age configuration system - controls entire UX based on child's age
 */
export const AGE_CONFIGS: Record<AgeGroup, AgeConfig> = {
  '2-4': {
    emotions: EMOTIONS_2_4,
    allowText: false,
    allowFreeDrawing: true,
    maxChoices: 4,
    allowFreeWriting: false,
  },
  '4-5': {
    emotions: BASE_EMOTIONS_LIST,
    allowText: false,
    allowFreeDrawing: true,
    maxChoices: 6,
    allowFreeWriting: false,
  },
  '6-7': {
    emotions: BASE_EMOTIONS_LIST,
    allowText: true,
    allowFreeDrawing: true,
    maxChoices: 6,
    allowFreeWriting: false,
  },
  '8-10': {
    emotions: BASE_EMOTIONS_LIST,
    allowText: true,
    allowFreeDrawing: true,
    maxChoices: 6,
    allowFreeWriting: true,
  },
};

/**
 * Get age config for a given age group.
 * When DOB/age missing: use DEFAULT_AGE_BAND (6–7, lagom komplicerat).
 */
export function getAgeConfig(ageGroup: AgeGroup | null | undefined): AgeConfig {
  if (!ageGroup || !AGE_CONFIGS[ageGroup]) {
    return AGE_CONFIGS[DEFAULT_AGE_BAND];
  }
  return AGE_CONFIGS[ageGroup];
}

/**
 * Filter emotions based on age config
 */
export function getEmotionsForAge(ageGroup: AgeGroup | null | undefined): Emotion[] {
  return getAgeConfig(ageGroup).emotions;
}
