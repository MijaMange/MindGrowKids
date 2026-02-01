import { motion } from 'framer-motion';
import { useJourney } from '../JourneyStore';

const moodToColor: Record<string, string> = {
  glad: 'var(--mg-good)',
  lugn: 'var(--mg-calm)',
  trött: 'var(--mg-tired)',
  ledsen: 'var(--mg-sad)',
  nyfiken: 'var(--mg-curious)',
  arg: 'var(--mg-angry)',
};

export default function AnimatedAvatar({ size = 140 }: { size?: number }) {
  const emotion = useJourney((s) => s.emotion) || 'lugn';
  const pokedAt = useJourney((s) => s.pokedAt);
  const isPoked = pokedAt && Date.now() - pokedAt < 1200;
  const col = moodToColor[emotion];

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: '999px',
        background: col,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 12px 24px rgba(0,0,0,.08)',
        position: 'relative',
      }}
      animate={isPoked ? { scale: [1, 1.08, 1] } : { y: [0, -4, 0] }}
      transition={isPoked ? { duration: 0.6 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    >
      {/* "ögon" */}
      <motion.div
        style={{ display: 'flex', gap: 16, position: 'relative', top: -size * 0.15 }}
        animate={{ scale: emotion === 'arg' ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        <motion.div
          style={{ width: 14, height: 14, background: '#1d2b24', borderRadius: '999px' }}
          animate={{ scale: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: 0.2 }}
        />
        <motion.div
          style={{ width: 14, height: 14, background: '#1d2b24', borderRadius: '999px' }}
          animate={{ scale: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2.6, delay: 0.4 }}
        />
      </motion.div>
      {/* mun */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: size * 0.24,
          width: emotion === 'ledsen' ? 26 : emotion === 'glad' ? 32 : 28,
          height: 10,
          borderRadius: 999,
          background: '#1d2b24',
        }}
        animate={{
          rotate: emotion === 'ledsen' ? -20 : emotion === 'glad' ? 20 : 0,
          scaleY: emotion === 'glad' ? 0.6 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200 }}
      />
    </motion.div>
  );
}

