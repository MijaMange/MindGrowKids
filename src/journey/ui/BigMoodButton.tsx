import { motion } from 'framer-motion';

export function BigMoodButton({
  label,
  emoji,
  color,
  onSelect,
}: {
  label: string;
  emoji: string;
  color: string;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      style={{
        width: 'min(36rem, 88vw)',
        maxWidth: '20rem',
        minHeight: '5.5rem',
        borderRadius: '1.25rem',
        background: color,
        color: '#1d2b24',
        border: 'none',
        fontSize: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        boxShadow: '0 12px 20px rgba(0,0,0,.08)',
        fontWeight: 700,
        cursor: 'pointer',
        padding: '12px 20px',
      }}
    >
      <span style={{ fontSize: '1.9rem' }}>{emoji}</span> {label}
    </motion.button>
  );
}




