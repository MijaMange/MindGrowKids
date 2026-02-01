import { useJourney } from '../JourneyStore';
import { motion } from 'framer-motion';
import { playTap } from '../sounds';

const tags = [
  { label: '🏫 Skola', value: 'Skola' },
  { label: '🧒 Kompis', value: 'Kompis' },
  { label: '🏡 Hemma', value: 'Hemma' },
  { label: '🌦️ Vädret', value: 'Vädret' },
  { label: '😴 Trött', value: 'Trött' },
  { label: '💭 Annat', value: 'Annat' },
];

export default function StepWhy() {
  const setNote = useJourney((s) => s.setNote);

  function pick(v: string) {
    playTap();
    setNote(v);
    // liten "reaktion" i avataren via temporär flagga i store
    useJourney.getState().pokeAvatar();
    // gå vidare
    useJourney.getState().next();
  }

  return (
    <div style={{ display: 'grid', gap: 18, justifyItems: 'center' }}>
      <h2 style={{ fontSize: '1.6rem', textAlign: 'center', color: 'var(--mg-ink)' }}>
        Vad tror du fick dig att känna så?
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 10 }}>
        {tags.map((t) => (
          <motion.button
            key={t.value}
            whileTap={{ scale: 0.96 }}
            onClick={() => pick(t.value)}
            style={{
              padding: '0.9rem 1.4rem',
              fontSize: '1.2rem',
              borderRadius: '999px',
              border: 'none',
              background: '#ffffff',
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--mg-ink)',
            }}
          >
            {t.label}
          </motion.button>
        ))}
      </div>
      <button
        onClick={() => useJourney.getState().next()}
        style={{
          background: 'none',
          color: '#4d7c6b',
          fontSize: '1rem',
          textDecoration: 'underline',
          marginTop: '.6rem',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Hoppa över →
      </button>
    </div>
  );
}

