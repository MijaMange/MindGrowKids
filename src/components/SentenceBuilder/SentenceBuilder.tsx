import { useState, useEffect } from 'react';
import { SlotPicker, type SlotOption } from './SlotPicker';
import { BASE_EMOTIONS } from '../../config/emotions';
import './SentenceBuilder.css';

/** Feeling words – the 6 base emotions (Glad, Ledsen, Arg, Trött, Rädd, Orolig) */
const FEELING_OPTIONS: SlotOption[] = BASE_EMOTIONS.map((e) => ({
  id: e.label.toLowerCase(),
  label: e.label.toLowerCase(),
  emoji: e.emoji,
}));

/** When/where – category: time or place */
const WHEN_OPTIONS: SlotOption[] = [
  { id: 'idag', label: 'idag', emoji: '📅' },
  { id: 'i skolan', label: 'i skolan', emoji: '🏫' },
  { id: 'hemma', label: 'hemma', emoji: '🏠' },
  { id: 'nu', label: 'nu', emoji: '⏰' },
  { id: 'när jag leker', label: 'när jag leker', emoji: '🎮' },
  { id: 'med kompisar', label: 'med kompisar', emoji: '👋' },
];

interface SentenceBuilderProps {
  /** Current note (e.g. from parent); can pre-fill from initial slot values */
  note: string;
  onChange: (value: string) => void;
  onFinish: () => void;
}

/**
 * Guided sentence builder (primary) + writing area always visible below.
 * No button to reveal writing; the text field is shown immediately.
 * Writing is optional and never required to continue.
 */
export function SentenceBuilder({ note, onChange, onFinish }: SentenceBuilderProps) {
  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  const [openSlot, setOpenSlot] = useState<1 | 2 | null>(null);
  const [freeText, setFreeText] = useState('');

  const built = buildSentence(slot1, slot2);
  const fullNote = built + (freeText.trim() ? ' ' + freeText.trim() : '');
  useEffect(() => {
    onChange(fullNote);
  }, [fullNote, onChange]);

  const canFinish = !!slot1; // at least one word chosen; writing never required

  return (
    <div className="sentence-builder-container">
      {/* Guided sentence – primary */}
      <div className="sentence-builder-row" aria-label="Bygg meningen">
        <span className="sentence-builder-fixed">Jag</span>
        <span className="sentence-builder-fixed">känner mig</span>
        <button
          type="button"
          className={`sentence-builder-slot ${slot1 ? 'filled' : ''}`}
          onClick={() => setOpenSlot(1)}
          aria-label={slot1 ? `Känsla: ${slot1}, tryck för att ändra` : 'Välj känsla'}
        >
          {slot1 || '___'}
        </button>
        <button
          type="button"
          className={`sentence-builder-slot ${slot2 ? 'filled' : ''}`}
          onClick={() => setOpenSlot(2)}
          aria-label={slot2 ? `När/var: ${slot2}, tryck för att ändra` : 'Välj när eller var'}
        >
          {slot2 || '___'}
        </button>
      </div>

      {/* Writing area – always visible, optional */}
      <div className="sentence-builder-freewrite">
        <label className="sentence-builder-freewrite-label" htmlFor="sentence-builder-freewrite-input">
          <span className="sentence-builder-freewrite-icon" aria-hidden>✏️</span>
          Vill du skriva något mer?
        </label>
        <textarea
          id="sentence-builder-freewrite-input"
          className="sentence-builder-freewrite-input"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder=""
          rows={3}
          aria-label="Skriv mer om du vill, valfritt"
        />
      </div>

      <button
        className="sentence-builder-finish journey-forward-btn"
        onClick={onFinish}
        disabled={!canFinish}
        aria-label="Klart"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      {openSlot === 1 && (
        <SlotPicker
          options={FEELING_OPTIONS}
          selectedId={slot1}
          onSelect={(id) => setSlot1(id)}
          onClose={() => setOpenSlot(null)}
          ariaLabel="Välj känsla"
        />
      )}
      {openSlot === 2 && (
        <SlotPicker
          options={WHEN_OPTIONS}
          selectedId={slot2}
          onSelect={(id) => setSlot2(id)}
          onClose={() => setOpenSlot(null)}
          ariaLabel="Välj när eller var"
        />
      )}
    </div>
  );
}

function buildSentence(slot1: string | null, slot2: string | null): string {
  let s = 'Jag känner mig';
  if (slot1) s += ' ' + slot1;
  if (slot2) s += ' ' + slot2;
  return s.trim();
}
