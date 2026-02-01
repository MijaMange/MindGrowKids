import styles from './EmotionPicker.module.css';
import { Emotion } from '../../state/useCheckinStore';

const EMOTIONS = ['happy','calm','tired','sad','curious','angry'] as const;

export function EmotionPicker({
  value, onSelect
}: { value: Emotion; onSelect: (e: Emotion) => void }) {
  return (
    <div className={styles.wrapper} role="group" aria-label="Choose your feeling">
      {EMOTIONS.map((e) => (
        <button
          key={e}
          type="button"
          className={`${styles.btn} ${value===e ? styles.active : ''}`}
          onClick={() => onSelect(e)}
          aria-pressed={value===e}
        >
          {iconFor(e)} <span className={styles.label}>{capitalize(e)}</span>
        </button>
      ))}
    </div>
  );
}

function capitalize(s: string){ return s[0].toUpperCase() + s.slice(1); }
function iconFor(e: string){
  const map: Record<string, string> = {
    happy:'😊', calm:'🫶', tired:'😪', sad:'😔', curious:'🧐', angry:'😠',
  };
  return map[e] ?? '🙂';
}

