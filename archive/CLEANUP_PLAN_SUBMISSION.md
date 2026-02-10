# Repository Cleanup Plan — Degree Project Submission

**Goal:** Remove or archive files that do not serve a clear purpose in the final prototype, while keeping everything required to run, understand, and evaluate the project.

**Scope:** Academic submission; clarity over completeness. No deletion of build/runtime code.

---

## 1. CLASSIFICATION OF FILES

### MUST KEEP (do not delete or archive)

| File | Reason |
|------|--------|
| `README.md` | Main project description; required. |
| `docs/DEPLOYMENT.md` | How to deploy; referenced by README (production). |
| `docs/PRODUCTION_SETUP.md` | Referenced in README for database/production. |
| `docs/MANUAL_TESTING.md` | Referenced in README; testing evidence for report. |
| `docs/ACCESSIBILITY_IMPROVEMENTS.md` | Accessibility documentation for report. |
| `docs/FINAL_TECHNICAL_AUDIT.md` | Technical accuracy for presentation/report. |
| `docs/ACADEMIC_REVIEW_GRADING.md` | Grading and report support. |
| `docs/DIAGNOS_PROJEKT_SLUTRAPPORT.md` | Report/summary support. |
| `package.json`, `package-lock.json` | Build and runtime. |
| `vite.config.ts`, `tsconfig.json`, `jest.config.cjs` | Build and test. |
| `index.html` | Entry point. |
| `server/**` (all) | Backend required to run. |
| `src/**` (all) | Frontend required to run. |
| `scripts/**` (all) | Build/seed scripts. |
| `public/logo/*` | Logo assets. |
| `.gitignore`, `.eslintrc.cjs`, `.prettierrc` | Tooling. |
| `capacitor.config.ts` | Optional app build. |

### SHOULD BE ARCHIVED (move to `/archive`)

These are useful for context or grading but not needed in the main doc flow. Moving to `/archive` keeps the repo clean while preserving them.

**Root-level .md (one-off fixes, planning, diagnostics):**

