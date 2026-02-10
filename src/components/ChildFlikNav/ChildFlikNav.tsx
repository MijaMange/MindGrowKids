import { Link, useLocation } from 'react-router-dom';
import './ChildFlikNav.css';

/**
 * ChildFlikNav – snabbväxling mellan "Hur mår jag idag?", "Mina dagar" och "Jag".
 * Visas längst ner på dessa tre vyer så barnet alltid kan byta flik utan att gå tillbaka.
 */
const FLIK_ITEMS = [
  { path: '/app/journey-simple', icon: '❤️', label: 'Hur mår jag?', shortLabel: 'Känslor' },
  { path: '/app/diary-simple', icon: '📅', label: 'Mina dagar', shortLabel: 'Dagbok' },
  { path: '/app/avatar-simple', icon: '😊', label: 'Jag', shortLabel: 'Jag' },
] as const;

export function ChildFlikNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="child-flik-nav" aria-label="Byta vy">
      <div className="child-flik-nav-inner">
        {FLIK_ITEMS.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`child-flik-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="child-flik-nav-icon" aria-hidden>{item.icon}</span>
              <span className="child-flik-nav-label">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
