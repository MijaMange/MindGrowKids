let muted = false;
export function setMuted(v: boolean) {
  muted = v;
}
export function isMuted() {
  return muted;
}

async function tone(
  freq: number,
  durMs: number,
  type: OscillatorType = 'sine',
  gain = 0.2
) {
  if (muted) return;
  try {
    const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
    o.start(now);
    o.stop(now + durMs / 1000);
  } catch {
    // Silent fail if audio context fails
  }
}

/** Mjuk pling med Web Audio API */
export async function playPling(durationMs = 220, freq = 660) {
  await tone(freq, durationMs, 'sine', 0.2);
}

export function sfxClick() {
  tone(520, 120, 'triangle', 0.15);
}

export function sfxWhoosh() {
  tone(260, 200, 'sawtooth', 0.12);
  setTimeout(() => tone(420, 120, 'sine', 0.09), 100);
}

export function sfxSuccess() {
  tone(660, 150, 'sine', 0.18);
  setTimeout(() => tone(880, 180, 'sine', 0.18), 120);
}

