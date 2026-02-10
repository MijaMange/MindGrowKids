# MindGrow Kids - Manual Testing Plan

**Last Updated:** 2025-01-27  
**Purpose:** Comprehensive manual testing guide for MVP submission

---

## 1. Test Environment

### Prerequisites

- **Node.js:** v18+ (check with `node --version`)
- **npm:** v9+ (check with `npm --version`)
- **Browser:** Latest Chrome, Firefox, or Safari
- **Database:** MongoDB (optional - falls back to file-based storage if not available)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`

3. **Seed test data (optional, if using MongoDB):**
   ```bash
   npm run seed
   ```

### Test Users

#### MongoDB Seed Users (from `scripts/seed.mjs`)

**Child:**
- Email: `otto@test.se`
- Password: `Hemligt123`
- Class Code: `1234`

**Parent:**
- Email: `parent@test.se`
- Password: `Hemligt123`

**Teacher (Pro):**
- Email: `larare@test.se`
- Password: `Hemligt123`
- Class Code: `1234`

#### File-Based DB Users (from `server/mock-db.json`)

**Child:**
- Email: `emma`
- Password: (check mock-db.json or register new)

**Parent:**
- Email: `test` or `anna`
- Password: `Hemligt123`

**Teacher:**
- Email: `lara`
- Password: `Hemligt123`
- Class Code: `TEST-123`

### URLs

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:4000`
- **Landing Page:** `http://localhost:5173/`
- **Login:** `http://localhost:5173/login`
- **Hub:** `http://localhost:5173/hub` or `/test-hub`
- **Diagnostics:** `http://localhost:5173/diag`

---

## 2. Role-Based Critical Paths

### 2.1 Child Flow

**Path:** Login → Journey → Submit Checkin → AI Reply → View Diary

#### Steps:

1. **Login**
   - Navigate to `http://localhost:5173/login`
   - Enter child credentials (e.g., `otto@test.se` / `Hemligt123`)
   - Click "Logga in"
   - **Expected:** Redirected to `/hub` (or `/test-hub`)

2. **Navigate to Journey**
   - From hub, click "Hur känner jag mig idag?" button
   - Or navigate directly to `/app/journey-simple`
   - **Expected:** Journey page loads with emotion picker

3. **Select Emotion**
   - Click one of the 6 emotion buttons (happy, calm, tired, sad, curious, angry)
   - **Expected:** Selected emotion is highlighted, "Nästa" button becomes enabled

4. **Add Text Note (Optional)**
   - Type a note in the text area (e.g., "Jag är glad idag")
   - **Expected:** Text appears in textarea

5. **Add Drawing (Optional)**
   - Draw something in the canvas
   - Click "Spara teckning"
   - **Expected:** Drawing is saved, canvas shows drawing

6. **Submit Checkin**
   - Click "Skicka" button
   - **Expected:** 
     - Loading state shows
     - AI reply appears (Swedish, reflective, non-advisory)
     - TTS reads reply aloud (if browser supports)
     - Checkin is saved to backend

7. **View Diary**
   - Navigate to "Mina dagar" from hub or `/app/diary-simple`
   - **Expected:** 
     - List of checkins appears
     - Most recent checkin is visible
     - Can navigate between dates

#### Acceptance Criteria:

- ✅ Can log in with child credentials
- ✅ Can select emotion and proceed
- ✅ Can add text and/or drawing
- ✅ AI reply appears within 2 seconds
- ✅ AI reply is in Swedish, reflective, non-advisory
- ✅ Checkin appears in diary
- ✅ TTS reads reply (if supported)

---

### 2.2 Parent Flow

**Path:** Login → Link Child → View Child Diary → Export CSV

#### Steps:

1. **Login**
   - Navigate to `http://localhost:5173/login`
   - Enter parent credentials (e.g., `parent@test.se` / `Hemligt123`)
   - Click "Logga in"
   - **Expected:** Redirected to `/hub` with parent dashboard

2. **Link Child via PIN**
   - Navigate to "Mina barn" (`/app/parent-children`)
   - **Expected:** Empty state if no children linked, or list of linked children

