# Hook Rule Fixes - React Error #310

## Problem
React Error #310 ("Rendered more hooks than during the previous render") occurs when hooks are called conditionally or in different orders between renders.

## Files Fixed

### 1. `src/pages/Dashboard/DashboardPage.tsx`
**Problem**: Conditionally rendered `ChildDashboard` or `AdultDashboard` without checking if `user` exists first.

**Fix**: Added safety check `if (!user) return null;` AFTER all hooks are called.

```tsx
// BEFORE
export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'child') {
    return <ChildDashboard />; // Could render when user is null
  }
  return <AdultDashboard role={role || 'parent'} />;
}

// AFTER
export function DashboardPage() {
  const { user } = useAuth(); // Hook 1
  if (!user) {
    return null; // Safety check AFTER hooks
  }
  const role = user.role;
  if (role === 'child') {
    return <ChildDashboard />;
  }
  return <AdultDashboard role={role || 'parent'} />;
}
```

### 2. `src/pages/Pro/ProPage.tsx`
**Problem**: Early return `if (loading)` was after hooks, which is OK, but added comments for clarity.

**Fix**: Added comments to clarify hook order and that early return is safe.

```tsx
// BEFORE
export function ProPage() {
  const [loading, setLoading] = useState(true);
  // ... more hooks
  useEffect(() => { ... }, []);
  if (loading) return <div>Laddar...</div>; // OK but not clear
}

// AFTER
export function ProPage() {
  // CRITICAL: All hooks must be called at the top
  const [loading, setLoading] = useState(true);
  // ... more hooks
  useEffect(() => { ... }, []);
  // Conditional rendering is fine AFTER all hooks have been called
  if (loading) return <div>Laddar...</div>;
}
```

### 3. `src/pages/Login/LoginPage.tsx`
**Problem**: Used `status` and `setUser` from `useAuth()` which don't exist in the current `AuthContext`.

**Fix**: Removed references to `status` and `setUser`, use `login()` function instead.

```tsx
// BEFORE
const { setUser, user, status } = useAuth();
if (status === 'authenticated' && user) { ... }
// Later: setUser(userData);

// AFTER
const { user, login } = useAuth();
if (user) { ... }
// Later: await login({ username, password });
```

## Key Principles Applied

1. **All hooks called at the top**: Every hook (useState, useEffect, useAuth, etc.) is called before any conditional returns.

2. **Safety checks after hooks**: If a component needs to check `user` or other state before rendering, the check happens AFTER all hooks are called.

3. **No conditional hooks**: No hooks are called inside `if` statements, loops, or after early returns.

4. **Stable hook order**: The same hooks are called in the same order on every render.

## Components Verified (No Changes Needed)

- ✅ `RequireAuth.tsx` - Only uses `useAuth()` at top, then conditional return
- ✅ `GameLayout.tsx` - All 7 hooks at top, safety check after hooks
- ✅ `ChildDashboard.tsx` - All hooks at top
- ✅ `AdultDashboard.tsx` - All hooks at top
- ✅ `MePage.tsx` - All hooks at top
- ✅ `ChildPage.tsx` - All hooks at top
- ✅ `JourneyPage.tsx` - All hooks at top
- ✅ `JourneyLayout.tsx` - All hooks at top
- ✅ All step components - All hooks at top

## Testing

After these fixes, navigating from landing page to `/app/hub` while unauthenticated should:
1. `RequireAuth` calls `useAuth()` and redirects to `/` if no user
2. If `RequireAuth` somehow allows rendering, `GameLayout` has safety check
3. If `GameLayout` somehow allows rendering, `DashboardPage` has safety check
4. No component renders with inconsistent hook counts

## Result

All components now follow Rules of Hooks strictly:
- ✅ Hooks called unconditionally at the top
- ✅ No hooks in conditionals, loops, or after early returns
- ✅ Safety checks happen after hooks
- ✅ Stable hook order across all render paths


