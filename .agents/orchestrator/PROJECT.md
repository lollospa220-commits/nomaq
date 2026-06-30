# Project: Nomaq

## Architecture
- **Framework**: React / Next.js (App Router or Pages Router, to be decided by implementer; standard Next.js typescript setup).
- **Styling**: Tailwind CSS with custom Glassmorphism components and utility classes.
- **State Management**: Client-side React Context to manage active view, saved items, and simulated price drop alert state.
- **Mocking**: Rich client-side mock data representing flights and hotels for the feed and price drop simulator.
- **Testing**: Node-based automated E2E testing framework to run opaque-box tests against the local server.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Scaffolding & Design System | Setup Next.js, configure Tailwind variables, implement basic shell and Bottom Navigation Bar. | None | PLANNED |
| M2 | Feed & View Switcher | Implement vertical scrolling inspirational feed, tab switching views (Vola Vola, Soggiorna, Profilo). | M1 | PLANNED |
| M3 | Drops & Saved Interaction | Add Save (Heart) logic, implement Saved / Drops tabs, add Debug Panel for triggering simulated price drops and visual notifications. | M2 | PLANNED |
| M4 | Waitlist Landing Page | Implement `/waitlist` route, waitlist email subscription form, social sharing UI. | M1 | PLANNED |
| M5 | E2E Integration & Phase 1 | Run E2E test suite from E2E Track, ensure 100% pass on Tiers 1-4. | M3, M4, E2E | PLANNED |
| M6 | Adversarial Hardening (Tier 5) | Identify untested paths, write and run adversarial tests, fix bugs until no gaps remain. | M5 | PLANNED |

## Interface Contracts
### Views & Navigation State
- Active Tab state: `'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo'`
- Bottom Navigation Bar MUST use exact text/labels: `Vola Vola`, `Soggiorna`, `Drops`, `Salvati`, `Profilo`.

### Drops Simulation API (client-side)
- `triggerPriceDrop(itemId: string)`: Mock function to trigger a drop for a specific route/item, adding it to drops state and displaying alert.

### Waitlist Submission
- Form submit handler: `handleSubmit(e: React.FormEvent<HTMLFormElement>)` -> prevents default, validates email, updates success state.

## Code Layout
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind variables and Glassmorphism utility
- `src/`
  - `pages/` (or `app/` depending on setup)
    - `index.tsx` (Main Web App)
    - `waitlist.tsx` (Landing Page)
  - `components/`
    - `BottomNav.tsx` - Bottom navigation bar
    - `Feed.tsx` - Vertical TikTok-style feed
    - `DebugPanel.tsx` - Trigger simulated price drops
  - `context/`
    - `AppState.tsx` - Global React context for drops and saves
  - `styles/`
    - `globals.css` - Custom styles and glassmorphism utilities