3. **Get PIN from Child**
   - (In separate browser/incognito) Log in as child
   - Navigate to journey page
   - Child requests PIN (if feature exists) or uses permanent link code
   - **Expected:** PIN or link code is displayed

4. **Link Child**
   - Enter PIN (4 digits) or link code (6 digits) in parent page
   - Click "Länka"
   - **Expected:** 
     - Success message appears
     - Child appears in "Mina barn" list

5. **View Child Diary**
   - Click on child name or "Se dagbok" button
   - **Expected:** 
     - Navigate to `/app/parent-diary-simple?childId=<id>`
     - Child's checkins are displayed
     - Grouped by date
     - Shows emotions, notes, drawings

6. **Export CSV (if available)**
   - Look for "Exportera CSV" button/link
   - Click it
   - **Expected:** CSV file downloads with checkin data

#### Acceptance Criteria:

- ✅ Can log in with parent credentials
- ✅ Can link child via PIN or link code
- ✅ Linked child appears in list
- ✅ Can view child's diary
- ✅ Diary shows checkins with correct data
- ✅ CSV export works (if implemented)

---

### 2.3 Teacher (Pro) Flow

**Path:** Login → Create Class → Generate QR → View Analytics → Export CSV

#### Steps:

1. **Login**
   - Navigate to `http://localhost:5173/login`
   - Enter teacher credentials (e.g., `larare@test.se` / `Hemligt123`)
   - Click "Logga in"
   - **Expected:** Redirected to `/hub` with teacher dashboard

2. **Create Class (if not exists)**
   - Navigate to "Klassens statistik" (`/app/pro-simple`)
   - If no class exists, enter class name
   - Click "Skapa klasskod"
   - **Expected:** 
     - Class code is generated (e.g., "C-XXXXX")
     - QR code appears
     - Class name is displayed

3. **View QR Code**
   - QR code should be visible on class page
   - **Expected:** 
     - QR code image loads
     - Can scan with phone (if testing mobile)

4. **View Students**
   - Scroll to "Elever" section
   - **Expected:** 
     - List of students in class appears
     - Or empty state if no students

5. **View Weekly Analytics**
   - Scroll to "Översikt för klass/grupp"
   - **Expected:** 
     - Weekly summary text appears (AI-generated or fallback)
     - Emotion distribution chart (Doughnut) shows
     - Time series chart (Line) shows trends
     - Or empty state if no data

6. **Export CSV**
   - Click "Exportera CSV" link
   - **Expected:** CSV file downloads with aggregated data

7. **View Class Diary**
   - Navigate to "Klassens dagbok" (`/app/pro-diary-simple`)
   - **Expected:** 
     - List of all class checkins
     - Grouped by date
     - Shows anonymized student data

#### Acceptance Criteria:

- ✅ Can log in with teacher credentials
- ✅ Can create class and get class code
- ✅ QR code generates and displays
- ✅ Students appear in list (if registered with class code)
- ✅ Analytics show data (or empty state)
- ✅ Charts render correctly
- ✅ CSV export works
- ✅ Class diary shows checkins

---

## 3. Edge Cases

### 3.1 Offline Scenarios

#### Test: Submit Checkin While Offline

1. **Setup:**
   - Open browser DevTools → Network tab
   - Set to "Offline" mode
   - Log in as child

2. **Steps:**
   - Navigate to journey page
   - Select emotion, add note/drawing
   - Click "Skicka"

3. **Expected:**
   - Offline banner appears at top: "Du är offline. Vissa funktioner fungerar inte."
   - Message appears: "Sparat lokalt – skickas när du är online."
   - Checkin is queued in localStorage

4. **Go Online:**
   - Set Network back to "Online"
   - **Expected:** 
     - Offline banner disappears
     - Queued checkin syncs automatically
     - Console shows: `[App] Synced X checkin(s)`
     - Checkin appears in diary

**Acceptance Criteria:**
- ✅ Offline banner appears when offline
- ✅ Checkin is queued locally
- ✅ Message confirms local save
- ✅ Checkin syncs when online
- ✅ No data loss

