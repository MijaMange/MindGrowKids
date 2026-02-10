import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { EmojiOverlay } from '../../state/useEmojiAvatarStore';
import './AvatarPickerBar.css';

/** All emoji options visible at once – no categories, no hiding */
const EMOJI_OPTIONS = [
  '😊', '😄', '🥰', '😎', '🤗', '😌', '🙂', '🌟',
  '😀', '😃', '😁', '🥳', '🤩', '😇', '🦋', '🐻',
  '🌸', '🌈', '❤️', '🧒', '😺', '🌻', '✨', '🫶',
];

const OVERLAY_OPTIONS: { id: EmojiOverlay; icon: string }[] = [
  { id: '', icon: '○' },
  { id: 'hat', icon: '🧢' },
  { id: 'glasses', icon: '👓' },
  { id: 'star', icon: '⭐' },
  { id: 'heart', icon: '❤️' },
];

interface AvatarPickerBarProps {
  selectedEmoji: string;
  selectedOverlay: EmojiOverlay;
  onEmojiSelect: (emoji: string) => void;
  onOverlaySelect: (overlay: EmojiOverlay) => void;
}

/**
 * Horizontal scroll bar with all avatar emoji options visible.
 * Big tap targets (56–64px), selected ring + scale, no hidden categories.
 */
export function AvatarPickerBar({
  selectedEmoji,
  selectedOverlay,
  onEmojiSelect,
  onOverlaySelect,
}: AvatarPickerBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Optional: scroll selected into view when it changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const selected = el.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedEmoji]);

  return (
    <div className="avatar-picker-bar-wrap">
      <div ref={scrollRef} className="avatar-picker-bar" role="group" aria-label="Välj din figur">
        {EMOJI_OPTIONS.map((e) => {
          const isSelected = selectedEmoji === e;
          return (
            <motion.button
              key={e}
              type="button"
              className={`avatar-picker-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onEmojiSelect(e)}
              aria-pressed={isSelected}
              data-selected={isSelected ? 'true' : undefined}
              aria-label={`Välj ${e}`}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {isSelected && (
                <motion.span
                  className="avatar-picker-option-ring"
                  layoutId="avatar-picker-ring"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="avatar-picker-option-emoji" aria-hidden>{e}</span>
            </motion.button>
          );
        })}
        <span className="avatar-picker-bar-divider" aria-hidden />
        {OVERLAY_OPTIONS.map(({ id, icon }) => {
          const isSelected = selectedOverlay === id;
          return (
            <motion.button
              key={id || 'none'}
              type="button"
              className={`avatar-picker-option avatar-picker-overlay ${isSelected ? 'selected' : ''}`}
              onClick={() => onOverlaySelect(id)}
              aria-pressed={isSelected}
              aria-label={id ? `Dekoration ${icon}` : 'Ingen dekoration'}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {isSelected && (
                <motion.span
                  className="avatar-picker-option-ring"
                  layoutId="avatar-picker-overlay-ring"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="avatar-picker-option-emoji" aria-hidden>{icon}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
