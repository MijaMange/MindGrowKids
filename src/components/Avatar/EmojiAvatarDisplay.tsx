import './EmojiAvatarDisplay.css';

export type EmojiOverlay = '' | 'hat' | 'glasses' | 'star' | 'heart';

interface EmojiAvatarDisplayProps {
  emoji: string;
  overlay: EmojiOverlay;
  size?: number;
  className?: string;
}

/**
 * Large emoji avatar with optional overlay (hat, glasses, star, heart).
 * One tap = obvious visual change. No detailed features.
 */
export function EmojiAvatarDisplay({ emoji, overlay, size = 160, className = '' }: EmojiAvatarDisplayProps) {
  const overlayEmoji =
    overlay === 'hat' ? '🧢' :
    overlay === 'glasses' ? '👓' :
    overlay === 'star' ? '⭐' :
    overlay === 'heart' ? '❤️' : null;

  return (
    <div
      className={`emoji-avatar-wrap ${className}`.trim()}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Min figur"
    >
      <span className="emoji-avatar-main" style={{ fontSize: size * 0.7 }}>
        {emoji}
      </span>
      {overlayEmoji && (
        <span className="emoji-avatar-overlay" style={{ fontSize: size * 0.35 }}>
          {overlayEmoji}
        </span>
      )}
    </div>
  );
}