---

### 3.2 Empty States

#### Test: No Children Linked (Parent)

1. **Setup:**
   - Log in as parent with no linked children

2. **Steps:**
   - Navigate to "Mina barn" (`/app/parent-children`)

3. **Expected:**
   - Empty state appears:
     - Icon: 👨‍👩‍👧
     - Title: "Inga barn länkade ännu"
     - Description with instructions
     - Action button: "Länka ett barn"
   - Clicking button focuses link input

**Acceptance Criteria:**
- ✅ Empty state is clear and helpful
- ✅ Action button works
- ✅ Instructions are clear

#### Test: No Checkins Yet (Child Diary)

1. **Setup:**
   - Log in as child with no checkins

2. **Steps:**
   - Navigate to "Mina dagar" (`/app/diary-simple`)

3. **Expected:**
   - Empty state appears:
     - Title: "Inga anteckningar för denna dag"
     - Description: "Gå till 'Hur känner jag mig idag?' för att lägga till en känsla."
     - Icon: 📅

**Acceptance Criteria:**
- ✅ Empty state is clear
- ✅ Guidance is provided

#### Test: No Students in Class (Teacher)

1. **Setup:**
   - Log in as teacher with new class (no students)

2. **Steps:**
   - Navigate to "Klassens statistik" (`/app/pro-simple`)

3. **Expected:**
   - Empty state in "Elever" section:
     - Title: "Inga elever ännu"
     - Description: "Elever ansluter automatiskt när de registrerar sig med din klasskod."
   - Empty state in charts:
     - Title: "Ingen data ännu"
     - Description: "Anteckningar visas här när elever börjar använda appen."

**Acceptance Criteria:**
- ✅ Empty states are informative
- ✅ No errors or crashes

---

### 3.3 Error States

#### Test: Invalid Login

1. **Steps:**
   - Navigate to `/login`
   - Enter invalid credentials (e.g., `wrong@test.se` / `wrongpass`)
   - Click "Logga in"

2. **Expected:**
   - Error message appears: "Fel användarnamn eller lösenord"
   - Error is announced to screen readers (if testing accessibility)
   - Form remains accessible

**Acceptance Criteria:**
- ✅ Error message is clear
- ✅ Error is accessible (ARIA)
- ✅ Can retry login

#### Test: Expired Session

1. **Setup:**
   - Log in successfully
   - Manually delete/expire JWT cookie in DevTools

2. **Steps:**
   - Try to navigate to protected route (e.g., `/app/journey-simple`)

3. **Expected:**
   - Redirected to `/login` or `/`
   - Or error message appears
   - No white screen crash

**Acceptance Criteria:**
- ✅ Graceful handling of expired session
- ✅ No crashes
- ✅ User can re-login

#### Test: Server Down

1. **Setup:**
   - Stop backend server (`Ctrl+C` in terminal running `npm run dev:api`)

2. **Steps:**
   - Try to submit checkin
   - Try to load diary
   - Try to link child

3. **Expected:**
   - Network errors are handled gracefully
   - Error messages appear (not white screen)
   - Offline banner may appear
   - No crashes

**Acceptance Criteria:**
- ✅ Errors are handled gracefully
- ✅ No white screen crashes
- ✅ User can retry when server is back

---

## 4. Accessibility Checks

### 4.1 Keyboard-Only Navigation

#### Test: Full Keyboard Walkthrough

1. **Setup:**
   - Disable mouse/trackpad (or use keyboard only)
   - Start at landing page

2. **Steps:**
   - Tab through all interactive elements
   - Use Enter/Space to activate buttons
   - Use Escape to close modals/menus

3. **Expected:**
   - All interactive elements are reachable via Tab
   - Focus indicators are visible
   - Skip link appears when focused
   - Modals/menus can be closed with Escape
   - Focus is trapped within modals

**Acceptance Criteria:**
- ✅ All functionality accessible via keyboard
- ✅ Focus indicators are clear
- ✅ Skip link works
- ✅ Focus trap works in modals

---

### 4.2 Screen Reader Spot Checks

#### Test: Login Form

