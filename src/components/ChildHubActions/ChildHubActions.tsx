import { Link } from 'react-router-dom';
import './ChildHubActions.css';

interface Action {
  icon: string;
  label: string;
  to: string;
}

interface ChildHubActionsProps {
  actions: Action[];
}

/**
 * ChildHubActions - One primary action, two secondary (clear hierarchy).
 *
 * - Primary: "Hur mår jag idag?" – largest, centered, green, gentle breathing.
 * - Secondary: "Mina dagar" (blue), "Jag" (purple) – smaller, do not compete.
 * - Color logic: green = do now, blue = look back, purple = me.
 */
export function ChildHubActions({ actions }: ChildHubActionsProps) {
  const [primary, ...secondary] = actions;

  function renderIcon(icon: string) {
    return (
      <span className="child-hub-btn-icon" aria-hidden="true">
        {icon.split(/\s+/).map((part, i) => (
          <span key={i} className="child-hub-btn-icon-part">{part}</span>
        ))}
      </span>
    );
  }

  return (
    <div className="child-hub-actions" role="group" aria-label="Välj vad du vill göra">
      {/* Primary action – one obvious "start here" */}
      {primary && (
        <Link
          to={primary.to}
          className="child-hub-primary"
          aria-label={primary.label}
        >
          {renderIcon(primary.icon)}
          <span className="child-hub-primary-label">{primary.label}</span>
        </Link>
      )}

      {/* Secondary – smaller, clearly separated */}
      {secondary.length > 0 && (
        <div className="child-hub-secondary-row">
          {secondary.map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className={`child-hub-secondary child-hub-secondary-${index === 0 ? 'days' : 'me'}`}
              aria-label={action.label}
            >
              {renderIcon(action.icon)}
              <span className="child-hub-secondary-label">{action.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
