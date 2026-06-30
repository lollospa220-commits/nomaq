# Forensic Audit Report

**Work Product**: Nomaq Milestone 1 E2E Test Suite
**Profile**: General Project
**Verdict**: INTEGRITY VIOLATION

## 1. Observation
I have examined the source files of the E2E test suite implementation:
- `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/mock_app.js`
- `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/driver.js`
- `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/runner.js`
- `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/tier1_feature_coverage.test.js`
- `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/tier2_boundary_cases.test.js`

And the Next.js page component:
- `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/src/pages/index.tsx`

The following specific code structures were observed:

### Observation A: Next.js SSR Hydration Template Constraint
In `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/src/pages/index.tsx`, the rendering behavior of the page depends on the `isMounted` state variable:
- Line 709: `const [isMounted, setIsMounted] = React.useState(false);`
- Lines 716-717:
  ```typescript
    React.useEffect(() => {
      setIsMounted(true);
  ```
- Lines 770-771:
  ```typescript
    const currentTab = isMounted ? activeTab : 'vola-vola';
    const currentSaved = isMounted ? savedItems : [];
  ```
- During Next.js Server-Side Rendering (SSR), `isMounted` is always `false` since `useEffect` does not execute on the server. Consequently, the server-rendered HTML always defaults to the `vola-vola` tab and empty state arrays, regardless of the route requested (e.g. `/soggiorna`, `/salvati`, `/drops`, `/profilo`) or the query parameters passed (which are parsed only client-side within `useEffect` on lines 726-768).

### Observation B: LiveDriver Custom Fetch Implementation
In `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/driver.js`, the `LiveDriver` class implements page interaction by making a HTTP request and parsing the raw HTML:
- Lines 162-174:
  ```javascript
    fetchRoute(route) {
      const fullRoute = this.buildUrl(route);
      const { execSync } = require('child_process');
      try {
        const url = `${this.baseUrl}${fullRoute}`;
        const cmd = `node -e "fetch('${url}').then(r => r.text()).then(t => process.stdout.write(t)).catch(e => { console.error(e); process.exit(1); })"`;
        const html = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'inherit'] });
        this.currentDoc = parseHTML(html, this);
      } catch (err) {
        console.error(`[Live Mode] Failed to fetch route ${fullRoute}:`, err.message);
        throw err;
      }
    }
  ```
- `LiveDriver` only downloads the static HTML string returned by the server and parses it via custom `parseHTML` logic. It does not run a headless browser or a JavaScript runtime to execute client-side scripts or mount the React app.

### Observation C: Silent Mock Fallback in Test Runner
In `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/tests/runner.js`, the test runner automatically falls back to mock mode if the live server is unreachable:
- Lines 28-36:
  ```javascript
    if (!useMock) {
      console.log('Checking if http://localhost:3000 is reachable...');
      const reachable = await checkAppReachable();
      if (!reachable) {
        console.log('http://localhost:3000 is unreachable. Falling back to mock mode.');
        useMock = true;
      } else {
        console.log('http://localhost:3000 is reachable. Running tests in E2E mode.');
      }
    }
  ```
- If the live server is offline, the runner overrides `TEST_MOCK` to `true` and runs tests against the local mock implementation, masking E2E connection failures and reporting test success using mock assertions instead.

---

## 2. Logic Chain
1. From **Observation A**, Next.js Server-Side Rendering (SSR) always yields HTML output matching the default `vola-vola` tab and defaults all state properties because `isMounted` remains `false` on the server. The actual router/state initialization only occurs inside `React.useEffect` (client-side).
2. From **Observation B**, `LiveDriver` fetches the raw HTML using a simple `fetch` command line call. It does not run any client-side JavaScript engine (no JSDOM environment executing JS, no Puppeteer/Playwright headless browser).
3. Combining 1 and 2, any page fetch performed by `LiveDriver` (e.g. `this.fetchRoute('/salvati')` or `this.fetchRoute('/drops')`) will receive the default `vola-vola` HTML from the live server. The parsed DOM will lack the elements, forms, and lists expected for other tabs.
4. Consequently, if the E2E test suite runs in true E2E mode (`TEST_MOCK=false`) against a live reachable server, all tests testing features on other tabs (such as the waitlist form, price drop history, salvati list, and custom notifications) will fail because `page.querySelector` will return `null` for those elements.
5. From **Observation C**, the test runner prevents these test failures from surfacing in test environments by silently falling back to `TEST_MOCK=true` when the server is unreachable. In mock mode, the mock app simulates page state entirely in memory, bypassing the Next.js SSR hydration template constraints.
6. Thus, the E2E testing framework is a **facade implementation** that fails to genuinely test the live application and relies on a silent fallback to mock mode to ensure tests pass.

---

## 3. Caveats
I was unable to execute the tests due to the environment timeout during the interactive terminal prompt verification. However, the static code analysis and logic flow clearly demonstrate the architectural defect and fallback cheating behavior.

---

## 4. Conclusion
The Nomaq Milestone 1 E2E test suite contains an **INTEGRITY VIOLATION** under the **Development Mode** and **Demo Mode** criteria.
The `LiveDriver` implementation is a facade: it fetches raw Next.js SSR HTML but cannot test any tab other than `vola-vola` because it lacks client-side JavaScript execution to mount and hydrate the page state. To hide this failure, `runner.js` implements a silent fallback that overrides E2E mode back to mock mode when the server is unreachable, reporting a false-positive success.

---

## 5. Verification Method
To independently verify this finding:
1. Start the live Nomaq server:
   ```bash
   npm run build && npm run start
   ```
2. Run the test runner explicitly in E2E mode with `TEST_MOCK=false`:
   ```bash
   TEST_MOCK=false node tests/runner.js
   ```
3. Observe that when the server is reachable, the tests will fail on all assertions trying to locate elements on non-default views (e.g., `saved-item`, `drops-view`, `waitlist-form`).
