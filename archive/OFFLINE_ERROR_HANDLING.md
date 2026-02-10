# Offline Error Handling Guide

## Overview

The app now has offline detection and structured error handling. This document explains how to handle offline errors in your components.

## Error Types

### `OfflineError`
Thrown when `navigator.onLine === false` (user is offline).

```typescript
import { OfflineError } from '../utils/config';

try {
  const res = await apiFetch('/api/checkins');
} catch (err) {
  if (err instanceof OfflineError) {
    // User is offline
  }
}
```

### `NetworkError`
Thrown when fetch fails due to network issues (server unreachable, timeout, etc.).

```typescript
import { NetworkError } from '../utils/config';

try {
  const res = await apiFetch('/api/checkins');
} catch (err) {
  if (err instanceof NetworkError) {
    // Network error (server unreachable, etc.)
  }
}
```

## Best Practices

### 1. Always Handle Offline Errors

**Bad:**
```typescript
const res = await apiFetch('/api/checkins');
const data = await res.json();
```

**Good:**
```typescript
try {
  const res = await apiFetch('/api/checkins');
  if (!res.ok) {
    // Handle HTTP errors
    return;
  }
  const data = await res.json();
  setCheckins(data);
} catch (err) {
  if (err instanceof OfflineError) {
    // Show friendly message or use cached data
    console.log('Offline - using cached data');
    // Optionally show inline message
  } else if (err instanceof NetworkError) {
    // Show network error message
    console.error('Network error:', err.message);
  } else {
    // Other errors
    console.error('Error:', err);
  }
}
```

### 2. Use Inline Messages (Not Alerts)

**Bad:**
```typescript
catch (err) {
  if (err instanceof OfflineError) {
    alert('Du är offline!');
  }
}
```

**Good:**
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // ... API call
} catch (err) {
  if (err instanceof OfflineError) {
    setError('Du är offline. Vissa funktioner kan vara begränsade.');
  }
}

// In JSX:
{error && (
  <div className="error-message" role="alert">
    {error}
  </div>
)}
```

### 3. Provide Fallback Data

When offline, show cached data if available:

```typescript
const [checkins, setCheckins] = useState<any[]>([]);
const [isOffline, setIsOffline] = useState(false);

useEffect(() => {
  async function load() {
    try {
      const res = await apiFetch('/api/checkins');
      const data = await res.json();
      setCheckins(data);
      setIsOffline(false);
      
      // Cache for offline use
      localStorage.setItem('cached-checkins', JSON.stringify(data));
    } catch (err) {
      if (err instanceof OfflineError) {
        setIsOffline(true);
        // Use cached data
        const cached = localStorage.getItem('cached-checkins');
        if (cached) {
          setCheckins(JSON.parse(cached));
        }
      }
    }
  }
  load();
}, []);
```

### 4. Disable Actions When Offline

For actions that require network (save, submit, etc.):

```typescript
const isOnline = useOnlineStatus();
const [saving, setSaving] = useState(false);

async function handleSave() {
  if (!isOnline) {
    setError('Du är offline. Kan inte spara.');
    return;
  }
  
  setSaving(true);
  try {
    await apiFetch('/api/checkins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Success
  } catch (err) {
    if (err instanceof OfflineError) {
      setError('Du är offline. Kan inte spara just nu.');
    }
  } finally {
    setSaving(false);
  }
}

// In JSX:
<button 
  onClick={handleSave}
  disabled={!isOnline || saving}
>
  {saving ? 'Sparar...' : 'Spara'}
</button>
```

## Example: JourneySimplePage

```typescript
import { OfflineError, NetworkError } from '../../utils/config';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function JourneySimplePage() {
  const isOnline = useOnlineStatus();
  const [error, setError] = useState<string | null>(null);
  
  async function submit() {
    if (!isOnline) {
      setError('Du är offline. Kan inte skicka just nu.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get AI reply
      const resp = await apiFetch('/api/listen', {
        method: 'POST',
        body: JSON.stringify({ emotion, note }),
      });
      const data = await resp.json();
      setReply(data?.reply || 'Tack för att du berättade.');
      
      // Save checkin
      await apiFetch('/api/checkins', {
        method: 'POST',
        body: JSON.stringify({
          emotion,
          mode: drawingUrl ? 'draw' : note ? 'text' : 'voice',
          note: note || undefined,
          drawingRef: drawingUrl || undefined,
        }),
      });
    } catch (err) {
      if (err instanceof OfflineError) {
        setError('Du är offline. Din anteckning sparas när du är online igen.');
        // Optionally queue for later
      } else if (err instanceof NetworkError) {
        setError('Kunde inte ansluta. Kontrollera din internetanslutning.');
      } else {
        setError('Ett fel uppstod. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {/* ... rest of component */}
    </div>
  );
}
```

## Global Offline Banner

The `OfflineBanner` component is already integrated globally in `App.tsx`. It will:
- Automatically show when user goes offline
- Auto-dismiss when connection is restored
- Provide "Försök igen" and "Stäng" buttons

You don't need to manually show/hide it - it's handled automatically.

## Summary

1. **Always wrap `apiFetch` calls in try/catch**
2. **Check for `OfflineError` and `NetworkError` specifically**
3. **Show inline error messages (never use `alert()`)**
4. **Use `useOnlineStatus()` hook to disable actions when offline**
5. **Provide fallback/cached data when possible**
6. **The global `OfflineBanner` handles general offline state**
