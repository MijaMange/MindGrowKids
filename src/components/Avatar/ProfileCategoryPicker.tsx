import { useAvatarStore } from '../../state/useAvatarStore';
import './ProfileCategoryPicker.css';

export type ProfileCategory = 'hair' | 'face' | 'clothes' | 'things';

const HAIR_STYLES: { id: string; icon: string }[] = [
  { id: 'short', icon: '👧' },
  { id: 'bun', icon: '👩' },
  { id: 'curly', icon: '👩‍🦱' },
  { id: 'long', icon: '👩‍🦳' },
];

const HAIR_COLORS = ['#3b2d2a', '#6b4f4a', '#caa472', '#f6d8c2', '#86b7ee', '#e67a7a'];

const FACE_OPTIONS: { eye: string; mouth: string; icon: string }[] = [
  { eye: 'round', mouth: 'smile', icon: '😊' },
  { eye: 'round', mouth: 'open', icon: '😮' },
  { eye: 'smile', mouth: 'smile', icon: '😄' },
  { eye: 'smile', mouth: 'open', icon: '😲' },
];

const SKIN_TONES = ['#f6d8c2', '#E7C3A1', '#C6956B', '#9C6A49'];

const OUTFIT_OPTIONS: { outfitType: 'set' | 'topsBottoms'; set?: string; top?: string; bottom?: string; icon: string }[] = [
  { outfitType: 'set', set: 'overalls', icon: '👖' },
  { outfitType: 'topsBottoms', top: 'tee', bottom: 'shorts', icon: '👕' },
  { outfitType: 'topsBottoms', top: 'hoodie', bottom: 'shorts', icon: '🧥' },
  { outfitType: 'topsBottoms', top: 'hoodie', bottom: 'skirt', icon: '👗' },
];

const THING_OPTIONS: { accessory: string; bg: string; icon: string }[] = [
  { accessory: '', bg: 'mint', icon: '🌿' },
  { accessory: '', bg: 'sunset', icon: '🌅' },
  { accessory: '', bg: 'ocean', icon: '🌊' },
  { accessory: 'glasses', bg: 'mint', icon: '👓' },
  { accessory: 'cap', bg: 'mint', icon: '🧢' },
  { accessory: 'flower', bg: 'mint', icon: '🌸' },
];

interface ProfileCategoryPickerProps {
  category: ProfileCategory;
  onClose: () => void;
  onChanged?: () => void;
}

/**
 * Child-friendly category picker: one category at a time, 4–6 visual options, no scroll.
 * Updates avatar store and calls onChanged (for auto-save) on selection.
 */
export function ProfileCategoryPicker({ category, onClose, onChanged }: ProfileCategoryPickerProps) {
  const { avatar, set } = useAvatarStore();

  function applyAndClose(patch: Partial<typeof avatar>) {
    set(patch);
    onChanged?.();
    onClose();
  }

  return (
    <div
      className="profile-picker-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Välj ${category === 'hair' ? 'hår' : category === 'face' ? 'ansikte' : category === 'clothes' ? 'kläder' : 'saker'}`}
    >
      <div className="profile-picker-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="profile-picker-close"
          onClick={onClose}
          aria-label="Stäng"
        >
          ×
        </button>

        {category === 'hair' && (
          <div className="profile-picker-content">
            <div className="profile-picker-row">
              {HAIR_STYLES.map(({ id, icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`profile-picker-option ${avatar.hair.style === id ? 'selected' : ''}`}
                  onClick={() => applyAndClose({ hair: { ...avatar.hair, style: id } })}
                  aria-pressed={avatar.hair.style === id}
                >
                  <span className="profile-picker-icon" aria-hidden>{icon}</span>
                </button>
              ))}
            </div>
            <div className="profile-picker-row profile-picker-colors">
              {HAIR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`profile-picker-color ${avatar.hair.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => applyAndClose({ hair: { ...avatar.hair, color: c } })}
                  aria-pressed={avatar.hair.color === c}
                  aria-label="Hårfärg"
                />
              ))}
            </div>
          </div>
        )}

        {category === 'face' && (
          <div className="profile-picker-content">
            <div className="profile-picker-row">
              {FACE_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`profile-picker-option ${avatar.eye === opt.eye && avatar.mouth === opt.mouth ? 'selected' : ''}`}
                  onClick={() => applyAndClose({ eye: opt.eye, mouth: opt.mouth })}
                  aria-pressed={avatar.eye === opt.eye && avatar.mouth === opt.mouth}
                >
                  <span className="profile-picker-icon" aria-hidden>{opt.icon}</span>
                </button>
              ))}
            </div>
            <div className="profile-picker-row profile-picker-colors">
              {SKIN_TONES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`profile-picker-color ${avatar.bodyTone === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => applyAndClose({ bodyTone: c })}
                  aria-pressed={avatar.bodyTone === c}
                  aria-label="Hudfärg"
                />
              ))}
            </div>
          </div>
        )}

        {category === 'clothes' && (
          <div className="profile-picker-content">
            <div className="profile-picker-row">
              {OUTFIT_OPTIONS.map((opt, i) => {
                const isSelected =
                  avatar.outfitType === opt.outfitType &&
                  (opt.set ? avatar.set === opt.set : avatar.top === opt.top && avatar.bottom === opt.bottom);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`profile-picker-option ${isSelected ? 'selected' : ''}`}
                    onClick={() =>
                      applyAndClose({
                        outfitType: opt.outfitType,
                        ...(opt.set && { set: opt.set }),
                        ...(opt.top && { top: opt.top }),
                        ...(opt.bottom && { bottom: opt.bottom }),
                      })
                    }
                    aria-pressed={isSelected}
                  >
                    <span className="profile-picker-icon" aria-hidden>{opt.icon}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {category === 'things' && (
          <div className="profile-picker-content">
            <div className="profile-picker-row">
              {THING_OPTIONS.map((opt, i) => {
                const isSelected = avatar.accessory === opt.accessory && avatar.bg === opt.bg;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`profile-picker-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => applyAndClose({ accessory: opt.accessory, bg: opt.bg })}
                    aria-pressed={isSelected}
                  >
                    <span className="profile-picker-icon" aria-hidden>{opt.icon}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
