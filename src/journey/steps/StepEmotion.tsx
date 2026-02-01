import { BigMoodButton } from '../ui/BigMoodButton';
import { useJourney } from '../JourneyStore';
import { playTap } from '../sounds';
import type { Emotion } from '../JourneyStore';

const moods = [
  { key: 'glad', emoji: '😊', color: 'var(--mg-good)' },
  { key: 'lugn', emoji: '🫧', color: 'var(--mg-calm)' },
  { key: 'trött', emoji: '🥱', color: 'var(--mg-tired)' },
  { key: 'ledsen', emoji: '😔', color: 'var(--mg-sad)' },
  { key: 'nyfiken', emoji: '🧐', color: 'var(--mg-curious)' },
  { key: 'arg', emoji: '😠', color: 'var(--mg-angry)' },
] as const;

export default function StepEmotion() {
  const set = useJourney((s) => s.setEmotion);
  const next = useJourney((s) => s.next);

  function handleSelect(key: string) {
    playTap();
    set(key as Emotion);
    next();
  }

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <h1 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--mg-ink)', marginBottom: '8px' }}>
        Hur känns det just nu?
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          width: '100%',
          maxWidth: '800px',
        }}
      >
        {moods.map((m) => (
          <BigMoodButton key={m.key} label={m.key} emoji={m.emoji} color={m.color} onSelect={() => handleSelect(m.key)} />
        ))}
      </div>
    </div>
  );
}




