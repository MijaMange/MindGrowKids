import { useEmojiAvatarStore, type EmojiOverlay } from '../../state/useEmojiAvatarStore';
import './EmojiAvatarPicker.css';

/** 6–8 emojis for "me" – recognizable, diverse, no text */
const EMOJI_OPTIONS = ['😊', '😄', '🥰', '😎', '🤗', '😌', '🙂', '🌟'];

const OVERLAY_OPTIONS: { id: EmojiOverlay; icon: string }[] = [
  { id: '', icon: '○' },
  { id: 'hat', icon: '🧢' },
  { id: 'glasses', icon: '👓' },
  { id: 'star', icon: '⭐' },
  { id: 'heart', icon: '❤️' },
];

interface EmojiAvatarPickerProps {
  /** When 'emoji', only show emoji grid (used from action bar). When 'full', show emoji + overlay. */
  mode?: 'emoji' | 'full';
  onClose: () => void;
  onChanged?: () => void;
}

/**
 * Emoji-based avatar picker: one tap = immediate, obvious change.
 * mode='emoji': emoji grid only. mode='full': emoji grid + overlay row.
 */
export function EmojiAvatarPicker({ mode = 'full', onClose, onChanged }: EmojiAvatarPickerProps) {
  const { emoji, overlay, setEmoji, setOverlay } = useEmojiAvatarStore();

  function pickEmoji(newEmoji: string) {
    setEmoji(newEmoji);
    onChanged?.();
    onClose();
  }

  function pickOverlay(newOverlay: EmojiOverlay) {
    setOverlay(newOverlay);
    onChanged?.();
    onClose();
  }

  return (
    <div
      className="emoji-picker-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Välj din figur"
    >
      <div className="emoji-picker-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="emoji-picker-close"
          onClick={onClose}
          aria-label="Stäng"
        >
          ×
        </button>

        <div className="emoji-picker-content">
          <div className="emoji-picker-row emoji-picker-emojis">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                className={`emoji-picker-option ${emoji === e ? 'selected' : ''}`}
                onClick={() => pickEmoji(e)}
                aria-pressed={emoji === e}
              >
                <span className="emoji-picker-icon" aria-hidden>{e}</span>
              </button>
            ))}
          </div>
          {mode === 'full' && (
            <div className="emoji-picker-row emoji-picker-overlays">
              {OVERLAY_OPTIONS.map(({ id, icon }) => (
                <button
                  key={id || 'none'}
                  type="button"
                  className={`emoji-picker-option emoji-picker-overlay-btn ${overlay === id ? 'selected' : ''}`}
                  onClick={() => pickOverlay(id)}
                  aria-pressed={overlay === id}
                  aria-label={id ? `Lägg till ${id}` : 'Ingen overlay'}
                >
                  <span className="emoji-picker-icon" aria-hidden>{icon}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
