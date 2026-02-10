import { useEmojiAvatarStore, type EmojiOverlay } from '../../state/useEmojiAvatarStore';
import './OverlayPicker.css';

const OVERLAY_OPTIONS: { id: EmojiOverlay; icon: string }[] = [
  { id: '', icon: '○' },
  { id: 'hat', icon: '🧢' },
  { id: 'glasses', icon: '👓' },
  { id: 'star', icon: '⭐' },
  { id: 'heart', icon: '❤️' },
];

interface OverlayPickerProps {
  onClose: () => void;
  onChanged?: () => void;
}

/**
 * Simple overlay selection: one tap = set overlay, update avatar immediately, close.
 * No confirmation. All options visible.
 */
export function OverlayPicker({ onClose, onChanged }: OverlayPickerProps) {
  const { overlay, setOverlay } = useEmojiAvatarStore();

  function pick(id: EmojiOverlay) {
    setOverlay(id);
    onChanged?.();
    onClose();
  }

  return (
    <div
      className="overlay-picker-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Välj dekoration"
    >
      <div className="overlay-picker-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="overlay-picker-close"
          onClick={onClose}
          aria-label="Stäng"
        >
          ×
        </button>
        <div className="overlay-picker-row">
          {OVERLAY_OPTIONS.map(({ id, icon }) => (
            <button
              key={id || 'none'}
              type="button"
              className={`overlay-picker-option ${overlay === id ? 'selected' : ''}`}
              onClick={() => pick(id)}
              aria-pressed={overlay === id}
              aria-label={id ? `Dekoration: ${id}` : 'Ingen dekoration'}
            >
              <span className="overlay-picker-icon" aria-hidden>{icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
