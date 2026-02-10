import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './BottomNav.css';

/**
 * BottomNav - Game-like bottom navigation bar for children
 * 
 * Design principles:
 * - Icon-only navigation (no text labels)
 * - 3-5 icons max
 * - Rounded container, floating above bottom
 * - Semi-transparent background
 * - Soft shadows, no hard borders
 * - Active icon: slightly larger, subtle glow
 * - Inactive icons: low contrast, no background
 */
export function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      path: '/hub',
      icon: '🏠',
      label: 'Hem',
      ariaLabel: 'Gå till hem',
    },
    {
      path: '/app/journey-simple',
      icon: '💭',
      label: 'Känsloresa',
      ariaLabel: 'Gå till känsloresa',
    },
    {
      path: '/app/diary-simple',
      icon: '📅',
      label: 'Mina dagar',
      ariaLabel: 'Gå till mina dagar',
    },
    {
      path: '/app/avatar-simple',
      icon: '🧑',
      label: 'Jag',
      ariaLabel: 'Gå till jag',
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Huvudnavigering">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.span
                className="bottom-nav-icon"
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {item.icon}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