1. **Setup:**
   - Enable screen reader (NVDA/JAWS/VoiceOver)
   - Navigate to `/login`

2. **Steps:**
   - Tab through form fields
   - Submit with errors

3. **Expected:**
   - Labels are announced for inputs
   - Error messages are announced
   - Required fields are indicated
   - Form structure is clear

**Acceptance Criteria:**
- ✅ Labels are announced
- ✅ Errors are announced
- ✅ Form is navigable

#### Test: Modal/Drawer

1. **Setup:**
   - Enable screen reader
   - Open login modal or hamburger menu

2. **Steps:**
   - Navigate through modal/drawer

3. **Expected:**
   - Modal title is announced
   - Modal role is announced ("dialog")
   - Focus is trapped within modal
   - Close button is accessible

**Acceptance Criteria:**
- ✅ Modal is announced correctly
- ✅ Focus trap works
- ✅ Can close modal

---

### 4.3 Focus Trap in Modal/Menu

#### Test: Login Modal

1. **Steps:**
   - Click "Börja här" on landing page
   - Modal opens
   - Tab through fields
   - Tab past last field

2. **Expected:**
   - Focus loops back to first field
   - Cannot tab outside modal
   - Escape closes modal

**Acceptance Criteria:**
- ✅ Focus is trapped
- ✅ Escape closes modal

#### Test: Hamburger Menu

1. **Steps:**
   - Log in
   - Click hamburger menu (☰)
   - Tab through menu items
   - Tab past last item

2. **Expected:**
   - Focus loops back to first item
   - Cannot tab outside menu
   - Escape closes menu

**Acceptance Criteria:**
- ✅ Focus is trapped
- ✅ Escape closes menu

---

### 4.4 Skip Link

#### Test: Skip to Content

1. **Steps:**
   - Navigate to any page
   - Press Tab (before any other interaction)

2. **Expected:**
   - "Hoppa till huvudinnehåll" link appears
   - Press Enter
   - Focus jumps to main content area

**Acceptance Criteria:**
- ✅ Skip link appears on focus
- ✅ Skip link works
- ✅ Focus jumps to main content

---

### 4.5 Reduced Motion

#### Test: Prefers-Reduced-Motion

1. **Setup:**
   - Enable "Reduce motion" in OS settings:
     - **macOS:** System Preferences → Accessibility → Display → Reduce motion
     - **Windows:** Settings → Ease of Access → Display → Show animations
   - Or use browser DevTools to simulate

2. **Steps:**
   - Navigate through app
   - Observe animations

3. **Expected:**
   - Animations are disabled or minimal
   - Floating emojis are static
   - Loading spinners are static or minimal
   - No jarring movements

**Acceptance Criteria:**
- ✅ Animations respect `prefers-reduced-motion`
- ✅ No jarring movements
- ✅ App remains functional

---

## 5. Browser/Device Matrix

### 5.1 Desktop Browsers

#### Chrome (Latest)

**Test:**
- All critical paths (Child, Parent, Pro)
- Offline scenarios
- Accessibility checks

**Expected:**
- All features work
- No console errors
- Performance is acceptable

#### Firefox (Latest)

**Test:**
- All critical paths
- Offline scenarios
- Accessibility checks

**Expected:**
- All features work
- No console errors
- Performance is acceptable

#### Safari (macOS, Latest)

**Test:**
- All critical paths
- Offline scenarios
- Accessibility checks

**Expected:**
- All features work
- No console errors
- Performance is acceptable
- TTS works (Safari supports speechSynthesis)

---

### 5.2 Mobile Browsers

#### iOS Safari (iPhone/iPad)

**Test:**
- All critical paths
- Touch interactions
- Responsive layout
- PWA installation (if applicable)

**Expected:**
- Layout is responsive
- Touch targets are adequate (44x44px minimum)
- Can install as PWA
- Performance is acceptable

#### Android Chrome

**Test:**
- All critical paths
- Touch interactions
- Responsive layout
- PWA installation (if applicable)

**Expected:**
- Layout is responsive
- Touch targets are adequate
- Can install as PWA
- Performance is acceptable

