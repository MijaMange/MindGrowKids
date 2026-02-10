# Repo cleanup — exact `git mv` commands

Run from repository root. Creates `archive/` and moves all non-essential markdown (and one JSON) there. **Keep README.md at root.** Keep in `docs/` only: DEPLOYMENT.md, MANUAL_TESTING.md, ACCESSIBILITY_IMPROVEMENTS.md, PRIVACY_ETHICS.md, ARCHITECTURE.md.

## 1. Create archive

```bash
mkdir archive
```

## 2. Move docs → archive (all except the 5 kept in docs/)

```bash
git mv docs/48H_HOTFIXES_DELIVERY.md archive/
git mv docs/ACADEMIC_REVIEW_GRADING.md archive/
git mv docs/ai-safety.md archive/
git mv docs/CALM_UI_REDESIGN.md archive/
git mv docs/CAPACITOR_SETUP.md archive/
git mv docs/CHECKIN_FIX.md archive/
git mv docs/CHILD_JOURNEY_REDESIGN.md archive/
git mv docs/CLEANUP_PLAN_SUBMISSION.md archive/
git mv docs/DIAGNOS_PROJEKT_SLUTRAPPORT.md archive/
git mv docs/DIST_LOGIN.md archive/
git mv docs/DOB_REGISTRATION_DELIVERY.md archive/
git mv docs/DRAWING_STEP_REDESIGN.md archive/
git mv docs/ERROR_EXPLANATIONS.md archive/
git mv docs/FINAL_TECHNICAL_AUDIT.md archive/
git mv docs/IMPLEMENTATION_STATUS.md archive/
git mv docs/LANDING_PAGE_CTA_REDESIGN.md archive/
git mv docs/LIGHT_SWEEP_ANIMATION.md archive/
git mv docs/LISTEN_ENDPOINT.md archive/
git mv docs/LOGO_ENTRANCE_ANIMATION.md archive/
git mv docs/MONGODB_INSERT_EXAMPLES.json archive/
git mv docs/MONGODB_JSON_EXAMPLES.md archive/
git mv docs/MONGODB_QUICK_INSERT.md archive/
git mv docs/MONGODB_SIMPLE_GUIDE.md archive/
git mv docs/OFFLINE_ERROR_HANDLING.md archive/
git mv docs/OFFLINE_QUEUE_IMPLEMENTATION.md archive/
git mv docs/PRE_DEPLOYMENT_CHECKLIST.md archive/
git mv docs/PRODUCTION_SETUP.md archive/
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
```

## 3. Move root-level .md → archive (do not move README.md)

```bash
git mv BIG_SIZE_JOURNEY_REDESIGN.md archive/
git mv CANVAS_CLIPPING_FIX.md archive/
git mv CHILD_JOURNEY_IMPROVEMENTS.md archive/
git mv COLORFUL_EMOTION_SELECTION.md archive/
git mv COVERAGE_MATRIX.md archive/
git mv CREATION_HUB_REDESIGN.md archive/
git mv CORS_FIX_SUMMARY.md archive/
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
git mv README-dev.md archive/
git mv SAFE_HUB_IMPLEMENTATION.md archive/
git mv VOICE_INPUT_REMOVAL.md archive/
```

## 4. Move public READMEs → archive (renamed to avoid duplicate names)

```bash
git mv public/icons/README.md archive/README-public-icons.md
git mv public/rive/README.md archive/README-public-rive.md
```

## 5. Optional: move this script to archive

```bash
git mv CLEANUP_GIT_MV_COMMANDS.md archive/
```

## 6. After running the commands

- Confirm `docs/` contains only: DEPLOYMENT.md, MANUAL_TESTING.md, ACCESSIBILITY_IMPROVEMENTS.md, PRIVACY_ETHICS.md, ARCHITECTURE.md.
- Run verification: `npm test` (see checklist below). `npm run build` currently fails due to **pre-existing** TypeScript errors in the codebase; the doc cleanup did not change any code.
- Check that README links to the five docs resolve (all five files exist in `docs/`).
