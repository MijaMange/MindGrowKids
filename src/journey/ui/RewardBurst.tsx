import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function RewardBurst({ show, amount }: { show: boolean; amount: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'var(--mg-good)',
              color: '#fff',
              padding: '24px 32px',
              borderRadius: '20px',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: '0 16px 32px rgba(0,0,0,.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span>🌟</span>
            <span>+{amount}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}