---

## 6. Acceptance Criteria Summary

### Critical Paths

| Scenario | Pass Criteria |
|----------|--------------|
| **Child: Login → Journey → Submit → Diary** | ✅ Can complete full flow, AI reply appears, checkin saved |
| **Parent: Login → Link Child → View Diary** | ✅ Can link child, view diary, see checkins |
| **Pro: Login → Create Class → View Analytics** | ✅ Can create class, view analytics, export CSV |

### Edge Cases

| Scenario | Pass Criteria |
|----------|--------------|
| **Offline Checkin** | ✅ Queues locally, syncs when online, no data loss |
| **Empty States** | ✅ Clear messages, helpful guidance, no errors |
| **Error States** | ✅ Graceful handling, clear messages, no crashes |

### Accessibility

| Scenario | Pass Criteria |
|----------|--------------|
| **Keyboard Navigation** | ✅ All functionality accessible, focus indicators visible |
| **Screen Reader** | ✅ Labels announced, errors announced, structure clear |
| **Focus Trap** | ✅ Works in modals/menus, Escape closes |
| **Skip Link** | ✅ Appears on focus, jumps to content |
| **Reduced Motion** | ✅ Animations respect preference, no jarring movements |

### Browser Compatibility

| Browser | Pass Criteria |
|---------|--------------|
| **Chrome** | ✅ All features work, no errors |
| **Firefox** | ✅ All features work, no errors |
| **Safari** | ✅ All features work, no errors |
| **iOS Safari** | ✅ Responsive, touch-friendly, PWA works |
| **Android Chrome** | ✅ Responsive, touch-friendly, PWA works |

---

## 7. Known Issues / Limitations

### Current Limitations

1. **Offline Queue:** Only child checkins are queued. Parent linking and teacher analytics require online connection.

2. **Voice Input:** Not implemented. Children express emotions via text and drawing only.

3. **Test Coverage:** Minimal automated tests. Manual testing is primary validation method.

4. **Rate Limiting:** In-memory only (resets on server restart). Not persistent.

---

## 8. Test Checklist

Use this checklist to track testing progress:

### Setup
- [ ] Dependencies installed
- [ ] Servers running (frontend + backend)
- [ ] Test data seeded (if using MongoDB)

### Child Flow
- [ ] Login works
- [ ] Journey page loads
- [ ] Emotion selection works
- [ ] Text input works
- [ ] Drawing works
- [ ] Submit checkin works
- [ ] AI reply appears
- [ ] TTS reads reply
- [ ] Diary shows checkin

### Parent Flow
- [ ] Login works
- [ ] Can link child via PIN
- [ ] Can link child via link code
- [ ] Linked child appears in list
- [ ] Can view child diary
- [ ] Diary shows checkins
- [ ] CSV export works (if available)

### Pro Flow
- [ ] Login works
- [ ] Can create class
- [ ] QR code generates
- [ ] Students appear in list
- [ ] Analytics show data
- [ ] Charts render
- [ ] CSV export works
- [ ] Class diary shows checkins

### Edge Cases
- [ ] Offline checkin queues
- [ ] Offline checkin syncs
- [ ] Empty states appear correctly
- [ ] Error states handled gracefully
- [ ] No crashes on errors

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader works
- [ ] Focus trap works
- [ ] Skip link works
- [ ] Reduced motion respected

### Browsers
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] iOS Safari works (if available)
- [ ] Android Chrome works (if available)

---

## 9. Reporting Issues

When reporting issues, include:

1. **Browser/Device:** Chrome 120 on macOS, iOS Safari 17, etc.
2. **Steps to Reproduce:** Detailed steps
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happened
5. **Console Errors:** Any errors in browser console
6. **Network Errors:** Any failed API calls
7. **Screenshots:** If applicable

---

## 10. Quick Test Commands

```bash
# Start servers
npm run dev

# Seed test data (MongoDB)
npm run seed

# Run automated tests
npm test

# Check diagnostics
curl http://localhost:4000/api/health
curl http://localhost:4000/api/db-info
```

---

**End of Manual Testing Plan**
