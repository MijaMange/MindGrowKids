import { motion } from 'framer-motion';
import './SideToolPanel.css';

export type ToolType = 'face' | 'headwear' | 'colors';

interface Tool {
  id: ToolType;
  icon: string;
  label: string;
}

const TOOLS: Tool[] = [
  { id: 'face', icon: '👤', label: 'Ansikte' },
  { id: 'headwear', icon: '🧢', label: 'Huvudbonad' },
  { id: 'colors', icon: '🎨', label: 'Färger' },
];

interface SideToolPanelProps {
  activeTool: ToolType | null;
  onToolSelect: (tool: ToolType | null) => void;
}

/**
 * Vertical side panel with large tool buttons.
 * Child-friendly: big tap targets (min 56px), icons first, clear active state.
 */
export function SideToolPanel({ activeTool, onToolSelect }: SideToolPanelProps) {
  return (
    <div className="side-tool-panel" role="group" aria-label="Verktyg för att ändra din figur">
      {TOOLS.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <motion.button
            key={tool.id}
            type="button"
            className={`side-tool-button ${isActive ? 'active' : ''}`}
            onClick={() => onToolSelect(isActive ? null : tool.id)}
            aria-pressed={isActive}
            aria-label={tool.label}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {isActive && (
              <motion.span
                className="side-tool-button-glow"
                layoutId="side-tool-glow"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="side-tool-icon" aria-hidden>
              {tool.icon}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
