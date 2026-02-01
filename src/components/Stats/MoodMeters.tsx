import { motion } from 'framer-motion';
import './mood.css';

export function MoodMeters({
  values,
}: {
  values: { [k: string]: number };
}) {
  const items = [
    { key: 'love', label: 'Kärlek', icon: '💗' },
    { key: 'joy', label: 'Glädje', icon: '🙂' },
    { key: 'calm', label: 'Lugn', icon: '🕊️' },
    { key: 'energy', label: 'Energi', icon: '⚡' },
    { key: 'sadness', label: 'Ledsen', icon: '😢' },
    { key: 'anger', label: 'Arg', icon: '😠' },
  ];

  return (
    <div className="mood-grid">
      {items.map((it) => {
        const v = values[it.key] ?? 50;
        return (
          <div className="mood-row" key={it.key}>
            <div className="mood-label">
              {it.icon} {it.label}
            </div>
            <div className="bar">
              <motion.div
                className="fill"
                initial={{ width: 0 }}
                animate={{ width: `${v}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              />
              <div className="pct">{v}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}




