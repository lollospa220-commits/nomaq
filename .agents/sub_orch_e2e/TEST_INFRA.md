# E2E Test Infra: Nomaq

## Test Philosophy
- **Opaque-box and Requirement-driven**: Tests interact with the application solely through its public interface (HTTP responses, DOM elements, and simulated user actions). No imports of the application source code.
- **Progressive Testability**: Verification mechanisms start from the simplest possible checks (e.g. checking status codes and DOM structure) before verifying complex client-side state.
- **Robustness**: Include negative test cases (invalid email formats, missing elements) to ensure the application handles failures gracefully without crashing.

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Bottom Navigation Bar | R1 / Acceptance Criteria | 5 | 5 | ✓ | ✓ |
| 2 | Inspirational Feed | R1 / R4 / Design System | 5 | 5 | ✓ | ✓ |
| 3 | Save Route / Heart | R2 / Acceptance Criteria | 5 | 5 | ✓ | ✓ |
| 4 | Drops Simulation | R2 / Acceptance Criteria | 5 | 5 | ✓ | ✓ |
| 5 | Waitlist Landing Page | R3 / Acceptance Criteria | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Language**: JavaScript (Node.js).
- **Test Framework**: Node.js built-in `node:test` and `node:assert` module, or a custom lightweight E2E assertion runner to avoid external package dependencies that require internet access.
- **Target URL**: Configurable via `process.env.TEST_APP_URL` (default: `http://localhost:3000`).
- **Mock Fallback**: If the app is not running or not yet built, the test runner can run in a mock environment (e.g., against mock responses or static simulated DOM) to verify the assertions and structure.

## Test Case Design (Methodology)

### Tier 1 - Feature Coverage (>=5 per feature)
Happy-path tests verifying the primary functionalities of each feature in isolation.
- **Bottom Navigation**:
  1. Nav bar container exists with exactly 5 navigation items.
  2. Nav bar contains "Vola Vola" item.
  3. Nav bar contains "Soggiorna" item.
  4. Nav bar contains "Drops" item.
  5. Nav bar contains "Salvati" and "Profilo" items.
- **Inspirational Feed**:
  1. Feed container exists in "Vola Vola" and "Soggiorna" views.
  2. Feed items are scrollable.
  3. Feed items contain inspirational travel content (images/metadata).
  4. Feed layout uses glassmorphism visual style selectors.
  5. Bottom navigation bar is visible on top of feed.
- **Save Route**:
  1. Heart/Save button is present on feed items.
  2. Clicking Save changes button visual state (filled heart).
  3. Saved item is added to "Salvati" view.
  4. Saved items list contains the correct mock travel data.
  5. Saved items persist across nav switching.
- **Drops Simulation**:
  1. Drops view lists price drop history.
  2. UI contains a debug/simulate price drop toggle/button.
  3. Clicking debug button triggers a visual notification/toast.
  4. Visual notification toast contains price drop information.
  5. Price drop notification updates the badge/count on the Drops tab.
- **Waitlist Landing Page**:
  1. Landing page contains email waitlist form.
  2. Form has an input of type="email".
  3. Form has a submit button.
  4. Submitting a valid email displays success message.
  5. Landing page has a "Flexa il tuo Drop" social share button.

### Tier 2 - Boundary & Corner Cases (>=5 per feature)
- **Bottom Navigation**:
  1. Fast consecutive switching between tabs doesn't break rendering or state.
  2. Direct navigation to unknown routes handles gracefully.
  3. Resizing viewport to desktop sizes maintains mobile-first layout styling.
  4. Clicking the currently active nav tab does not re-trigger initial loaders.
  5. Navigation state is preserved when query parameters are present.
- **Inspirational Feed**:
  1. Feed scroll behaves correctly when feed has no items (empty state).
  2. Feed items with missing images handle fallback gracefully.
  3. Very long descriptions in feed items do not break layout.
  4. Rapid scrolling doesn't crash the feed.
  5. Feed items render correctly with special characters in destination names.
- **Save Route**:
  1. Saving already saved item (Unsave) removes it from "Salvati" page.
  2. Saving items when the feed is empty/loading handles gracefully.
  3. "Salvati" page displays a friendly empty state when no items are saved.
  4. Unsaving all items displays the empty state on "Salvati" page.
  5. Extremely long destination names in saved list do not overflow.
- **Drops Simulation**:
  1. Triggering price drop debug multiple times handles stacked notifications.
  2. Price drop history displays empty state if no drops occurred.
  3. Price drop percentage/amount calculations handle extreme numbers (e.g. 99% off).
  4. Notification dismiss button works and removes the toast.
  5. Triggering drops while in different views displays toast notification correctly.
- **Waitlist Landing Page**:
  1. Submitting empty email displays validation error.
  2. Submitting invalid email formats (e.g. `user@`, `@domain.com`, `abc`) displays error.
  3. Submitting email with leading/trailing spaces trims and succeeds.
  4. Form validation handles SQL-injection-like inputs safely.
  5. Submitting waitlist multiple times with same/different email handles gracefully.

### Tier 3 - Cross-Feature Combinations (>=5 tests)
- **C1**: Saving an item in feed -> triggering price drop on that item -> checking "Salvati" and "Drops" updates.
- **C2**: Navigating between "Salvati" and "Feed" repeatedly -> verified saved item persists in "Salvati".
- **C3**: Submitting waitlist -> navigating to main feed -> verifying waitlist success state is cleared/separate.
- **C4**: Triggering a price drop notification -> clicking the notification -> navigating to the "Drops" view automatically.
- **C5**: Navigating to Profilo -> saving items -> verifying profile metrics/saved counts update accordingly.

### Tier 4 - Real-World Application Scenarios (>=5 tests)
- **S1: Complete User Booking Journey**: User opens app, scrolls feed, saves a flight, triggers drops, sees price drop notification, views price drop details.
- **S2: User Pre-Launch Engagement**: User visits waitlist page, enters valid email, joins waitlist, sees success state, shares "Flexa il tuo Drop".
- **S3: Saved Travel List Cleanup**: User saves multiple items, switches tabs, reviews list in Salvati, unsaves some items, verifies remaining list.
- **S4: Alert-Driven Booking Experience**: User configures a route, leaves the app page, triggers price drop, returns to app via notification, verifies drops list is populated.
- **S5: Visual Branding & Design System Verification**: Full audit of layout elements to ensure Anthracite Grey, Electric Orange, and Glassmorphism design constraints are met.

## Coverage Thresholds
- **Tier 1 Feature Coverage**: 100% (25/25 tests).
- **Tier 2 Boundary Cases**: 100% (25/25 tests).
- **Tier 3 Cross-Feature**: 100% (5/5 tests).
- **Tier 4 Real-World**: 100% (5/5 tests).
- **Total E2E test cases**: 60 test cases.
