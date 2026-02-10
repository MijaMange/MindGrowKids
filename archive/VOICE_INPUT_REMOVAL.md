# Voice Input Removal - Summary

## Overview

Removed all remnants of voice input/recording mode from the codebase. The project only supports text and drawing input. Voice output (TTS) remains supported for reading AI replies aloud.

## Changes Made

### 1. Frontend Type Definitions

**File:** `src/state/useCheckinStore.ts`
- **Before:** `export type Mode = 'text' | 'drawing' | 'voice';`
- **After:** `export type Mode = 'text' | 'drawing';`

### 2. Frontend Mode Logic

**File:** `src/pages/JourneySimple/JourneySimplePage.tsx` (line 76)
- **Before:** `const mode = drawingUrl ? 'draw' : note ? 'text' : 'voice';`
- **After:** `const mode = drawingUrl ? 'draw' : 'text';`
- **Impact:** Mode defaults to 'text' instead of 'voice' when neither drawing nor note exists

**File:** `src/pages/Journey/FeelingJourney.tsx` (line 57)
- **Before:** `const mode = drawingUrl ? 'draw' : note ? 'text' : 'voice';`
- **After:** `const mode = drawingUrl ? 'draw' : 'text';`
- **Impact:** Same as above - consistent mode logic

### 3. Backend Model Definitions

**File:** `server/models/mongo.js` (line 46)
- **Before:** `mode: String, // "text" | "voice" | "draw"`
- **After:** `mode: String, // "text" | "draw"`
- **Impact:** Comment updated to reflect valid modes

**File:** `server/models/tenant.js` (line 44)
- **Before:** `mode: { type: String, enum: ['text', 'voice', 'draw'], required: true },`
- **After:** `mode: { type: String, enum: ['text', 'draw'], required: true },`
- **Impact:** Enum validation updated - 'voice' no longer accepted

### 4. Mock Data

**File:** `server/mock-db.json` (lines 206, 218)
- **Before:** `"mode": "voice"` (2 instances)
- **After:** `"mode": "text"` (2 instances)
- **Impact:** Test data updated for consistency

### 5. Documentation

**File:** `README.md`
- **Added:** "MVP Scope" section with:
  - List of implemented features
  - Explicit statement: "Voice Input/Recording: Voice input is not implemented. Children express emotions via text and drawing only."
  - Note about TTS (text-to-speech) being supported for voice output

## Final Mode Type

```typescript
export type Mode = 'text' | 'drawing';
```

## Mode Logic

```typescript
// Consistent across all checkin submissions
const mode = drawingUrl ? 'draw' : 'text';
```

**Behavior:**
- If `drawingUrl` exists → mode is `'draw'`
- Otherwise → mode is `'text'` (default)
- No fallback to 'voice' - removed completely

## Backend Validation

Backend now validates mode as:
- MongoDB: `enum: ['text', 'draw']` (in `tenant.js`)
- MongoDB: Comment updated to `"text" | "draw"` (in `mongo.js`)
- File-based DB: Accepts any string but frontend only sends 'text' or 'draw'

## Voice Output (TTS) - Still Supported

**Note:** Voice **output** (text-to-speech) remains fully supported:
- `src/utils/tts.ts` - Browser speech synthesis for reading AI replies
- Used in `JourneySimplePage` and `FeelingJourney` to read AI replies aloud
- This is **output only** - not input/recording

## Verification

All instances of 'voice' mode have been removed:
- ✅ Type definitions updated
- ✅ Mode logic updated (no 'voice' fallback)
- ✅ Backend enums updated
- ✅ Mock data updated
- ✅ Documentation updated

## Testing Recommendations

1. **Test checkin submission:**
   - Submit with drawing → should be mode `'draw'`
   - Submit with text only → should be mode `'text'`
   - Submit with neither → should be mode `'text'` (default)

2. **Test backend validation:**
   - Try submitting with `mode: 'voice'` → should be rejected by enum validation (if using tenant.js model)

3. **Verify analytics:**
   - Check that analytics still work correctly with only 'text' and 'draw' modes
