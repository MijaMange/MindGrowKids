import { apiFetch, OfflineError } from './config';

/**
 * Offline Queue for Child Checkins
 * 
 * Stores checkins in localStorage when offline and syncs when online.
 * Uses clientId to prevent duplicates.
 */

const QUEUE_KEY = 'mgk-offline-checkin-queue';

export interface QueuedCheckin {
  clientId: string; // Unique client-generated ID
  timestamp: number; // When queued
  payload: {
    emotion: string;
    mode: string;
    note?: string;
    drawingRef?: string;
  };
}

/**
 * Generate a unique client ID for a checkin
 */
function generateClientId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Get all queued checkins from localStorage
 */
export function getQueuedCheckins(): QueuedCheckin[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.error('[offlineQueue] Error reading queue:', err);
    return [];
  }
}

/**
 * Add a checkin to the offline queue
 */
export function enqueueCheckin(payload: QueuedCheckin['payload']): QueuedCheckin {
  const checkin: QueuedCheckin = {
    clientId: generateClientId(),
    timestamp: Date.now(),
    payload,
  };

  const queue = getQueuedCheckins();
  queue.push(checkin);
  
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[offlineQueue] Error saving queue:', err);
    // If storage is full, remove oldest items
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      const trimmed = queue.slice(-10); // Keep only last 10
      localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
    }
  }

  return checkin;
}

/**
 * Remove a checkin from the queue by clientId
 */
export function removeQueuedCheckin(clientId: string): void {
  const queue = getQueuedCheckins();
  const filtered = queue.filter((c) => c.clientId !== clientId);
  
  try {
    if (filtered.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('[offlineQueue] Error removing from queue:', err);
  }
}

/**
 * Sync all queued checkins to the server
 * 
 * Returns:
 * - { synced: number, failed: number, needsAuth: boolean }
 */
export async function syncQueuedCheckins(): Promise<{
  synced: number;
  failed: number;
  needsAuth: boolean;
}> {
  const queue = getQueuedCheckins();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, needsAuth: false };
  }

  let synced = 0;
  let failed = 0;
  let needsAuth = false;

  // Process one by one to avoid overwhelming the server
  for (const checkin of queue) {
    try {
      const res = await apiFetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkin.payload,
          clientId: checkin.clientId, // Include clientId for duplicate detection
        }),
      });

      if (res.status === 401) {
        // Stop syncing if we need to re-authenticate
        needsAuth = true;
        break;
      }

      if (res.ok) {
        removeQueuedCheckin(checkin.clientId);
        synced++;
      } else {
        // Server rejected - might be duplicate or error
        // Remove anyway to avoid infinite retry
        removeQueuedCheckin(checkin.clientId);
        failed++;
      }
    } catch (err) {
      // If offline again, stop syncing
      if (err instanceof OfflineError) {
        break;
      }
      // Other errors - remove from queue to avoid infinite retry
      removeQueuedCheckin(checkin.clientId);
      failed++;
    }
  }

  return { synced, failed, needsAuth };
}
