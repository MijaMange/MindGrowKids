/**
 * Age utilities: calculate age from DOB, map to age band.
 * When DOB is missing or invalid, use DEFAULT_AGE_BAND ("lagom komplicerat").
 */

import type { AgeGroup } from '../config/ageConfig';

/** Default band when DOB is missing – 6–7: lagom komplicerat, 6 känslor, text valfritt */
export const DEFAULT_AGE_BAND: AgeGroup = '6-7';

/** Valid age bands for UX (2–4 = färre känslor, ingen fri text) */
export const AGE_BANDS: AgeGroup[] = ['2-4', '4-5', '6-7', '8-10'];

/**
 * Calculate age in full years from date of birth.
 * Uses today's date; returns 0 if dob is in the future or invalid.
 */
export function calculateAge(dob: string | Date | null | undefined): number | null {
  if (dob == null || dob === '') return null;
  const d = typeof dob === 'string' ? new Date(dob) : dob;
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  if (d > today) return null;
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age < 0 ? 0 : age;
}

/**
 * Map age in years to age band for UX.
 * Returns DEFAULT_AGE_BAND when age is null/negative.
 */
export function getAgeBand(age: number | null | undefined): AgeGroup {
  if (age == null || age < 0) return DEFAULT_AGE_BAND;
  if (age <= 4) return '2-4';
  if (age <= 5) return '4-5';
  if (age <= 7) return '6-7';
  return '8-10';
}

/**
 * Get age band from DOB string (ISO date). Returns DEFAULT_AGE_BAND if missing/invalid.
 */
export function getAgeBandFromDob(dob: string | null | undefined): AgeGroup {
  const age = calculateAge(dob);
  return getAgeBand(age);
}
