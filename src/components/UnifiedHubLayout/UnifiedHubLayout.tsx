import { ReactNode } from 'react';
import { AppHeader } from '../layout/AppHeader';
import { ButtonNavList } from '../ButtonNavList/ButtonNavList';
import { ChildHubActions } from '../ChildHubActions/ChildHubActions';
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
  /** Barn-dashboard: tre stora horisontella knappar, ikon förklarar, andra färger än orange */
  childActions?: boolean;
  showLogout?: boolean;
  /** When set, replaces title + actions with this content (e.g. inline age selection on hub) */
  overrideContent?: ReactNode;
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
  childActions = false,
  showLogout = true,
  overrideContent,
}: UnifiedHubLayoutProps) {
  return (
    <div className="unified-hub-container">
      <AppHeader />
      <div className="unified-hub-bg-gradient" aria-hidden="true" />

      <div className={`unified-hub-content${childActions ? ' unified-hub-content--child' : ''}`}>
        {overrideContent != null ? (
          <>
            <div className="unified-hub-override">{overrideContent}</div>
            {showLogout && (
              <div className="unified-hub-logout">
                <LogoutButton />
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="unified-hub-title">{title}</h1>
            {subtitle && <p className="unified-hub-subtitle">{subtitle}</p>}
            {description && <p className="unified-hub-description">{description}</p>}
            <div className="unified-hub-actions">
              {childActions ? (
                <ChildHubActions actions={actions} />
              ) : (
                <ButtonNavList actions={actions} />
              )}
            </div>
            {showLogout && (
              <div className="unified-hub-logout">
                <LogoutButton />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

