## 2026-06-30T12:17:13Z
You are teamwork_preview_worker. Your working directory is /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_worker_m1_2.
Initialize your progress.md and BRIEFING.md first.

Your mission is to address the feedback from the E2E Test Reviewer for Nomaq Milestone 1:

1. Fix Facade E2E Mode (Integrity Violation):
   - Create a unified driver tests/driver.js. Both test files (tier1_feature_coverage.test.js and tier2_boundary_cases.test.js) must import the page/driver from tests/driver.js instead of importing tests/mock_app.js directly.
   - If process.env.TEST_MOCK === 'false', the driver must operate in Live Mode. It should use Node's built-in `fetch` to request pages from the live app (default http://localhost:3000) and verify that the actual HTML response contains the expected elements, attributes, text, and structure.
   - For simulated client-side interactions in Live Mode (like clicking a nav bar icon), the driver should fetch the corresponding subroute (e.g. clicking waitlist goes to /waitlist).
   - If process.env.TEST_MOCK === 'true', the driver should use the in-memory simulator engine in tests/mock_app.js.

2. Fix Correctness Bug in Mock App (Finding 2):
   - In tests/mock_app.js, implement a recursive `textContent` getter in the `MockElement` class. The getter must return the concatenated textContent of itself and all of its descendants so that queries like `toast.textContent.includes('Roma')` work properly when the text is inside a child element.

3. Fix Selector Mismatches (Finding 3):
   - Align all selectors in tests/mock_app.js, tests/driver.js, and all test files to match the EXACT data-testid contracts in SCOPE.md:
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

4. Fix Robustness Stress Case (Adversarial review):
   - In tests/mock_app.js, ensure price drop percent calculations handle oldPrice = 0 gracefully without division by zero/NaN.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verify your changes by running `TEST_MOCK=true node tests/runner.js` in the nomaq directory and verify that all 50 tests pass successfully.
Save your handoff report to /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_worker_m1_2/handoff.md and report back with the path and result details.
