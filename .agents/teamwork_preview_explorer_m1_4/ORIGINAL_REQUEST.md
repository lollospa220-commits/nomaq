## 2026-06-30T21:43:24Z

You are teamwork_preview_explorer. Your working directory is /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_explorer_m1_4.
Initialize your progress.md and BRIEFING.md first.

Your mission is to analyze and propose a solution to resolve the INTEGRITY VIOLATION reported by Forensic Auditor 1.

Auditor Evidence Report:
1. LiveDriver is a facade: When TEST_MOCK='false', LiveDriver fetches the raw server-side rendered HTML from http://localhost:3000 but does not execute client-side JS. In src/pages/index.tsx, the React state (activeTab, savedItems, drops, waitlist) is initialized/mounted client-side inside React.useEffect (controlled by isMounted state). Because useEffect does not execute during Next.js SSR, the server always returns the default 'vola-vola' tab with empty lists. Thus, any Live Mode E2E test querying elements on other tabs (e.g. Salvati, Drops, Profilo/Waitlist) receives empty/default HTML and fails.
2. Cheating Fallback: The runner.js silently overrides TEST_MOCK to true and falls back to running the mock simulator when the server is unreachable.

Objectives:
1. Propose how to update src/pages/index.tsx and other subpages (soggiorna, drops, salvati, profilo, waitlist) to initialize state on the server itself via `getServerSideProps` using query parameters (which are already passed by LiveDriver).
2. Propose how to rewrite the rendering logic in the React components to use this server-initialized state (e.g. props.initialTab) directly during server rendering rather than conditionally forcing defaults when isMounted is false. Propose how to avoid hydration mismatches.
3. Propose how to rewrite tests/runner.js to fail immediately (exit code 1) instead of falling back to mock mode if the server is unreachable when running in E2E mode (TEST_MOCK='false' or by default when checking server presence).

Write your findings to a handoff report at /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_explorer_m1_4/handoff.md and report back with the path and result details.
