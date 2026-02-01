import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useJourney } from '../JourneyStore';

export default function StepBreath() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const next = useJourney((s) => s.next);
  const timerRef = useRef<number | undefined>(undefined);

  // räkna 1→3 med ca 4s cykel (in + ut)
  useEffect(() => {
    setCount(0);
    setDone(false);
    let c = 0;
    const loop = () => {
      c += 1;
      setCount(c);
      if (c >= 3) {
        setDone(true);
        timerRef.current = window.setTimeout(() => next(), 900); // auto
        return;
      }
      timerRef.current = window.setTimeout(loop, 4000); // nästa andetag
    };
    loop();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [next]);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--mg-ink)' }}>
        Andas lugnt
      </h2>
      <div style={{ opacity: 0.7, fontSize: '1.1rem', color: 'var(--mg-ink)' }}>Räkna: {count} / 3</div>
      <motion.div
        style={{
          width: 140,
          height: 140,
          borderRadius: 999,
          background: 'var(--mg-calm)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontSize: '2.5rem',
        }}
        animate={{ scale: done ? 1 : [1, 1.25, 1] }}
        transition={{ duration: 4, repeat: done ? 0 : Infinity, ease: 'easeInOut' }}
      >
        {done ? '✨' : '🫧'}
      </motion.div>
      <div style={{ display: 'flex', gap: 8, marginTop: '12px' }}>
        <button className="nav-btn" onClick={() => useJourney.getState().prev()}>
          ← Tillbaka
        </button>
        <button
          className="nav-btn"
          onClick={() => next()}
          disabled={!done}
          title={!done ? 'Vänta tills vi räknat till 3' : 'Klar'}
          style={{ opacity: done ? 1 : 0.5, cursor: done ? 'pointer' : 'not-allowed' }}
        >
          Klar →
        </button>
        <button className="nav-btn" onClick={() => next()}>
          Hoppa över
        </button>
      </div>
    </div>
  );
}

