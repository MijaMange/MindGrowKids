# DashboardPage (HubPage) Hook Ordering Fix

## Problem Identified

React Error #310 was occurring in `DashboardPage.tsx` (which is rendered for the `/app/hub` route). The issue was that `DashboardPage` conditionally renders `ChildDashboard` or `AdultDashboard` based on `user.role`, and if `user` is `null`, React Router might still try to render one of these components, which then call hooks, and then unmount when `RequireAuth` redirects.

## Before (Problematic Code)

```tsx
export function DashboardPage() {
  // Hook 1: useAuth
  const { user } = useAuth();
  
  // Derived value
  const role = user?.role;

  // Conditional rendering - but if user is null, this could cause issues
  if (role === 'child') {
    return <ChildDashboard />; // This component has hooks
  }

  return <AdultDashboard role={role || 'parent'} />; // This component has hooks
}
```

**Problem**: If `user` is `null`, `role` is `undefined`, so it would render `AdultDashboard`, which calls hooks. Then when `RequireAuth` redirects, `AdultDashboard` unmounts, causing inconsistent hook counts.

## After (Fixed Code)

```tsx
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
  if (role === 'child') {
    return <ChildDashboard />;
  }

  return <AdultDashboard role={role || 'parent'} />;
}
```

## Key Changes

1. **Safety Check Added**: `if (!user) return null;` AFTER all hooks are called
   - Prevents `ChildDashboard` or `AdultDashboard` from rendering when `user` is `null`
   - All hooks are called before this check, maintaining stable hook order

2. **Hook Order Guaranteed**: 
   - Hook 1: `useAuth()` - always called
   - Safety check: `if (!user) return null;` - after hooks
   - Conditional rendering: Only happens when `user` exists

## How This Ensures Stable Hook Order

1. **All hooks called first**: `useAuth()` is always called at the top
2. **Safety check after hooks**: `if (!user) return null;` happens AFTER hooks
3. **Conditional rendering safe**: `ChildDashboard`/`AdultDashboard` only render when `user` exists
4. **No conditional hooks**: No hooks are called inside `if` statements or after early returns

## Result

- ✅ `DashboardPage` always calls the same hooks in the same order
- ✅ `ChildDashboard`/`AdultDashboard` never render when `user` is `null`
- ✅ No React error #310 when navigating to `/app/hub` while unauthenticated
- ✅ Stable hook order maintained across all render paths


