# BRIEFING — 2026-06-30T23:44:00+02:00

## Mission
Coordinate the development of Nomaq, a high-fidelity mobile-first travel booking prototype, ensuring 100% E2E test passes and rigorous quality verification.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/orchestrator
- Original parent: parent
- Original parent conversation ID: 07508afa-fba2-4cce-a960-60adae7daa31

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/PROJECT.md
1. **Decompose**: Decompose the project into milestones (implementation track and E2E testing track) and record them in PROJECT.md.
2. **Dispatch & Execute**:
   - **Delegate**: Spawn sub-orchestrators for milestones or tracks.
3. **On failure**:
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Decompose & Plan [done]
  2. E2E Test Suite Development (Parallel Track) [in-progress]
  3. Milestone 1: Brand Design & Basic Layout [in-progress]
  4. Milestone 2: Feed & Flight/Hotel Switcher [pending]
  5. Milestone 3: Drops & Save Interaction [pending]
  6. Milestone 4: Waitlist Landing Page [pending]
  7. Final Milestone: E2E Integration, Passing, & Hardening [pending]
- **Current phase**: 2
- **Current focus**: Monitor Parallel Track Orchestrators

## 🔒 Key Constraints
- CODE_ONLY network mode: No external website/service access, no curl/wget to external URLs.
- Never write, modify, or create source code files directly.
- Never run build/test commands yourself — require workers to do so.
- Never reuse a subagent after it has delivered its handoff.
- The Forensic Auditor verdict must be CLEAN; audit is a binary veto.

## Current Parent
- Conversation ID: 07508afa-fba2-4cce-a960-60adae7daa31
- Updated: 2026-06-30T16:33:00Z

## Key Decisions Made
- Use Project Orchestrator Pattern to coordinate parallel E2E testing track and implementation track.
- Successor resumed project from crash; sent resumption messages and updated parent mapping for sub_orch_impl and sub_orch_e2e.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| E2E Testing Track Orchestrator | teamwork_preview_orchestrator | E2E Test Suite Development (Parallel Track) | in-progress | 76b4cad5-e05e-4847-baa2-d103acbf77bc |
| Implementation Track Orchestrator | teamwork_preview_orchestrator | Implementation (M1-M6) | in-progress | 28674757-992b-49a0-bb6b-239fab6df60c |

## Succession Status
- Succession required: no
- Spawn count: 2 / 16
- Pending subagents: 76b4cad5-e05e-4847-baa2-d103acbf77bc, 28674757-992b-49a0-bb6b-239fab6df60c
- Predecessor: 5b40cb5a-6843-4530-8969-85c49a63f3e4
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: 5b40cb5a-6843-4530-8969-85c49a63f3e4/task-13
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/orchestrator/PROJECT.md — Global project plan & milestones
- /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/orchestrator/progress.md — Orchestrator progress heartbeat
- /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq/.agents/orchestrator/BRIEFING.md — Persistent memory index
