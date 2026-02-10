import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { EmojiOverlay } from '../../state/useEmojiAvatarStore';
import './AvatarFloating.css';

interface AvatarFloatingProps {
  emoji: string;
  overlay: EmojiOverlay;
  /** Base size in px (avatar area); bubble is slightly larger */
  size?: number;
  className?: string;
}

const overlayEmojiMap: Record<EmojiOverlay, string | null> = {
  '': null,
  hat: '🧢',
  glasses: '👓',
  star: '⭐',
  heart: '❤️',
};

/**
 * Avatar emoji floating on the app background with glow bubble and gentle animation.
 * No white container – sits directly on green gradient.
 */
export function AvatarFloating({ emoji, overlay, size = 180, className = '' }: AvatarFloatingProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const overlayEmoji = overlayEmojiMap[overlay];

  return (
    <motion.div
      className={`avatar-floating-bubble ${className}`.trim()}
      style={{
        width: size + 48,
        height: size + 48,
        ['--avatar-size' as string]: `${size}px`,
      }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              y: [0, -10, 0],
              scale: [1, 1.02, 1],
              boxShadow: [
                '0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3)',
                '0 16px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.4)',
                '0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3)',
              ],
            }
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      role="img"
      aria-label="Min figur"
    >
      <div className="avatar-floating-inner">
        <span className="avatar-floating-emoji" style={{ fontSize: size * 0.6 }}>
          {emoji}
        </span>
        {overlayEmoji && (
          <span className="avatar-floating-overlay" style={{ fontSize: size * 0.28 }}>
            {overlayEmoji}
          </span>
        )}
      </div>
    </motion.div>
  );
}
