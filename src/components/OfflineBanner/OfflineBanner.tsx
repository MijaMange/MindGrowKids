import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import './OfflineBanner.css';

/**
 * OfflineBanner - Calm banner that appears when user is offline
 * 
 * Features:
 * - Only shows when offline
 * - Calm message about limited functionality
 * - "Försök igen" button to re-check connection
 * - "Stäng" button to dismiss until status changes
 * - Accessible: role="status", aria-live="polite"
 * - Auto-dismisses when connection is restored
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state when connection is restored
  useEffect(() => {
    if (isOnline) {
      setIsDismissed(false);
    }
  }, [isOnline]);

  // Don't show if online or dismissed
  if (isOnline || isDismissed) {
    return null;
  }

  function handleRetry() {
    // Re-check connection by triggering a small fetch
    // This will update navigator.onLine if it's stale
    fetch('/favicon.ico', { 
      method: 'HEAD', 
      cache: 'no-cache',
      mode: 'no-cors' // Avoids CORS errors, just checks connectivity
    }).catch(() => {
      // Ignore errors, the online/offline events will handle state
    });
  }

  function handleDismiss() {
    setIsDismissed(true);
  }

  return (
    <div 
      className="offline-banner"
      role="status"
      aria-live="polite"
      aria-label="Offline-meddelande"
    >
      <div className="offline-banner-content">
        <div className="offline-banner-message">
          <span className="offline-banner-icon" aria-hidden="true">📡</span>
          <span className="offline-banner-text">
            Du är offline. Vissa funktioner kan vara begränsade.
          </span>
        </div>
        <div className="offline-banner-actions">
          <button
            className="offline-banner-button offline-banner-button-retry"
            onClick={handleRetry}
            type="button"
            aria-label="Försök igen - kontrollera anslutning"
          >
            Försök igen
          </button>
          <button
            className="offline-banner-button offline-banner-button-dismiss"
            onClick={handleDismiss}
            type="button"
            aria-label="Stäng meddelande"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
