import './SlotPicker.css';

export type SlotOption = { id: string; label: string; emoji: string };

interface SlotPickerProps {
  options: SlotOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  ariaLabel: string;
}

/**
 * Selection panel: large buttons, emoji + one word per option.
 * One tap = select, close, no confirmation.
 */
export function SlotPicker({ options, selectedId, onSelect, onClose, ariaLabel }: SlotPickerProps) {
  return (
    <div
      className="slot-picker-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className="slot-picker-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="slot-picker-close"
          onClick={onClose}
          aria-label="Stäng"
        >
          ×
        </button>
        <div className="slot-picker-grid">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`slot-picker-option ${selectedId === opt.id ? 'selected' : ''}`}
              onClick={() => {
                onSelect(opt.id);
                onClose();
              }}
              aria-pressed={selectedId === opt.id}
            >
              <span className="slot-picker-emoji" aria-hidden>{opt.emoji}</span>
              <span className="slot-picker-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
