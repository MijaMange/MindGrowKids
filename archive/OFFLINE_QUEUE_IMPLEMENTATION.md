# Offline Queue Implementation

## Overview

A minimal offline queue system for child checkins that stores checkins locally when offline and syncs them when the connection is restored.

## Data Shape

### QueuedCheckin (localStorage)

```typescript
interface QueuedCheckin {
  clientId: string;        // Unique client-generated ID (e.g., "client-1234567890-abc123")
  timestamp: number;      // When queued (Date.now())
  payload: {
    emotion: string;      // "happy" | "calm" | "tired" | "sad" | "curious" | "angry"
    mode: string;         // "text" | "voice" | "draw"
    note?: string;        // Optional text note
    drawingRef?: string;  // Optional drawing URL/reference
  };
}
```

### Checkin (Backend)

```typescript
{
  orgId: string;
  classId: string;
  studentId: string;
  emotion: string;
  mode: string;
  note?: string;
  drawingRef?: string;
  dateISO: string;
  createdAtISO: string;
  clientId?: string;  // NEW: Optional client-generated ID for duplicate detection
}
```

## Implementation Details

### 1. Frontend: `src/utils/offlineQueue.ts`

**Functions:**
- `enqueueCheckin(payload)` - Adds checkin to localStorage queue
- `getQueuedCheckins()` - Returns all queued checkins
- `removeQueuedCheckin(clientId)` - Removes a checkin from queue
- `syncQueuedCheckins()` - Attempts to sync all queued checkins

**Storage:**
- Uses `localStorage` with key `'mgk-offline-checkin-queue'`
- Handles `QuotaExceededError` by keeping only last 10 items
- Generates unique `clientId` using: `client-${Date.now()}-${random}`

### 2. Frontend: `src/pages/JourneySimple/JourneySimplePage.tsx`

**Changes:**
- Imports `apiFetch`, `OfflineError`, `useOnlineStatus`, `enqueueCheckin`
- On checkin submit:
  - If offline OR `apiFetch` throws `OfflineError`: queues checkin locally
  - Shows message: "Sparat lokalt – skickas när du är online."
- Message auto-dismisses after 5 seconds

### 3. Frontend: `src/App.tsx`

**SyncWrapper Component:**
- Monitors `isOnline` status
- When coming online AND user is child:
  - Calls `syncQueuedCheckins()`
  - Processes queue one-by-one
  - Removes successful checkins
  - Stops on 401 (needs re-authentication)
  - Stops if offline again during sync

### 4. Backend: `server/models/mongo.js` & `server/models/tenant.js`

**CheckinSchema Updates:**
- Added `clientId: String` field (optional)
- Added unique index: `{ clientId: 1, studentId: 1 }` (sparse, unique)

### 5. Backend: `server/data/adapter.js`

**createCheckin Updates:**
- Accepts optional `clientId` parameter
- Checks for duplicates before creating:
  - MongoDB: `Checkin.findOne({ clientId, studentId })`
  - File DB: `db.checkins.find(c => c.clientId === clientId && c.studentId === studentId)`
- Returns existing checkin if duplicate found (idempotent)

### 6. Backend: `server/routes/checkins-new.js`

**Route Updates:**
- Accepts `clientId` in request body
- Passes `clientId` to `createCheckin()`

## Flow Diagram

```
User submits checkin (offline)
  ↓
JourneySimplePage detects offline
  ↓
enqueueCheckin() → localStorage
  ↓
Show message: "Sparat lokalt..."
  ↓
[User comes online]
  ↓
SyncWrapper detects online
  ↓
syncQueuedCheckins()
  ↓
For each queued checkin:
  - POST /api/checkins with clientId
  - Backend checks for duplicate
  - If duplicate: return existing (idempotent)
  - If new: create checkin
  - Remove from queue on success
  - Stop on 401 (needs auth)
```

## Duplicate Prevention

1. **Client-side**: Each queued checkin has unique `clientId`
2. **Server-side**: Unique index on `{ clientId, studentId }`
3. **Idempotent**: If duplicate `clientId` + `studentId` exists, return existing checkin
4. **Safe retries**: Multiple sync attempts won't create duplicates

## Error Handling

- **Offline during sync**: Stops syncing, keeps remaining items in queue
- **401 Unauthorized**: Stops syncing, logs warning (user needs to re-login)
- **Other errors**: Removes from queue to avoid infinite retry loops
- **Storage full**: Keeps only last 10 items

## Testing

To test offline queue:

1. Open browser DevTools → Network tab
2. Set to "Offline" mode
3. Submit a checkin in JourneySimplePage
4. Should see: "Sparat lokalt – skickas när du är online."
5. Check localStorage: `localStorage.getItem('mgk-offline-checkin-queue')`
6. Set Network back to "Online"
7. Check console for: `[App] Synced X checkin(s)`
8. Verify checkin appears in diary

## Limitations

- Only for child checkins (not parent/teacher actions)
- No service worker background sync
- Queue stored in localStorage (limited to ~5-10MB)
- No retry backoff strategy (simple one-by-one sync)
- No UI for viewing queued items (future enhancement)
