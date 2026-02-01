const KEY = 'mgk-checkin-draft';
export function saveDraft(data: unknown) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}
export function loadDraft<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
export function clearDraft() {
  try { localStorage.removeItem(KEY); } catch {}
}




