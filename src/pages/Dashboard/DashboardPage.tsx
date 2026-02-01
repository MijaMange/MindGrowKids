import { useAuth } from '../../auth/AuthContext';
import { ChildDashboard } from './ChildDashboard';
import { AdultDashboard } from './AdultDashboard';

export function DashboardPage() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  // Hook 1: useAuth
  const { user } = useAuth();
  
  // CRITICAL: Safety check - if no user, return null AFTER all hooks are called
  // This prevents ChildDashboard/AdultDashboard from rendering when user is null
  // RequireAuth should prevent this, but this is a safety check
  if (!user) {
    return null;
  }
  
  // Derived value (not a hook, safe to compute after hooks)
  const role = user.role;

  // Conditional rendering is fine AFTER all hooks have been called
  // Children see a completely different, minimal dashboard
  if (role === 'child') {
    return <ChildDashboard />;
  }

  // Parents and professionals see the overview dashboard
  return <AdultDashboard role={role || 'parent'} />;
}


