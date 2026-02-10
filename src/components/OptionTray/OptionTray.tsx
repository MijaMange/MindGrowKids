import { motion } from 'framer-motion';
import type { ToolType } from '../SideToolPanel/SideToolPanel';
import type { EmojiOverlay } from '../../state/useEmojiAvatarStore';
import './OptionTray.css';

/** All emoji options – max 5-6 visible at once */
const EMOJI_OPTIONS = [
  '😊', '😄', '🥰', '😎', '🤗', '😌',
  '🙂', '🌟', '😀', '😃', '😁', '🥳',
  '🤩', '😇', '🦋', '🐻', '🌸', '🌈',
  '❤️', '🧒', '😺', '🌻', '✨', '🫶',
];

const HEADWEAR_OPTIONS: { id: EmojiOverlay; icon: string }[] = [
  { id: '', icon: '○' },
  { id: 'hat', icon: '🧢' },
];

const ACCESSORIES_OPTIONS: { id: EmojiOverlay; icon: string }[] = [
  { id: '', icon: '○' },
  { id: 'glasses', icon: '👓' },
  { id: 'star', icon: '⭐' },
  { id: 'heart', icon: '❤️' },
];

interface OptionTrayProps {
  tool: ToolType;
  selectedEmoji?: string;
  selectedOverlay?: EmojiOverlay;
  onEmojiSelect?: (emoji: string) => void;
  onOverlaySelect?: (overlay: EmojiOverlay) => void;
}

/**
 * Option tray that appears near the avatar when a tool is selected.
 * Shows 5-6 choices max, big tap targets (56px+), clear selected state.
 * Icons first, no reading required.
 */
export function OptionTray({
  tool,
  selectedEmoji,
  selectedOverlay,
  onEmojiSelect,
  onOverlaySelect,
}: OptionTrayProps) {
  let options: Array<{ id: string; icon: string }> = [];
  let selectedId: string | undefined;
  let onSelect: ((id: string) => void) | undefined;

  if (tool === 'face') {
    // Show all emojis but limit visible rows (wrap handles it, max ~6 per row)
    options = EMOJI_OPTIONS.map((emoji) => ({ id: emoji, icon: emoji }));
    selectedId = selectedEmoji;
    onSelect = onEmojiSelect;
  } else if (tool === 'headwear') {
    options = HEADWEAR_OPTIONS;
    selectedId = selectedOverlay === 'hat' ? 'hat' : '';
    onSelect = (id) => onOverlaySelect?.(id as EmojiOverlay);
  } else if (tool === 'colors') {
    // Stub: colors not implemented yet
    options = [];
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="option-tray"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      role="group"
      aria-label={`Välj ${tool === 'headwear' ? 'huvudbonad' : 'färger'}`}
    >
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            className={`option-tray-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect?.(option.id)}
            aria-pressed={isSelected}
            aria-label={option.id ? `Välj ${option.icon}` : 'Ingen'}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {isSelected && (
              <motion.span
                className="option-tray-item-ring"
                layoutId="option-tray-ring"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            {isSelected && (
              <motion.span
                className="option-tray-item-sparkle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 0.4, times: [0, 0.5, 1] }}
              >
                ✨
              </motion.span>
            )}
            <span className="option-tray-item-icon" aria-hidden>
              {option.icon}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
