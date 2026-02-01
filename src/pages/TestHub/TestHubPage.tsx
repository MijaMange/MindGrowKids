import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { UnifiedHubLayout } from '../../components/UnifiedHubLayout/UnifiedHubLayout';

/**
 * TestHubPage - Fullständig hub/dashboard för alla roller
 * 
 * Rollbaserad rendering:
 * - Barn: Enkel dashboard med stora knappar
 * - Föräldrar/Lärare: Översikt med statistik
 */
export function TestHubPage() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  // Hook 1: useAuth
  const { user } = useAuth();

  // Conditional redirect is fine AFTER all hooks have been called
  // Use Navigate component to redirect if no user (prevents rendering with null user)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Rollbaserad rendering
  const role = user.role;

  // Barn-dashboard
  if (role === 'child') {
    return (
      <UnifiedHubLayout
        title={`Hej ${user.name || 'där'}! 👋`}
        subtitle="Vad vill du göra idag?"
        actions={[
          { icon: '💬', label: 'Hur känner jag mig idag?', to: '/app/journey-simple', color: 'primary' },
          { icon: '📅', label: 'Mina dagar', to: '/app/diary-simple', color: 'neutral' },
          { icon: '🙂', label: 'Jag', to: '/app/avatar-simple', color: 'accent' },
        ]}
      />
    );
  }

  // Föräldrar-dashboard
  if (role === 'parent') {
    return (
      <UnifiedHubLayout
        title={`Hej ${user.name || 'där'}! 👋`}
        subtitle="Välkommen till översikten"
        description="Översikt över ditt barns känslor."
        actions={[
          { icon: '👨‍👩‍👧', label: 'Mina barn', to: '/app/parent-children', color: 'neutral' },
          { icon: '📘', label: 'Dagbok', to: '/app/parent-diary-simple', color: 'blue' },
        ]}
      />
    );
  }

  // Lärare-dashboard
  if (role === 'pro') {
    return (
      <UnifiedHubLayout
        title={`Hej ${user.name || 'där'}! 👋`}
        subtitle="Välkommen till översikten"
        description="Anonymiserad översikt över klassen."
        actions={[
          { icon: '🏫', label: 'Klassens statistik', to: '/app/pro-simple', color: 'neutral' },
          { icon: '📘', label: 'Klassens dagbok', to: '/app/pro-diary-simple', color: 'blue' },
        ]}
      />
    );
  }

  // Fallback
  return <Navigate to="/" replace />;
}

