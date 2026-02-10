import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useAge } from '../../context/AgeContext';
import { useEmojiAvatarStore } from '../../state/useEmojiAvatarStore';
import { UnifiedHubLayout } from '../../components/UnifiedHubLayout/UnifiedHubLayout';
import { AgeGuard } from '../../components/AgeGuard/AgeGuard';
import { AgeSelectionBlock } from '../../components/AgeSelectionBlock';

/**
 * TestHubPage - Fullständig hub/dashboard för alla roller
 * 
 * Rollbaserad rendering:
 * - Barn: Enkel dashboard med stora knappar
 * - Föräldrar/Lärare: Översikt med statistik
 */
export function TestHubPage() {
  const { user } = useAuth();
  const { emoji, loadFromServer } = useEmojiAvatarStore();

  useEffect(() => {
    if (user?.role === 'child') loadFromServer();
  }, [user?.role, loadFromServer]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = user.role;

  // Barn-dashboard: hub direkt (ingen åldersval)
  if (role === 'child') {
    return (
      <AgeGuard>
        <UnifiedHubLayout
          title={`Hej, ${user.name || 'du'}!`}
          childActions={true}
          showLogout={false}
          actions={[
            { icon: '❤️ 🧠', label: 'Hur mår jag idag?', to: '/app/journey-simple' },
            { icon: '📅', label: 'Mina dagar', to: '/app/diary-simple' },
            { icon: emoji || '😊', label: 'Jag', to: '/app/avatar-simple' },
          ]}
        />
      </AgeGuard>
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

