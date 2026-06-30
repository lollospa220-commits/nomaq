# Scope: E2E Testing Track for Nomaq

## Architecture
- **Approach**: Opaque-box, requirement-driven E2E tests.
- **Location**: All test code is located in `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/`.
- **Target**: Next.js mobile-first application (assumed to run on `http://localhost:3000`).
- **Features Inventory**:
  - **F1: Bottom Navigation Bar**: 5 sections (Vola Vola, Soggiorna, Drops, Salvati, Profilo) + view switching.
  - **F2: Inspirational Feed**: Vertical scrolling feed in Vola Vola / Soggiorna views, Glassmorphism design system.
  - **F3: Save Route**: Clicing heart/save button in feed, saved items showing in "Salvati" view.
  - **F4: Drops Simulation**: Price Drop debug toggle, UI notification, items in Drops view.
  - **F5: Waitlist Landing Page**: Email form, preventDefault onSubmit, validation, success state, "Flexa il tuo Drop" sharing.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Infrastructure & Tier 1/2 Test Suite | Design runner, setup boilerplate, write 50 tests (Tier 1 & 2) | None | IN_PROGRESS |
| 2 | Tier 3/4 Test Suite & Final Verification | Write 10 tests (Tier 3 & 4), run verification, publish TEST_READY.md | M1 | PLANNED |


## Interface Contracts
- **Test Runner Entry Point**: `npm run test:e2e` or `node tests/runner.js`
- **Application URL**: `http://localhost:3000` (configurable via `process.env.TEST_APP_URL`)
- **Waitlist URL**: `/waitlist` or `http://localhost:3000/waitlist`
- **UI Element selectors**:
  - Bottom navigation bar: `[data-testid="bottom-nav"]`
  - Nav items: `[data-testid="nav-vola-vola"]`, `[data-testid="nav-soggiorna"]`, `[data-testid="nav-drops"]`, `[data-testid="nav-salvati"]`, `[data-testid="nav-profilo"]`
  - Feed scroll container: `[data-testid="feed-container"]`
  - Feed items: `[data-testid="feed-item"]`
  - Save button: `[data-testid="save-button"]`
  - Price Drop debug toggle: `[data-testid="debug-price-drop"]`
  - Notification toast: `[data-testid="notification-toast"]`
  - Waitlist form: `[data-testid="waitlist-form"]`
  - Email input: `[data-testid="waitlist-email-input"]`
  - Waitlist submit: `[data-testid="waitlist-submit"]`
  - Waitlist success message: `[data-testid="waitlist-success"]`
  - Social share button: `[data-testid="share-button"]`
