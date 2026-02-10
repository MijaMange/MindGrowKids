# LandingPage Hook Verification

## Current Structure

```tsx
export function LandingPage() {
  // Hook 1: useNavigate
  const navigate = useNavigate();
  // Hook 2: useState
  const [showLogin, setShowLogin] = useState(false);
  // Hook 3: useMemo
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // All hooks called, now safe to render
  return (
    <div>
      {/* ... */}
      <LoginModal isOpen={showLogin} ... />
    </div>
  );
}
```

## LoginModal Structure

```tsx
export function LoginModal({ isOpen, ... }) {
  // Hook 1: useAuth
  const { login } = useAuth();
  // Hook 2-5: useState
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Early return AFTER all hooks
  if (!isOpen) return null;

  return (...);
}
```

## Verification

✅ LandingPage: 3 hooks, all at top
✅ LoginModal: 5 hooks, all at top, early return after hooks
✅ LoginModal always rendered (returns null when closed) - maintains stable hook order
✅ No conditional rendering of LoginModal - prevents mount/unmount hook issues

## If Error #310 Persists

The issue is likely NOT in LandingPage or LoginModal, but rather:

1. **React Router mounting/unmounting** - When navigating, React Router might be causing components to mount/unmount in a way that confuses hook tracking
2. **AuthContext updates** - When login succeeds and user state updates, it might trigger re-renders that cause hook count mismatches
3. **Navigation timing** - The navigation to `/hub` might happen before React has finished processing all hooks

## Next Steps

If error #310 still occurs on LandingPage:

1. Check browser console for exact error stack trace
2. Verify which component is mentioned in the error
3. Check if error occurs:
   - On initial page load?
   - When clicking "Börja här"?
   - When opening LoginModal?
   - When submitting login?
   - When navigating to /hub?


