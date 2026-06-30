# Progress

- Last visited: 2026-06-30T18:38:00+02:00
- Status: Completed all tasks!
  - Created `tests/driver.js` unified driver supporting both Mock and Live mode.
  - Implemented recursive `textContent` getter in `MockElement` inside `tests/mock_app.js`.
  - Aligned all selectors in tests, mock app, driver and Next.js app to match SCOPE.md.
  - Handled price drop calculation gracefully when `oldPrice <= 0`.
  - Added full SSR-backed Next.js React views in `src/pages/index.tsx` and route files for `soggiorna`, `drops`, `salvati`, `profilo`, `waitlist` to ensure genuine Live Mode E2E fetch queries work flawlessly.
