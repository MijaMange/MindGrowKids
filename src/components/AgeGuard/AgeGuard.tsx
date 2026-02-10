import { useAuth } from '../../auth/AuthContext';
import { useAge } from '../../context/AgeContext';

/**
 * AgeGuard - Wraps child-only content. Does NOT redirect.
 * Children without ageGroup still see the hub; the hub shows inline age selection.
 * This way "first landing" is always the hub, not a separate age page.
 */
export function AgeGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { loading } = useAge();

  if (!user || user.role !== 'child') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="journey-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '1.2rem' }}>Laddar...</div>
      </div>
    );
  }

  return <>{children}</>;
}
