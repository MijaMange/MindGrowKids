import styles from './EmotionPicker.module.css';
import { Emotion } from '../../state/useCheckinStore';
import { BASE_EMOTIONS } from '../../config/emotions';

export function EmotionPicker({
  value, onSelect
}: { value: Emotion; onSelect: (e: Emotion) => void }) {
  return (
    <div className={styles.wrapper} role="group" aria-label="Välj hur du mår">
      {BASE_EMOTIONS.map((e) => (
        <button
          key={e.key}
          type="button"
          className={`${styles.btn} ${value === e.key ? styles.active : ''}`}
          onClick={() => onSelect(e.key)}
          aria-pressed={value === e.key}
        >
          {e.emoji} <span className={styles.label}>{e.label}</span>
        </button>
      ))}
    </div>
  );
}

