# BRIEFING — 2026-06-30T21:45:51Z

## Mission
Analyze and propose a solution to resolve the SSR state initialization, E2E test failures, and runner.js fallback issues.

## 🔒 My Identity
- Archetype: explorer
- Roles: Teamwork explorer, read-only investigator
- Working directory: /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_explorer_m1_4
- Original parent: 76b4cad5-e05e-4847-baa2-d103acbf77bc
- Milestone: m1_4

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze and propose a solution to resolve the INTEGRITY VIOLATION reported by Forensic Auditor 1
- Network is in CODE_ONLY mode

## Current Parent
- Conversation ID: 76b4cad5-e05e-4847-baa2-d103acbf77bc
- Updated: 2026-06-30T21:45:51Z

## Investigation State
- **Explored paths**: `src/pages/index.tsx`, `src/pages/drops.tsx`, `src/pages/soggiorna.tsx`, `src/context/AppState.tsx`, `src/pages/_app.tsx`, `tests/runner.js`, `tests/driver.js`, `tests/mock_app.js`, `tests/tier1_feature_coverage.test.js`, `tests/tier2_boundary_cases.test.js`
- **Key findings**:
  1. Next.js pages were using `isMounted` state inside `Home` to conditionally render states which were loaded in `useEffect`, resulting in SSR returning default `'vola-vola'` tab and empty lists when requested via Live Mode E2E tests.
  2. Live Mode driver does not pass `waitlistError` in `buildUrl`, causing waitlist error validation tests to fail during SSR.
  3. Modified feeds (`feed` and `feed_mod` parameters) and viewports are not handled by SSR, causing layout/content assertion failures in E2E tests.
  4. Test assertions look for specific elements (`span.text-electric-orange`, specific class lists like `glassmorphism`, `filled`, `text-electric-orange`, `overflow-y-auto`, `scrollable`, etc.) that are missing in Next.js page components compared to Mock Mode.
  5. The runner fallback mechanism silently sets `TEST_MOCK=true` when the server is down.
- **Unexplored areas**: None, the entire pipeline has been fully mapped and solved.

## Key Decisions Made
- Proposed deep parsing inside `getServerSideProps` to map all query parameters and url path to state.
- Proposed updating AppStateProvider, index.tsx, and _app.tsx to accept initial values, resolving hydration issues.
- Proposed adding CSS classes to match mock simulator elements so that E2E selectors pass in Live Mode.
- Proposed failing immediately in runner.js with exit code 1 if server is unreachable in E2E mode.

## Artifact Index
- /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_explorer_m1_4/handoff.md — Handoff report summarizing the findings and proposed solution
