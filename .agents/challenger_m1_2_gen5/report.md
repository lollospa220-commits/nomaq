# Verification Report — Milestone 1 Correctness, E2E Alignment, and Unit Test Compatibility

## Challenge Summary

**Overall risk assessment**: MEDIUM

While the unit tests and the virtual app simulator are structurally aligned with the production classes (specifically `text-anthracite-grey/70` for inactive navigation labels), running tests under a live (non-mocked) E2E environment will result in test suite failures for Feature 5 (Waitlist Validation).

---

## Challenges

### [Medium] Challenge 1: Lack of Validation Error Propagation in Live E2E Mode

- **Assumption challenged**: The E2E driver (`tests/driver.js`) can verify validation error flows when running against the live server (`TEST_MOCK=false`).
- **Attack scenario**:
  Running `node tests/runner.js` with `TEST_MOCK=false` against a live local server. During waitlist email form submission testing (e.g. empty inputs, invalid formats, or SQL injection payloads), `LiveDriver.submitWaitlist(email)` performs local validation, sets `this.waitlistError`, and triggers `this.fetchRoute('/profilo')`. However:
  1. `buildUrl()` does not serialize `this.waitlistError` into URL query parameters.
  2. The production component in `src/pages/index.tsx` does not initialize or check `queryObj.error` from server-side props during SSR.
  Consequently, the live server serves a standard page with `waitlistError = null`. When the driver parses the returned static HTML, the validation error element `[data-testid="waitlist-error"]` is missing, causing assertions to fail.
- **Blast radius**: The following 3 tests in `tests/tier2_boundary_cases.test.js` will fail:
  - `B5.1: Submitting empty email displays validation error`
  - `B5.2: Submitting invalid email formats displays error`
  - `B5.4: Form validation handles SQL-injection-like inputs safely`
- **Mitigation**:
  1. Update `tests/driver.js` `buildUrl(route)` to include `error` if `this.waitlistError` is set:
     ```javascript
     if (this.waitlistError) {
       params.error = this.waitlistError;
     }
     ```
  2. Update `src/pages/index.tsx` to initialize `waitlistError` state from query props:
     ```typescript
     const [waitlistError, setWaitlistError] = React.useState<string | null>(queryObj.error || null);
     ```

### [Low] Challenge 2: Class Shadow Value Mismatch in Mock App BottomNav

- **Assumption challenged**: Virtual app simulator classes match production style classes 100%.
- **Attack scenario**:
  - In `src/components/BottomNav.tsx`, the active icon shadow class is:
    `drop-shadow-[0_0_8px_rgba(255,107,0,0.3)]`
  - In `tests/mock_app.js`, the active icon shadow class is:
    `drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]`
- **Blast radius**: If an E2E test asserts on the exact class list of the active nav icon, it will pass in Live Mode but fail in Mock Mode (or vice versa). (Currently, E2E tests only verify `text-electric-orange` and do not check this class, so the current test suite passes).
- **Mitigation**: Update line 625 of `tests/mock_app.js` to use `0.3` instead of `0.5`:
  `drop-shadow-[0_0_8px_rgba(255,107,0,0.3)]`

### [Low] Challenge 3: Incomplete Test Dependencies and Configuration in `package.json`

- **Assumption challenged**: Unit tests in `src/components/__tests__/BottomNav.test.tsx` are runnable directly.
- **Attack scenario**:
  The unit test file relies on `@testing-library/react`, `@testing-library/jest-dom`, and `jest` frameworks. However, `package.json` does not list Jest or Testing Library dependencies in `devDependencies`, nor is there a `jest.config.js` or corresponding script in `package.json`.
- **Blast radius**: Developers cannot run the unit tests via `npm test` or `jest` directly without setting up the testing configuration manually.
- **Mitigation**: Add testing dependencies (`jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`) to `package.json` and add a `test` script.

---

## Stress Test Results

- **Unit Test Class Alignment**: `BottomNav.test.tsx` asserts `text-anthracite-grey/60` (icon) and `text-anthracite-grey/70` (label span) for inactive state $\rightarrow$ matches `BottomNav.tsx` active logic $\rightarrow$ **PASS**
- **Mock App Navigation Label Style Alignment**: `mock_app.js` renders `text-anthracite-grey/70` for inactive navigation label spans $\rightarrow$ matches `BottomNav.tsx` style $\rightarrow$ **PASS**
- **Mock App Navigation Icon Style Alignment**: `mock_app.js` renders `text-anthracite-grey/60` for inactive navigation icons $\rightarrow$ matches `BottomNav.tsx` style $\rightarrow$ **PASS**
- **E2E execution in Mock Mode**: Running `node tests/runner.js` with `TEST_MOCK=true` $\rightarrow$ Evaluates states in-memory correctly $\rightarrow$ **PASS**
- **E2E execution in Live Mode**: Running `node tests/runner.js` with `TEST_MOCK=false` $\rightarrow$ Waitlist validation assertions fail due to lack of error state propagation in SSR $\rightarrow$ **FAIL**

---

## Unchallenged Areas

- **Live Server Execution**: Command execution timed out waiting for user approval; thus E2E execution was verified through trace analysis of the code paths.
