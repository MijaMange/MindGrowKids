import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useEmojiAvatarStore } from '../../state/useEmojiAvatarStore';
import { UnifiedHubLayout } from '../../components/UnifiedHubLayout/UnifiedHubLayout';
import { AgeGuard } from '../../components/AgeGuard/AgeGuard';
import { AdultPageShell } from '../../components/AdultPageShell/AdultPageShell';
import { ButtonNavList } from '../../components/ButtonNavList/ButtonNavList';

/**
 * SafeHubPage - Hub för inloggade användare
 *
 * Barn: oförändrad barn-vy (UnifiedHubLayout).
 * Vuxen (föräldrar/lärare): samma design som Klassens statistik (emerald, glaskort, enhetlig header).
 */
export function SafeHubPage() {
  const { user } = useAuth();
  const { emoji, loadFromServer } = useEmojiAvatarStore();

  useEffect(() => {
    if (user?.role === 'child') loadFromServer();
  }, [user?.role, loadFromServer]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = user.role;

  // Barn-dashboard – ingen ändring, samma vy som tidigare
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

  // Föräldrar – enhetlig vuxendesign (samma som Klassens statistik)
  if (role === 'parent') {
    return (
      <AdultPageShell pillLabel="Föräldravy" title="Översikt">
        <div className="pro-class-soft-card">
          <h1 className="pro-class-soft-card-title" style={{ marginTop: 0 }}>Hej {user.name || 'där'}!</h1>
          <p style={{ color: 'var(--mg-grey-text)', margin: '0 0 16px 0' }}>Översikt över dina barn.</p>
          <ButtonNavList
            actions={[
              { icon: '👨‍👩‍👧', label: 'Mina barn', to: '/app/parent-children', color: 'neutral' },
            ]}
          />
        </div>
      </AdultPageShell>
    );
  }

  // Lärare – dashboard är Klassens statistik direkt
  if (role === 'pro') {
    return <Navigate to="/app/pro-simple" replace />;
  }

  return <Navigate to="/" replace />;
}

