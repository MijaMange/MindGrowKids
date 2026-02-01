import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import './parallax-sky.css';

export function ParallaxSky() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 30, damping: 12 });
  const y = useSpring(my, { stiffness: 30, damping: 12 });

  const bgX = useTransform(x, [-50, 50], [-10, 10]);
  const bgY = useTransform(y, [-50, 50], [-6, 6]);

  function onMove(e: React.MouseEvent) {
    const { innerWidth, innerHeight } = window;
    const rx = (e.clientX / innerWidth) * 100 - 50;
    const ry = (e.clientY / innerHeight) * 100 - 50;
    mx.set(rx);
    my.set(ry);
  }

  return (
    <motion.div className="sky" onMouseMove={onMove}>
      <motion.div className="gradient" style={{ x: bgX, y: bgY }} />
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`cloud c${(i % 4) + 1}`}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {[...Array(20)].map((_, i) => (
        <motion.span
          key={`p${i}`}
          className="particle"
          animate={{ y: [0, -6, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 3 + (i % 5),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.12,
          }}
          style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%` }}
        >
          ✨
        </motion.span>
      ))}
    </motion.div>
  );
}




