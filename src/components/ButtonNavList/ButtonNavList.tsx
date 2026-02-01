import { useNavigate } from 'react-router-dom';
import './ButtonNavList.css';

interface Action {
  icon: string;
  label: string;
  to: string;
  color?: 'primary' | 'neutral' | 'accent' | 'blue';
}

interface ButtonNavListProps {
  actions: Action[];
}

/**
 * ButtonNavList - Återanvändbar lista med navigationsknappar
 * 
 * Design principles:
 * - Max width 420px
 * - Full width knappar
 * - Ikon före text
 * - Färger: neutral (vit/offwhite), primary (grönt), accent (orange)
 */
export function ButtonNavList({ actions }: ButtonNavListProps) {
  const navigate = useNavigate();

  return (
    <div className="button-nav-list">
      {actions.map((action, index) => (
        <button
          key={index}
          className={`button-nav-item button-nav-item-${action.color || 'neutral'}`}
          onClick={() => navigate(action.to)}
        >
          <span className="button-nav-icon">{action.icon}</span>
          <span className="button-nav-label">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

