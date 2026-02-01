export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;

  const trimmed = (text || '').trim();
  if (!trimmed) return;

  const u = new SpeechSynthesisUtterance(trimmed);
  u.lang = 'sv-SE';
  u.rate = 1;
  u.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}




