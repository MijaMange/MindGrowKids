import { Outlet } from 'react-router-dom';
import { GameLayout } from '../../layout/GameLayout';
import { AuthBlock } from '../AuthBlock/AuthBlock';

/**
 * AuthenticatedAppLayout - Route-level guard for authenticated routes
 * 
 * CRITICAL: This component must check auth BEFORE rendering GameLayout or <Outlet />
 * React Router can render routes in parallel, so we must block rendering completely
 * until authentication is confirmed.
 */
export function AuthenticatedAppLayout() {
  // AuthBlock checks auth and blocks rendering until authenticated
  // Only when authenticated does it render children (GameLayout + Outlet)
  // This prevents GameLayout hooks from running for unauthenticated users
  return (
    <AuthBlock>
      <GameLayout>
        <Outlet />
      </GameLayout>
    </AuthBlock>
  );
}

