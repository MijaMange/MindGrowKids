import { useState, useEffect } from 'react';

/**
 * useOnlineStatus - Hook to track online/offline status
 * 
 * Returns:
 * - isOnline: boolean indicating if the browser is online
 * 
 * Usage:
 * const isOnline = useOnlineStatus();
 * 
 * Note: navigator.onLine can be unreliable (may return true even if offline).
 * This hook listens to both 'online' and 'offline' events for better accuracy.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with navigator.onLine if available
    if (typeof window !== 'undefined' && 'navigator' in window) {
      return navigator.onLine;
    }
    // Default to true if we can't determine (SSR or no navigator)
    return true;
  });

  useEffect(() => {
    // Only set up listeners in browser environment
    if (typeof window === 'undefined') return;

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
