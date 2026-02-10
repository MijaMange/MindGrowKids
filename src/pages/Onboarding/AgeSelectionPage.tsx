import { useNavigate } from 'react-router-dom';
import { AgeSelectionBlock } from '../../components/AgeSelectionBlock';
import '../Journey/journey.css';
import './AgeSelectionPage.css';

/**
 * AgeSelectionPage - Standalone age selection (e.g. from Inställningar)
 * Uses same block as hub; on success navigates to hub.
 */
export function AgeSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="journey-root">
      <main className="journey-stage age-selection-stage">
        <AgeSelectionBlock
          title="Hur gammal är du?"
          onSuccess={() => navigate('/hub', { replace: true })}
        />
      </main>
    </div>
  );
}
