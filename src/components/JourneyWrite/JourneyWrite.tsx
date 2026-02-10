import { useState } from 'react';
import './JourneyWrite.css';

interface JourneyWriteProps {
  note: string;
  onChange: (value: string) => void;
  onFinish: () => void;
  isOverlay?: boolean;
}

/**
 * JourneyWrite - Large text area for step 2
 * 
 * Features:
 * - Large text area (fills most of panel)
 * - Colored background (soft, playful)
 * - Large font size
 * - Starter suggestions with emojis that stay visible
 * - Can build sentences by clicking suggestions
 */

// Starter suggestions with emojis - always visible
const STARTER_SUGGESTIONS = [
  { text: 'Idag ', emoji: '📅' },
  { text: 'Jag ', emoji: '👤' },
  { text: 'Jag känner mig ', emoji: '💭' },
  { text: 'Det var ', emoji: '✨' },
  { text: 'Jag tycker om ', emoji: '❤️' },
  { text: 'Jag är ', emoji: '😊' },
  { text: 'Nu ', emoji: '⏰' },
  { text: 'I skolan ', emoji: '🏫' },
];

export function JourneyWrite({ note, onChange, onFinish, isOverlay = false }: JourneyWriteProps) {
  function handleStarter(suggestion: { text: string; emoji: string }) {
    // Add the suggestion text to the existing note (don't replace)
    onChange(note + suggestion.text);
  }

  return (
    <div className="journey-write-container">
      {/* Starter suggestions - always visible, don't disappear */}
      <div className="journey-write-starters">
        {STARTER_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            className="journey-write-starter"
            onClick={() => handleStarter(suggestion)}
            aria-label={`Lägg till ${suggestion.text}`}
          >
            <span className="starter-emoji">{suggestion.emoji}</span>
            <span className="starter-text">{suggestion.text.trim()}</span>
          </button>
        ))}
      </div>
      <textarea
        className="journey-write-textarea"
        value={note}
        onChange={(e) => {
          onChange(e.target.value);
          // Don't hide starters - they stay visible
        }}
        placeholder=""
        aria-label="Skriv här"
        autoFocus
      />
      <button
        className="journey-forward-btn"
        onClick={onFinish}
        aria-label="Klart"
        disabled={!note.trim()}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  );
}