- `BIG_SIZE_JOURNEY_REDESIGN.md`
- `CANVAS_CLIPPING_FIX.md`
- `CHILD_JOURNEY_IMPROVEMENTS.md`
- `COLORFUL_EMOTION_SELECTION.md`
- `CORS_FIX_SUMMARY.md`
- `COVERAGE_MATRIX.md`
- `CREATION_HUB_REDESIGN.md`
- `DASHBOARD_HOOKS_ANALYSIS.md`
- `DASHBOARD_HOOKS_VERIFICATION.md`
- `DASHBOARD_PAGE_FIX.md`
- `DIAGNOSIS.md` (React #310 diagnosis; distinct from DIAGNOS_PROJEKT_SLUTRAPPORT)
- `EMOJI_STICKERS_IMPLEMENTATION.md`
- `EMOTION_SELECTION_VISUAL_IMPROVEMENTS.md`
- `FINAL_FIX_SUMMARY.md`
- `GAME_SCREEN_LAYOUT_FIX.md`
- `HOOK_FIXES_SUMMARY.md`
- `HOOK_ORDERING_FIX.md`
- `JOURNEY_LAYOUT_REFINEMENT.md`
- `LANDING_PAGE_VERIFICATION.md`
- `MVP_AUDIT.md`
- `NON_READING_JOURNEY_REDESIGN.md`
- `PROJEKT_SAMMANFATTNING.md` (long; overview can be merged into docs/overview.md)
- `PUBLISH_STEPS.md`
- `SAFE_HUB_IMPLEMENTATION.md`
- `VOICE_INPUT_REMOVAL.md`

**docs/ (implementation notes, hotfixes, troubleshooting):**

- `docs/48H_HOTFIXES_DELIVERY.md`
- `docs/CALM_UI_REDESIGN.md`
- `docs/CHECKIN_FIX.md`
- `docs/CHILD_JOURNEY_REDESIGN.md`
- `docs/DIST_LOGIN.md`
- `docs/DOB_REGISTRATION_DELIVERY.md`
- `docs/DRAWING_STEP_REDESIGN.md`
- `docs/ERROR_EXPLANATIONS.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/LANDING_PAGE_CTA_REDESIGN.md`
- `docs/LIGHT_SWEEP_ANIMATION.md`
- `docs/LISTEN_ENDPOINT.md`
- `docs/LOGO_ENTRANCE_ANIMATION.md`
- `docs/OFFLINE_ERROR_HANDLING.md`
- `docs/OFFLINE_QUEUE_IMPLEMENTATION.md`
- `docs/PRE_DEPLOYMENT_CHECKLIST.md`
- `docs/PWA_TROUBLESHOOTING.md`
- `docs/QUICK_FIX_SERVICE_WORKER.md`
- `docs/RIVE_SETUP_CHECKLIST.md`
- `docs/RIVE_SETUP.md`
- `docs/SIMPLIFIED_CHILD_JOURNEY_FLOW.md`
- `docs/TROUBLESHOOTING_LOGIN.md`
- `docs/TROUBLESHOOTING_SERVER_500.md`
- `docs/TROUBLESHOOTING.md`
- `docs/UX_AUDIT_48H_DEMO.md`
- `docs/UX_REDESIGN_PLAN.md`
- `docs/ai-safety.md`
- `docs/MONGODB_JSON_EXAMPLES.md`
- `docs/MONGODB_QUICK_INSERT.md`
- `docs/MONGODB_SIMPLE_GUIDE.md`
- `docs/MONGODB_INSERT_EXAMPLES.json`
- `docs/CAPACITOR_SETUP.md`

**Optional (merge into deployment then archive):**

- `docs/PRODUCTION_SETUP.md` — **Exception:** README links to it. **Keep in docs** and optionally merge content into `docs/deployment.md` later; do not archive unless README is updated.

### SAFE TO DELETE (redundant or ephemeral)

- `README-dev.md` — Development/seed guide. Content can be merged into README “Development” / “Seed” section, then delete. If you prefer to keep it, move to `archive/README-dev.md` instead.

---

## 2. UNUSED OR REDUNDANT CODE (reference only; do not delete for submission)

These are not imported by any active route in `App.tsx`. Kept in repo to avoid build breakage if routes are re-enabled; list for transparency only.

- **Server:** `server/routes/checkins-new.js` (not mounted; `checkins.js` is used). `server/routes/analytics.js` (not mounted).
- **Pages (only used by commented-out AppRoutes):** `ChildPage`, `DashboardPage`, `ParentPage`, `ProPage`, `ChildDiary`, `MePage`, `AvatarEditorPage`, `JourneyPage`, `FeelingJourney`, `DashboardPage`, plus `JourneyPage` / `FeelingJourney`.
- **Components/layout:** `GameLayout`, `AppRoutes`, `AuthenticatedAppLayout`, `AuthWrapper`, `GameLayoutWrapper`, `RequireAuth` (if unused), `Logo` (variant used by old layout), `BottomNav`, `InputArea` (used by FeelingJourney/ChildPage only).

**Recommendation:** Do not delete or move these for the submission. They do not affect the running app; removing them would require careful refactor and could break the build.

---

## 3. A. FILES TO DELETE

Only one file recommended for deletion after optional merge:

| File | Action |
|------|--------|
| `README-dev.md` | Merge seed/test-user section into README (see README “Database Configuration” or add “Development” subsection), then delete. Or move to `archive/README-dev.md` and keep README as-is. |

If you do **not** merge README-dev content into README, do **not** delete it; move to archive instead.

---

## 4. B. FILES TO MOVE TO `/archive`

Create `archive/` and move the following. Use the git commands in section 7.

**From repo root (24 files):**

- All root-level .md listed in “SHOULD BE ARCHIVED” above (e.g. `BIG_SIZE_JOURNEY_REDESIGN.md` through `VOICE_INPUT_REMOVAL.md`).

**From docs/ (35 files + 1 JSON):**

- All docs/ files listed in “SHOULD BE ARCHIVED” above, **except** `PRODUCTION_SETUP.md` (keep in docs while README links to it).

**Optional:** Move `README-dev.md` to `archive/README-dev.md` if you do not merge it into README.

---

## 5. C. FINAL RECOMMENDED FOLDER STRUCTURE

```
/
├── README.md                    # Main project description (keep)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── jest.config.cjs
├── index.html
├── capacitor.config.ts
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── docs/
│   ├── overview.md              # NEW: short project overview (merge from PROJEKT_SAMMANFATTNING + README)
│   ├── architecture.md         # NEW: tech stack + one-sentence architecture (from FINAL_TECHNICAL_AUDIT)
│   ├── testing.md              # Keep MANUAL_TESTING content; rename or merge
│   ├── accessibility.md        # Keep ACCESSIBILITY_IMPROVEMENTS; rename to accessibility.md
│   ├── deployment.md           # Keep DEPLOYMENT + PRODUCTION_SETUP merged
│   ├── DEPLOYMENT.md            # KEEP (or merge into deployment.md)
│   ├── PRODUCTION_SETUP.md      # KEEP (referenced in README)
│   ├── MANUAL_TESTING.md       # KEEP (referenced in README)
│   ├── ACCESSIBILITY_IMPROVEMENTS.md  # KEEP (or rename to accessibility.md)
│   ├── FINAL_TECHNICAL_AUDIT.md      # KEEP
│   ├── ACADEMIC_REVIEW_GRADING.md     # KEEP
│   └── DIAGNOS_PROJEKT_SLUTRAPPORT.md # KEEP
├── archive/                     # NEW: all archived .md and optional JSON
│   ├── (root-level .md files)
│   └── (docs .md files listed in section 4B)
├── public/
│   ├── logo/
│   ├── icons/
│   └── rive/
├── scripts/
├── server/
└── src/
```

**Minimal change (no new overview/architecture files):** Keep only the “MUST KEEP” docs in `docs/`, move the rest to `archive/`. Rename later if desired (e.g. `ACCESSIBILITY_IMPROVEMENTS.md` → `accessibility.md`).

**Optional new files (for clarity):**

- `docs/overview.md` — 1–2 page project overview (audience, purpose, main features); merge content from `PROJEKT_SAMMANFATTNING.md` and README.
- `docs/architecture.md` — One short page: tech stack + the one-sentence architecture from `FINAL_TECHNICAL_AUDIT.md` + optional diagram reference.
- `docs/testing.md` — Either rename `MANUAL_TESTING.md` to `testing.md` and update README link, or keep `MANUAL_TESTING.md` and add `testing.md` that links to it.
- `docs/accessibility.md` — Rename or copy `ACCESSIBILITY_IMPROVEMENTS.md` to `accessibility.md`; update any report references.
- `docs/deployment.md` — Single deployment doc: merge `DEPLOYMENT.md` + `PRODUCTION_SETUP.md`; then remove or redirect old filenames and update README.

---

## 6. D. EXACT GIT COMMANDS TO PERFORM THE CLEANUP SAFELY

Run from repository root. Adjust if you use a different branch.

```bash
# 1. Create archive directory
mkdir -p archive

# 2. Move root-level .md files to archive (except README.md)
git mv BIG_SIZE_JOURNEY_REDESIGN.md archive/
git mv CANVAS_CLIPPING_FIX.md archive/
git mv CHILD_JOURNEY_IMPROVEMENTS.md archive/
git mv COLORFUL_EMOTION_SELECTION.md archive/
git mv CORS_FIX_SUMMARY.md archive/
git mv COVERAGE_MATRIX.md archive/
git mv CREATION_HUB_REDESIGN.md archive/
git mv DASHBOARD_HOOKS_ANALYSIS.md archive/
git mv DASHBOARD_HOOKS_VERIFICATION.md archive/
git mv DASHBOARD_PAGE_FIX.md archive/
git mv DIAGNOSIS.md archive/
git mv EMOJI_STICKERS_IMPLEMENTATION.md archive/
git mv EMOTION_SELECTION_VISUAL_IMPROVEMENTS.md archive/
git mv FINAL_FIX_SUMMARY.md archive/
git mv GAME_SCREEN_LAYOUT_FIX.md archive/
git mv HOOK_FIXES_SUMMARY.md archive/
git mv HOOK_ORDERING_FIX.md archive/
git mv JOURNEY_LAYOUT_REFINEMENT.md archive/
git mv LANDING_PAGE_VERIFICATION.md archive/
git mv MVP_AUDIT.md archive/
git mv NON_READING_JOURNEY_REDESIGN.md archive/
git mv PROJEKT_SAMMANFATTNING.md archive/
git mv PUBLISH_STEPS.md archive/
git mv SAFE_HUB_IMPLEMENTATION.md archive/
git mv VOICE_INPUT_REMOVAL.md archive/

# 3. Optional: move README-dev to archive (if not merging into README)
# git mv README-dev.md archive/

# 4. Move docs/ files to archive/ (keep DEPLOYMENT, PRODUCTION_SETUP, MANUAL_TESTING, ACCESSIBILITY_IMPROVEMENTS, FINAL_TECHNICAL_AUDIT, ACADEMIC_REVIEW_GRADING, DIAGNOS_PROJEKT_SLUTRAPPORT)
git mv docs/48H_HOTFIXES_DELIVERY.md archive/
git mv docs/CALM_UI_REDESIGN.md archive/
git mv docs/CHECKIN_FIX.md archive/
git mv docs/CHILD_JOURNEY_REDESIGN.md archive/
git mv docs/DIST_LOGIN.md archive/
git mv docs/DOB_REGISTRATION_DELIVERY.md archive/
git mv docs/DRAWING_STEP_REDESIGN.md archive/
git mv docs/ERROR_EXPLANATIONS.md archive/
git mv docs/IMPLEMENTATION_STATUS.md archive/
git mv docs/LANDING_PAGE_CTA_REDESIGN.md archive/
git mv docs/LIGHT_SWEEP_ANIMATION.md archive/
git mv docs/LISTEN_ENDPOINT.md archive/
git mv docs/LOGO_ENTRANCE_ANIMATION.md archive/
git mv docs/OFFLINE_ERROR_HANDLING.md archive/
git mv docs/OFFLINE_QUEUE_IMPLEMENTATION.md archive/
git mv docs/PRE_DEPLOYMENT_CHECKLIST.md archive/
git mv docs/PWA_TROUBLESHOOTING.md archive/
git mv docs/QUICK_FIX_SERVICE_WORKER.md archive/
git mv docs/RIVE_SETUP_CHECKLIST.md archive/
git mv docs/RIVE_SETUP.md archive/
git mv docs/SIMPLIFIED_CHILD_JOURNEY_FLOW.md archive/
git mv docs/TROUBLESHOOTING_LOGIN.md archive/
git mv docs/TROUBLESHOOTING_SERVER_500.md archive/
git mv docs/TROUBLESHOOTING.md archive/
git mv docs/UX_AUDIT_48H_DEMO.md archive/
git mv docs/UX_REDESIGN_PLAN.md archive/
git mv docs/ai-safety.md archive/
git mv docs/MONGODB_JSON_EXAMPLES.md archive/
git mv docs/MONGODB_QUICK_INSERT.md archive/
git mv docs/MONGODB_SIMPLE_GUIDE.md archive/
git mv docs/MONGODB_INSERT_EXAMPLES.json archive/
git mv docs/CAPACITOR_SETUP.md archive/

# 5. Commit (do not push until you have verified build and README links)
git add archive/
git status
git commit -m "chore: archive planning and fix docs for submission cleanup"
```

**Windows (PowerShell):** Use `git mv` as above; if `mkdir -p archive` is not available, create `archive` in Explorer or use `New-Item -ItemType Directory -Force -Path archive`.

**Verification after cleanup:**

- `npm run build` succeeds.
- README links to `docs/PRODUCTION_SETUP.md` and `docs/MANUAL_TESTING.md` still work.
- `docs/DEPLOYMENT.md`, `docs/ACCESSIBILITY_IMPROVEMENTS.md`, `docs/FINAL_TECHNICAL_AUDIT.md`, `docs/ACADEMIC_REVIEW_GRADING.md`, `docs/DIAGNOS_PROJEKT_SLUTRAPPORT.md` remain in place.

---

## 7. SUMMARY

| Action | Count |
|--------|--------|
| **Delete** | 0 (or 1 if README-dev merged into README and then removed) |
| **Move to archive** | 24 root .md + 35 docs .md + 1 JSON = 60 files |
| **Keep in docs** | README, DEPLOYMENT, PRODUCTION_SETUP, MANUAL_TESTING, ACCESSIBILITY_IMPROVEMENTS, FINAL_TECHNICAL_AUDIT, ACADEMIC_REVIEW_GRADING, DIAGNOS_PROJEKT_SLUTRAPPORT |
| **Code** | No deletion or move; unused routes/components listed for reference only |

After cleanup, the repository has a clear set of docs for run, test, accessibility, deployment, and report, with the rest preserved in `archive/`.
