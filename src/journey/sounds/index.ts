// Conditional import för Howl
let Howl: any = null;
try {
  Howl = require('howler').Howl;
} catch {
  // Howl inte tillgängligt
}

// Fallback om ljudfiler inte finns - använd Web Audio API istället
let muted = false;

export function setMuted(v: boolean) {
  muted = v;
}

export function isMuted() {
  return muted;
}

// Enkel Web Audio API fallback för tap-ljud
function playTapFallback() {
  if (muted || typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 520;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.start(now);
    o.stop(now + 0.12);
  } catch {}
}

// Enkel Web Audio API fallback för success-ljud
function playSuccessFallback() {
  if (muted || typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.value = 660;
    o2.frequency.value = 880;
    o1.connect(g);
    o2.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    o1.start(now);
    o2.start(now + 0.12);
    o1.stop(now + 0.3);
    o2.stop(now + 0.3);
  } catch {}
}

// Prova att ladda Howl-ljud, annars använd fallback
let sfxTap: { play: () => void } | null = null;
let sfxSuccess: { play: () => void } | null = null;

try {
  // Om ljudfiler finns i public/sfx/, använd Howl
  if (typeof window !== 'undefined' && Howl) {
    sfxTap = new Howl({ src: ['/sfx/tap.mp3'], volume: 0.3, onloaderror: () => (sfxTap = null) });
    sfxSuccess = new Howl({ src: ['/sfx/success.mp3'], volume: 0.3, onloaderror: () => (sfxSuccess = null) });
  }
} catch {
  // Howl inte tillgängligt, använd fallback
}

export function playTap() {
  if (muted) return;
  if (sfxTap) {
    sfxTap.play();
  } else {
    playTapFallback();
  }
}

export function playSuccess() {
  if (muted) return;
  if (sfxSuccess) {
    sfxSuccess.play();
  } else {
    playSuccessFallback();
  }
}

