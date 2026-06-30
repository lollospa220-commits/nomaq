# Milestone 1 Review & Stress-Test Report

This report provides an independent quality and adversarial review of the brand styling, accessibility, and E2E alignment fixes for Milestone 1.

---

## Review Summary

**Verdict**: **REQUEST_CHANGES**

### Summary of Findings
While the transition to a pure white (#ffffff) background and light glassmorphism style has been initiated, there are critical regressions and mismatches:
1. **Critical Test Suite Crash**: `tests/driver.js` contains a `ReferenceError` (`mockApp` is not defined) that prevents the mock E2E test runner from executing.
2. **WCAG AA Contrast Failures in Production**: 
   - The production `src/components/BottomNav.tsx` uses `text-anthracite-grey/50` for inactive labels, failing WCAG AA contrast requirements (3.3:1 ratio). It should use `text-anthracite-grey/70` (5.6:1 ratio) as specified.
   - The production `src/pages/index.tsx` contains numerous elements utilizing dark theme classes (`text-white`, `text-white/70`, `text-white/50`) rendered on light white glassmorphism cards, making text completely illegible.
3. **E2E Style Mismatch**: Production code uses `text-anthracite-grey/50` for bottom navigation text labels, while `tests/mock_app.js` uses `text-anthracite-grey/70`, leading to misalignment.

---

## Verified Claims

| Feature / Verification Item | Status | Verification Method | Details / Findings |
|---|---|---|---|
| **1. Sfondo Bianco Puro** | **PASS** | Checked `src/styles/globals.css` | Body background is correctly set to `#ffffff` and text is set to `#1e1e24`. |
| **2. BottomNav.tsx styling** | **FAIL** | Checked `src/components/BottomNav.tsx` | Uses `glassmorphism` and active state `text-electric-orange`. Inactive state uses `text-anthracite-grey/60` (icon) and `text-anthracite-grey/50` (label). Mismatches `/70` requirement and fails contrast. |
| **3. BottomNav E2E Selectors** | **PASS** | Checked `src/components/BottomNav.tsx` | `data-testid="bottom-nav"` and `data-testid={`nav-${id}`}` are present. |
| **4. E2E Test Selectors** | **PASS** | Checked `tests/tier1_feature_coverage.test.js` | Asserts `glassmorphism` instead of `glassmorphism-dark`. |
| **5. mock_app.js Alignment** | **PASS** | Checked `tests/mock_app.js` | Updated to use `glassmorphism` and `text-anthracite-grey/...` classes (`/60` and `/70`). |

---

## Detailed Findings

### [Critical] Finding 1: ReferenceError in Test Driver
- **Where**: `tests/driver.js`, line 304
- **Why**: The file attempts to access `mockApp.page`, but `mockApp` is not imported as a namespace (it was destructured as `const { MockApp, MockElement } = require('./mock_app')` on line 5). This throws a `ReferenceError: mockApp is not defined` and crashes the test run when `TEST_MOCK=true`.
- **Suggestion**: Change line 5 of `tests/driver.js` to import the full module or `page` directly, or change line 304 to use the exported `page`. E.g., `const mockApp = require('./mock_app');` or restructure the imports.

### [Major] Finding 2: WCAG AA Accessibility Failures in BottomNav.tsx
- **Where**: `src/components/BottomNav.tsx`, line 69
- **Why**: Inactive text labels use `text-anthracite-grey/50`. Against a white/light-glassmorphism background, `#1e1e24` at 50% opacity yields `#8f8f92`, which has a contrast ratio of **3.3:1**. This fails the WCAG 2.1 AA requirement of **4.5:1** for normal text.
- **Suggestion**: Update `text-anthracite-grey/50` to `text-anthracite-grey/70`. At 70% opacity, the resulting color is `#626266`, which yields a **5.6:1** contrast ratio, passing WCAG AA. This also resolves the alignment discrepancy with `tests/mock_app.js` which uses `/70`.

### [Major] Finding 3: Legibility and Contrast Regressions in src/pages/index.tsx
- **Where**: `src/pages/index.tsx`, lines 121, 133, 134, 149, 160, 178, 185, 186, 199, 200, 201
- **Why**: The main page transitioned to a light glassmorphism card styling but retained dark theme text classes (`text-white`, `text-white/70`, `text-white/50`, `text-white/60`). This results in white text on a translucent light-white background, rendering the text illegible.
- **Suggestion**: Replace `text-white`, `text-white/70`, `text-white/50`, and `text-white/60` classes inside glassmorphism elements with `text-anthracite-grey`, `text-anthracite-grey/70`, `text-anthracite-grey/60`, and `text-anthracite-grey/50` respectively.

---

## Adversarial Challenge Report

**Overall risk assessment**: **HIGH**

### Challenges

#### [Critical] Challenge 1: Broken Test Setup in Mock Mode
- **Assumption challenged**: The test suite can run successfully offline or as a fallback mock environment.
- **Attack scenario**: When the backend server is not running, the runner falls back to mock mode. The mock mode runner immediately crashes due to `ReferenceError: mockApp is not defined`, giving zero test coverage feedback.
- **Mitigation**: Standardize test driver imports.

#### [High] Challenge 2: Readability under daylight/bright environments
- **Assumption challenged**: Light themes are readable without proper contrast alignment.
- **Attack scenario**: A user trying to navigate the app on a mobile device under bright sunlight will not be able to read the travel options (titles, descriptions, waitlist form) because they are styled with white text over a light translucent glassmorphism background.
- **Mitigation**: Convert all text in glassmorphism components from `text-white` to `text-anthracite-grey`.

---

## Unverified Items
- None. All requested verification points and codebases have been audited.
