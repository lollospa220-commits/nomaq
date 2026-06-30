# BRIEFING — 2026-06-30T21:46:29Z

## Mission
Apply the proposed SSR query state initialization and E2E runner fixes to resolve the Forensic Auditor's integrity violation verdict.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_worker_m1_5
- Original parent: 76b4cad5-e05e-4847-baa2-d103acbf77bc
- Milestone: m1_5

## 🔒 Key Constraints
- Apply the proposed SSR query state initialization and E2E runner fixes.
- Modify files in-place matching the recommendations in `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_explorer_m1_4/handoff.md`.
- DO NOT CHEAT: all implementations must be genuine. No hardcoded results, dummy facades, etc.
- Verify changes with live and mock runner tests (50 tests passing).

## Current Parent
- Conversation ID: 76b4cad5-e05e-4847-baa2-d103acbf77bc
- Updated: not yet

## Task Summary
- **What to build**: SSR Query State Initialization and E2E runner fixes.
  1. Fail tests/runner.js if live server unreachable when TEST_MOCK is not true.
  2. Driver.js builds URL with waitlistError serialized.
  3. AppStateProvider signature takes initialTab and initialSavedItems props.
  4. AppStateProvider wrapping _app.tsx receives these props.
  5. index.tsx parses query params in getServerSideProps and uses them as initialProps to initialize component states immediately, ensuring correct HTML classes and tags are outputted server-side.
- **Success criteria**: All 50 tests pass in mock mode, and all 50 tests pass in live mode (with server running). Build & start succeed.
- **Interface contracts**: `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_explorer_m1_4/handoff.md`
- **Code layout**: Root next.js app with `src/` and `tests/` directories.

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [TBD]
- **Pending issues**: [TBD]

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: [TBD]
- **Tests added/modified**: [TBD]

## Loaded Skills
- [TBD]

## Key Decisions Made
- Initializing BRIEFING.md and progress.md.

## Artifact Index
- `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/teamwork_preview_worker_m1_5/handoff.md` — Final worker handoff report.
