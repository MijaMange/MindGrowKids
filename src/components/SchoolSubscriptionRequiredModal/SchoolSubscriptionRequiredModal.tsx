import { useRef, useEffect } from 'react';
import './SchoolSubscriptionRequiredModal.css';

interface SchoolSubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user chooses to go to Verksamhet plan (e.g. open pricing or login) */
  onChooseVerksamhet?: () => void;
}

/**
 * Shown when a teacher linked to a school attempts an individual class plan,
 * or when the school already uses MindGrow. Individual and school plans must not coexist.
 */
export function SchoolSubscriptionRequiredModal({
  isOpen,
  onClose,
  onChooseVerksamhet,
}: SchoolSubscriptionRequiredModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleChooseVerksamhet() {
    onClose();
    onChooseVerksamhet?.();
  }

  return (
    <div
      className="school-subscription-required-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-subscription-required-title"
    >
      <div
        ref={modalRef}
        className="school-subscription-required-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="school-subscription-required-close"
          onClick={onClose}
          aria-label="Stäng"
        >
          ×
        </button>
        <h2 id="school-subscription-required-title" className="school-subscription-required-title">
          Din skola använder MindGrow
        </h2>
        <p className="school-subscription-required-message">
          Kontakta ansvarig eller gå med via skolans konto.
        </p>
        <div className="school-subscription-required-actions">
          <button
            type="button"
            className="school-subscription-required-cta-primary"
            onClick={handleChooseVerksamhet}
          >
            Välj Verksamhet
          </button>
          <button
            type="button"
            className="school-subscription-required-cta-secondary"
            onClick={onClose}
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
