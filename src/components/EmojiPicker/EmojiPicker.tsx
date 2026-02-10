import { motion } from 'framer-motion';
import './EmojiPicker.css';

/** Curated emoji set - organized by category */
const EMOJI_SET = [
  // Smiles
  '🙂', '😊', '😄', '😎', '🤩', '😇',
  // Feelings
  '🥺', '😌', '😴', '😮', '😡', '😱',
  // Animals
  '🐶', '🐱', '🐻', '🐼', '🐸', '🐯',
  // Fun
  '🌈', '⭐️', '💛', '💙', '🌸', '🍀',
  // More smiles
  '😀', '😃', '😁', '🥳', '🤗', '🥰',
  // More fun
  '🦋', '🌻', '✨', '🫶', '❤️', '🧒',
];

interface EmojiPickerProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  /** 'tray' = fixed bottom drawer, 'inline' = in-flow block below avatar (always visible) */
  variant?: 'tray' | 'inline';
}

/**
 * EmojiPicker - Emoji grid for profile avatar
 * variant 'tray': fixed bottom drawer. variant 'inline': in-flow block (visible under avatar).
 * Child-friendly: large tap targets, clear selection
 */
export function EmojiPicker({ selectedEmoji, onEmojiSelect, variant = 'tray' }: EmojiPickerProps) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isInline = variant === 'inline';

  return (
    <motion.div
      className={`emoji-picker-tray ${isInline ? 'emoji-picker-inline' : ''}`}
      initial={isInline ? undefined : (prefersReducedMotion ? { opacity: 1 } : { y: 100, opacity: 0 })}
      animate={isInline ? undefined : (prefersReducedMotion ? {} : { y: 0, opacity: 1 })}
      transition={isInline ? undefined : (prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 })}
      role="group"
      aria-label="Välj din emoji"
    >
      {isInline && (
        <h2 className="emoji-picker-inline-title">Välj din figur</h2>
      )}
      <div className="emoji-picker-grid">
        {EMOJI_SET.map((emoji) => {
          const isSelected = selectedEmoji === emoji;
          return (
            <motion.button
              key={emoji}
              type="button"
              className={`emoji-picker-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onEmojiSelect(emoji)}
              aria-pressed={isSelected}
              aria-label={`Välj ${emoji}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {isSelected && (
                <motion.span
                  className="emoji-picker-item-ring"
                  layoutId="emoji-picker-ring"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              {isSelected && !prefersReducedMotion && (
                <motion.span
                  className="emoji-picker-item-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <span className="emoji-picker-item-icon" aria-hidden>
                {emoji}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
