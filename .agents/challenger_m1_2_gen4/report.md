# Verification & Challenge Report — Milestone 1 (Challenger)

## Challenge Summary

**Overall risk assessment**: CRITICAL

The Milestone 1 work product exhibits several critical misalignment issues and test failures that prevent verification and violate specifications:
1. **Broken Test Driver**: The E2E test suite cannot run in mock mode because of a `ReferenceError` (undefined variable `mockApp`) in `tests/driver.js`.
2. **Unit Test Failures**: Unit tests for `BottomNav` expect `text-anthracite-grey/70` contrast styling (matching accessibility updates), but the production component still uses `text-anthracite-grey/50`, causing unit tests to fail.
3. **Brand Design Violations**: The production app renders elements in `text-white` classes instead of `text-anthracite-grey`, directly violating Requirement R4 ("Testi in Grigio Antracite") and causing a DOM class mismatch with `tests/mock_app.js`.

---

## Challenges

### [Critical] Challenge 1: ReferenceError in E2E Test Driver (`tests/driver.js`)
- **Assumption challenged**: The test harness runs successfully in mock mode using Node's test runner.
- **Attack scenario**: Running `TEST_MOCK=true node tests/runner.js` causes the driver to crash. Line 304 in `tests/driver.js` attempts to access `mockApp.page`, but `mockApp` is not imported as an object (only `{ MockApp, MockElement }` are destructured on line 5).
- **Blast radius**: The entire E2E test suite fails to run in mock mode, rendering mock-based verification impossible.
- **Mitigation**: Update `tests/driver.js` line 5 to import the default export or destructure `page`, or define `mockApp` correctly:
  ```javascript
  const mockApp = require('./mock_app');
  const { MockApp, MockElement } = mockApp;
  ```

### [High] Challenge 2: Contrast Class Mismatch in `BottomNav`
- **Assumption challenged**: The unit tests, mock application, and production code are fully aligned on the style classes of the bottom navigation bar.
- **Attack scenario**: Running a Jest-compatible runner on `src/components/__tests__/BottomNav.test.tsx` fails. The test expects inactive tab label spans to have class `text-anthracite-grey/70` (lines 31 and 46) and `tests/mock_app.js` implements this class (line 631). However, production `src/components/BottomNav.tsx` uses `text-anthracite-grey/50` (line 69).
- **Blast radius**: Unit tests for the `BottomNav` component fail consistently. The production component does not benefit from the contrast accessibility improvement (70% opacity for Grigio Antracite text).
- **Mitigation**: Update production `src/components/BottomNav.tsx` line 69 to use `"text-anthracite-grey/70"` instead of `"text-anthracite-grey/50"`.

### [High] Challenge 3: Brand Design System Violations in `index.tsx`
- **Assumption challenged**: Production component markup uses Grigio Antracite texts according to Brand Design System Requirement R4.
- **Attack scenario**: Auditing production markup in `src/pages/index.tsx` reveals that text in the feed container, saved items, price drops history, and waitlist form are styled using `text-white/40`, `text-white/50`, `text-white/60`, and `text-white`. In contrast, the mock simulator `tests/mock_app.js` correctly implements `text-anthracite-grey` classes.
- **Blast radius**: The production UI violates the mandatory brand design system ("Testi in Grigio Antracite"). Furthermore, this creates a major class mismatch between mock E2E DOM assertions and live HTML.
- **Mitigation**: Refactor `src/pages/index.tsx` text elements to use `text-anthracite-grey` with appropriate opacities instead of `text-white`.

### [Medium] Challenge 4: Missing Jest Test Infrastructure
- **Assumption challenged**: The project has a runnable unit test configuration out-of-the-box.
- **Attack scenario**: Developers attempting to run `npm test` or verify unit tests discover there are no `jest` dependencies in `package.json` and no `jest.config.js`.
- **Blast radius**: Unit tests exist in the codebase but cannot be run through npm scripts, leading to silent regressions.
- **Mitigation**: Add `@testing-library/react`, `@testing-library/jest-dom`, `jest`, and `jest-environment-jsdom` to `package.json` devDependencies and configure a `test:unit` script.

---

## Stress Test Results

- **Run E2E tests in Mock Mode** → Expected: Suite executes and passes all 50 test cases → Actual: Crashes immediately with `ReferenceError: mockApp is not defined` → **FAIL**
- **Verify BottomNav Inactive Tab Unit Test** → Expected: ` BottomNav.test.tsx` expectation matches `BottomNav.tsx` active/inactive text styles → Actual: Test expects `text-anthracite-grey/70`, but component renders `text-anthracite-grey/50` → **FAIL**
- **Brand System Design Conformance** → Expected: Feed description, saved headers, and waitlist texts use Grigio Antracite (`text-anthracite-grey`) → Actual: They are rendered using white text (`text-white/70`, `text-white/50`, `text-white`) → **FAIL**

---

## Unchallenged Areas

- **Virtual App Simulator Business Logic** — The core click, save, and drops trigger simulations in `tests/mock_app.js` are logically consistent and feature coverage is complete (50 tests total). They were not challenged because they correctly model the requirements, but the integration layer (driver/styling) is where the failures occur.
