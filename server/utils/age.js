/**
 * Age utilities for backend: derive age from DOB, map to age band.
 * When DOB is missing or invalid, use DEFAULT_AGE_BAND ('6-7', lagom komplicerat).
 */

export const DEFAULT_AGE_BAND = '6-7';

const VALID_AGE_BANDS = ['2-4', '4-5', '6-7', '8-10'];

/**
 * Calculate age in full years from date of birth.
 * @param {string|Date|null|undefined} dob
 * @returns {number|null}
 */
export function calculateAge(dob) {
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
 * @param {number|null|undefined} age
 * @returns {string} Age band: '2-4' | '4-5' | '6-7' | '8-10'
 */
export function getAgeBand(age) {
  if (age == null || age < 0) return DEFAULT_AGE_BAND;
  if (age <= 4) return '2-4';
  if (age <= 5) return '4-5';
  if (age <= 7) return '6-7';
  return '8-10';
}

/**
 * Get age band from DOB. Returns DEFAULT_AGE_BAND if missing/invalid.
 * @param {string|Date|null|undefined} dob
 * @returns {string}
 */
export function getAgeBandFromDob(dob) {
  const age = calculateAge(dob);
  return getAgeBand(age);
}

export function isValidAgeBand(band) {
  return band && VALID_AGE_BANDS.includes(band);
}
