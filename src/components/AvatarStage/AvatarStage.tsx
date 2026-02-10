import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { EmojiOverlay } from '../../state/useEmojiAvatarStore';
import './AvatarStage.css';

interface AvatarStageProps {
  emoji: string;
  overlay: EmojiOverlay;
  size?: number;
  className?: string;
}

/** Anchor: where the accessory attaches. No accessory below the emoji. */
const OVERLAY_CONFIG: Record<
  Exclude<EmojiOverlay, ''>,
  { emoji: string; anchor: 'headTop' | 'eyes' | 'effects' }
> = {
  hat: { emoji: '🧢', anchor: 'headTop' },
  glasses: { emoji: '👓', anchor: 'eyes' },
  star: { emoji: '⭐', anchor: 'effects' },
  heart: { emoji: '❤️', anchor: 'effects' },
};

/**
 * Centered avatar stage with layered rendering.
 * Accessories attach to correct anchors: headTop (hats), eyes (glasses), effects (star/heart).
 * Nothing appears below the emoji.
 */
export function AvatarStage({ emoji, overlay, size = 200, className = '' }: AvatarStageProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const overlayInfo = overlay ? OVERLAY_CONFIG[overlay] : null;

  return (
    <motion.div
      className={`avatar-stage-bubble ${className}`.trim()}
      style={{
        width: size + 56,
        height: size + 56,
        ['--avatar-stage-size' as string]: `${size}px`,
      }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              y: [0, -8, 0],
              scale: [1, 1.02, 1],
              boxShadow: [
                '0 12px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.25)',
                '0 14px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.35)',
                '0 12px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.25)',
              ],
            }
      }
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label="Min figur"
    >
      <div className="avatar-stage-inner">
        {/* Layer 1: Base face (always centered) */}
        <div className="avatar-stage-base">
          <span className="avatar-stage-emoji" style={{ fontSize: size * 0.55 }}>
            {emoji}
          </span>
        </div>

        {/* Layer 2: Headwear – anchor at top of "head" (above emoji) */}
        {overlayInfo?.anchor === 'headTop' && (
          <motion.div
            className="avatar-stage-layer avatar-stage-head"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ fontSize: size * 0.32 }}
          >
            {overlayInfo.emoji}
          </motion.div>
        )}

        {/* Layer 3: Eyes – glasses over the face */}
        {overlayInfo?.anchor === 'eyes' && (
          <motion.div
            className="avatar-stage-layer avatar-stage-eyes"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ fontSize: size * 0.28 }}
          >
            {overlayInfo.emoji}
          </motion.div>
        )}

        {/* Layer 4: Effects – star/heart to the side (not below) */}
        {overlayInfo?.anchor === 'effects' && (
          <motion.div
            className="avatar-stage-layer avatar-stage-effects"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            style={{ fontSize: size * 0.24 }}
          >
            {overlayInfo.emoji}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
