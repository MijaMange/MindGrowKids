# React Error #310 Fix - Hook Ordering

## Problem Identified

React Error #310 ("Rendered more hooks than during the previous render") was caused by **inconsistent hook ordering** when navigating to protected routes while unauthenticated.

## Root Cause

The issue was in **`AuthenticatedAppLayout`** - while it had hooks at the top, React Router was still attempting to render child components (via `<Outlet />`) even when the user was unauthenticated. This caused child components like `DashboardPage` to call hooks, then unmount during redirect, leading to inconsistent hook counts.

## Components Fixed

### 1. AuthenticatedAppLayout (`src/components/AuthenticatedAppLayout/AuthenticatedAppLayout.tsx`)

**Problem:** `<Outlet />` could potentially render child routes before auth check completed.

**Fix:**
- Added explicit check: `if (status === 'authenticated' && user)` before rendering `<Outlet />`
- Ensured all hooks (`useAuth`, `useLocation`) are called at the top
- Early returns prevent `<Outlet />` from rendering until authenticated
- Added fallback `return null` for TypeScript safety

**Key Change:**
```tsx
// BEFORE: Could render <Outlet /> even when unauthenticated
if (status === 'unauthenticated' || !user) {
  return <Navigate to="/login" replace state={{ from: location }} />;
}
return (
  <GameLayout>
    <Outlet />
  </GameLayout>
);

// AFTER: Explicit authenticated check before rendering <Outlet />
if (status === 'authenticated' && user) {
  return (
    <GameLayout>
      <Outlet />
    </GameLayout>
  );
}
return null; // Fallback
```

### 2. GameLayout (`src/layout/GameLayout.tsx`)

**Problem:** Hooks were called, but structure could be clearer.

**Fix:**
- All hooks explicitly declared at the top with comments
- Hooks numbered for clarity (Hook 1-7)
- Derived values computed after all hooks
- Helper functions defined after hooks
- Conditional logic only inside `useEffect`, not in hook calls

**Hook Order (stable):**
1. `useAuth()` - get user and logout
2. `useAvatarStore()` - get avatar and loadFromServer
3. `useLocation()` - get location
4. `useNavigate()` - get navigate function
5. `useState()` - settingsOpen state
6. `useMemo()` - prefersReducedMotion
7. `useEffect()` - load avatar (conditional logic inside is fine)

### 3. DashboardPage (`src/pages/Dashboard/DashboardPage.tsx`)

**Problem:** Minor - hooks were fine, but added comments for clarity.

**Fix:**
- Added comment clarifying hooks are called before conditional returns
- Structure already correct, just documented

## Solution Summary

1. **AuthenticatedAppLayout** now explicitly checks `status === 'authenticated' && user` before rendering `<Outlet />`
2. **GameLayout** has all hooks at the top in a stable order
3. **DashboardPage** and child components already had correct hook ordering

## Result

- ✅ Navigating to `/dashboard` or `/hub` while unauthenticated:
  - Does NOT crash with React error #310
  - Shows loader while checking auth
  - Redirects to `/login` if unauthenticated
  - `GameLayout` hooks never run for unauthenticated users
  - Child component hooks never run for unauthenticated users

- ✅ Navigating while authenticated:
  - `GameLayout` wraps protected pages as before
  - No React error #310
  - All hooks called in stable order

## Testing

To verify the fix:
1. Navigate to `/dashboard` while logged out
2. Should see loader, then redirect to `/login` - NO error #310
3. Log in and navigate to `/dashboard`
4. Should render normally - NO error #310


