import { motion } from 'framer-motion';
import './FloatingAvatarPreview.css';

interface FloatingAvatarPreviewProps {
  emoji: string;
  size?: number;
}

/**
 * FloatingAvatarPreview - Large emoji bubble with subtle floating animation
 * Child-friendly: big, clear, calm
 */
const FALLBACK_EMOJI = '😊';

export function FloatingAvatarPreview({ emoji, size = 140 }: FloatingAvatarPreviewProps) {
  const displayEmoji = emoji || FALLBACK_EMOJI;
  const safeSize = Math.max(120, size);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      className="floating-avatar-preview"
      style={{
        width: safeSize,
        height: safeSize,
        minWidth: safeSize,
        minHeight: safeSize,
      }}
      animate={prefersReducedMotion ? {} : {
        y: [0, -8, 0],
      }}
      transition={prefersReducedMotion ? {} : {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="floating-avatar-bubble">
        <span className="floating-avatar-emoji" aria-hidden>
          {displayEmoji}
        </span>
      </div>
    </motion.div>
  );
}
