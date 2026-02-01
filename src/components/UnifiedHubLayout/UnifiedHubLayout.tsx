import { AppHeader } from '../layout/AppHeader';
import { ButtonNavList } from '../ButtonNavList/ButtonNavList';
import { LogoutButton } from '../LogoutButton/LogoutButton';
import './UnifiedHubLayout.css';

interface Action {
  icon: string;
  label: string;
  to: string;
  color?: 'primary' | 'neutral' | 'accent' | 'blue';
}

interface UnifiedHubLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions: Action[];
  showLogout?: boolean;
}

/**
 * UnifiedHubLayout - Gemensam layout för alla dashboards
 * 
 * Design principles:
 * - Logo högst upp centerad
 * - H1 → title
 * - Underrubrik small (muted white)
 * - (optional) description i smallest muted text
 * - ButtonNavList för actions
 * - Logout längst ner (om showLogout)
 */
export function UnifiedHubLayout({
  title,
  subtitle,
  description,
  actions,
  showLogout = true,
}: UnifiedHubLayoutProps) {
  return (
    <div className="unified-hub-container">
      {/* Global header with logo and hamburger menu */}
      <AppHeader />

      {/* Breathing background gradient */}
      <div className="unified-hub-bg-gradient" aria-hidden="true" />

      <div className="unified-hub-content">

        {/* Title */}
        <h1 className="unified-hub-title">{title}</h1>

        {/* Subtitle */}
        {subtitle && <p className="unified-hub-subtitle">{subtitle}</p>}

        {/* Description */}
        {description && <p className="unified-hub-description">{description}</p>}

        {/* Actions */}
        <div className="unified-hub-actions">
          <ButtonNavList actions={actions} />
        </div>

        {/* Logout button */}
        {showLogout && (
          <div className="unified-hub-logout">
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}

