import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAge } from '../../context/AgeContext';
import { sfxClick, sfxWhoosh } from '../../utils/sound';
import type { AgeGroup } from '../../config/ageConfig';
import '../../pages/Journey/journey.css';
import '../../pages/Onboarding/AgeSelectionPage.css';

const AGE_OPTIONS: Array<{ group: AgeGroup; emoji: string; label: string }> = [
  { group: '4-5', emoji: '🧸', label: '4–5 år' },
  { group: '6-7', emoji: '🎈', label: '6–7 år' },
  { group: '8-10', emoji: '🚀', label: '8–10 år' },
];

interface AgeSelectionBlockProps {
  /** Called after age is saved successfully. Omit to not navigate (e.g. when inline on hub). */
  onSuccess?: () => void;
  /** Optional title override */
  title?: string;
}

/**
 * AgeSelectionBlock - Reusable age picker (three cards + Start).
 * Used inline on the hub when child has no age, and on the standalone onboarding page.
 */
export function AgeSelectionBlock({ onSuccess, title = 'Välj din ålder' }: AgeSelectionBlockProps) {
  const { setAgeGroup } = useAge();
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    if (!selectedAge) return;

    setSaving(true);
    try {
      await setAgeGroup(selectedAge);
      sfxWhoosh();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to save age:', err);
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte spara. Försök igen.';
      alert(errorMessage);
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="age-selection-container age-selection-container--inline"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="age-selection-title age-selection-title--inline">{title}</h2>

      <div className="age-selection-grid">
        {AGE_OPTIONS.map((option) => {
          const isSelected = selectedAge === option.group;
          return (
            <motion.button
              key={option.group}
              type="button"
              className={`age-selection-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedAge(option.group);
                sfxClick();
              }}
              aria-pressed={isSelected}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <span className="age-selection-emoji" aria-hidden>
                {option.emoji}
              </span>
              <span className="age-selection-label">{option.label}</span>
              {isSelected && (
                <motion.div
                  className="age-selection-ring"
                  layoutId="age-selection-ring-inline"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedAge && (
        <motion.div
          className="age-selection-actions"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            type="button"
            className="cta next age-selection-start"
            onClick={handleStart}
            disabled={saving}
            aria-label="Starta"
          >
            {saving ? 'Sparar…' : 'Starta'}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
