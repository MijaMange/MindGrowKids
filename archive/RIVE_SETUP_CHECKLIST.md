# Rive Setup Checklist

## Step-by-Step Guide to Fix Rive in Vite App

### 1. File Location
- [ ] Create folder: `public/rive/` (if it doesn't exist)
- [ ] Place your Rive file: `public/rive/jungle-guide.riv`
- [ ] Verify file name matches exactly: `jungle-guide.riv` (case-sensitive)

### 2. Verify File is Accessible
- [ ] Start dev server: `npm run dev`
- [ ] Open browser: `http://localhost:5173/rive/jungle-guide.riv`
- [ ] Expected: File downloads or browser shows file info
- [ ] If 404: File is not in correct location

### 3. Clear Service Worker Cache
If you see cached errors:

**Option A: Unregister Service Worker (Recommended)**
1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Service Workers** in left sidebar
4. Click **Unregister** for any registered workers
5. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**Option B: Bypass Network**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Check **Disable cache**
4. Check **Bypass for service worker** (if available)
5. Refresh page

**Option C: Clear All Site Data**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage** in left sidebar
4. Check **Cache storage** and **Service workers**
5. Click **Clear site data**

### 4. Verify Rive File Export
- [ ] Open `.riv` file in Rive Editor
- [ ] Check that file is not corrupted (should open without errors)
- [ ] Verify State Machine exists (if using state machine)
- [ ] Verify Input named `reactSignal` exists (if using state machine)

### 5. Check Console Logs
After refreshing, check browser console for:
- [ ] `[RiveGuide] Checking file: /rive/jungle-guide.riv`
- [ ] `[RiveGuide] File found. Content-Type: ...`
- [ ] `[RiveGuide] Rive file loaded successfully`
- [ ] Dev badge shows: **"Rive: ON"**

### 6. Troubleshooting

**If you see "Rive: OFF (file missing)":**
- File is not in `public/rive/jungle-guide.riv`
- Check file name spelling (case-sensitive)
- Check that `public/` folder exists in project root
- Restart dev server after adding file

**If you see "Rive: OFF (corrupt)":**
- File exists but Rive can't parse it
- Re-export from Rive Editor
- Check file size (should be > 0 bytes)
- Try opening file in Rive Editor to verify it's valid

**If you see "Rive: Found" but not "Rive: ON":**
- File exists but Rive library failed to load
- Check browser console for Rive-specific errors
- Verify `@rive-app/react-canvas` is installed: `npm list @rive-app/react-canvas`
- Check network tab for failed requests

**If service worker is blocking:**
- Follow Step 3 to clear cache
- Check `vite.config.ts` - ensure `/rive/*` is not in `globIgnores`
- Restart dev server

### 7. Verify State Machine (Optional)
If using state machine:
- [ ] State Machine name matches `STATE_MACHINE_NAME` in `RiveGuide.tsx`
- [ ] Input name matches `INPUT_NAME` in `RiveGuide.tsx`
- [ ] State Machine has transitions for: idle, hover, confirm

### 8. Test Interaction
- [ ] Hover over "Start" button → Rive should react
- [ ] Click "Start" button → Rive should show confirmation animation
- [ ] Check dev badge shows correct status

## Quick Test Command

```bash
# Check if file exists
ls public/rive/jungle-guide.riv

# Or on Windows PowerShell:
Test-Path public\rive\jungle-guide.riv
```

## Expected File Structure

```
MindGrowKids/
├── public/
│   └── rive/
│       └── jungle-guide.riv  ← File should be here
├── src/
│   └── components/
│       └── RiveGuide/
│           ├── RiveGuide.tsx
│           └── RiveGuide.css
└── ...
```

## Notes

- The Rive file is **optional** - the app works without it
- Fallback SVG leaf buddy will show if Rive is unavailable
- Dev badge only appears in development mode (`npm run dev`)
- In production, ensure `public/rive/jungle-guide.riv` is included in build



