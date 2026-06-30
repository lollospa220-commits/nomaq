# Styling Remediation Plan Report - Milestone 1

## Executive Summary
This report presents the investigation findings and styling remediation plan for the brand design mismatch identified by the Forensic Auditor. The design system requires:
1. **Sfondo Bianco Puro** (`#ffffff` background)
2. **CTA e Pulsanti in Arancione Elettrico** (`#FF6B00`)
3. **Testi in Grigio Antracite** (`#1e1e24` / `#2e2e38`)

Our investigation found that the current implementation is using a dark theme with an anthracite background (`#121216`) and white text (`#ffffff`), which violates the design specification. Additionally, the bottom navigation navbar and pages use dark-optimized classes/styles (e.g. `glassmorphism-dark`, `text-white/60`, `text-white/50`) that would render items completely invisible or illegible on the required white background.

This document outlines the exact modifications required to achieve compliant styling, preserve accessibility, and update unit tests accordingly.

---

## 1. Global Styles Remediation (`src/styles/globals.css`)
To change the system theme from dark to light as specified by the brand rules, we propose updating the body base class and the `.glassmorphism` utility style:

### A. Body Styling Change
- **Before**:
  ```css
  body {
    background-color: #121216; /* anthracite-grey-dark */
    color: #ffffff;
    ...
  }
  ```
- **After**:
  ```css
  body {
    background-color: #ffffff; /* Sfondo Bianco Puro */
    color: #1e1e24; /* Testi in Grigio Antracite */
    ...
  }
  ```

### B. Light Glassmorphism Utility Definition
To ensure UI cards and the navbar are clearly visible on a pure white background, the `.glassmorphism` utility must be redefined with a light glass theme:
- **Before**:
  ```css
  .glassmorphism {
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  ```
- **After**:
  ```css
  .glassmorphism {
    background-color: rgba(255, 255, 255, 0.75); /* High opacity white for contrast */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(30, 30, 36, 0.08); /* Subtle dark border using Grigio Antracite (#1E1E24) */
    box-shadow: 0 4px 12px rgba(30, 30, 36, 0.05); /* Subtle shadow for depth on white background */
  }
  ```

---

## 2. Navigation Bar Redesign (`src/components/BottomNav.tsx`)
The bottom navigation bar must transition from dark glassmorphism to the newly defined light glassmorphism, and inactive buttons must be colored dark grey/anthracite to remain visible.

### A. Navbar Class Modification
- **Before**:
  ```tsx
  <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe" data-testid="bottom-nav">
  ```
- **After**:
  ```tsx
  <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe" data-testid="bottom-nav">
  ```

### B. Inactive & Active Button Styling
- **Active state**: Correctly remains `text-electric-orange` (mapped to `#FF6B00`).
- **Inactive states (Icon and Text Label)**: Changed from white tints to anthracite gray tints.
- **Before (Icon)**:
  ```tsx
  isActive 
    ? "text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" 
    : "text-white/60 hover:text-white"
  ```
- **After (Icon)**:
  ```tsx
  isActive 
    ? "text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" 
    : "text-anthracite-grey/60 hover:text-anthracite-grey"
  ```
- **Before (Label)**:
  ```tsx
  className={clsx(
    "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
    isActive ? "text-electric-orange" : "text-white/50"
  )}
  ```
- **After (Label)**:
  ```tsx
  className={clsx(
    "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
    isActive ? "text-electric-orange" : "text-anthracite-grey/50 hover:text-anthracite-grey"
  )}
  ```

---

## 3. Document Level & Index Page Styling
To fully resolve the Forensic Audit and avoid visual defects, the following files also require changes to avoid overriding global styles with dark colors or keeping invisible white text elements:

### A. Custom Document Body (`src/pages/_document.tsx`)
Currently, NextJS applies hardcoded dark tailwind utilities to the HTML body, which overrides global CSS base styles.
- **Before**:
  ```tsx
  <body className="bg-anthracite-grey-dark text-white antialiased">
  ```
- **After**:
  ```tsx
  <body className="bg-white text-anthracite-grey antialiased">
  ```

### B. Index Page Subtitle Text (`src/pages/index.tsx`)
The mobile-first travel booking description card must replace the white subtitle text.
- **Before**:
  ```tsx
  <p className="text-white/60 mb-4">Mobile-First Travel Booking</p>
  ```
- **After**:
  ```tsx
  <p className="text-anthracite-grey/60 mb-4">Mobile-First Travel Booking</p>
  ```

---

## 4. Test Suite Adaptations (`src/components/__tests__/BottomNav.test.tsx`)
To prevent test failures due to changes in CSS classes, the unit assertions must be aligned with the newly introduced brand classes:
- **Before**:
  ```typescript
  expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-white/60');
  expect(soggiornaBtn.querySelector('span')).toHaveClass('text-white/50');
  ...
  expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-white/60');
  expect(volaVolaBtn.querySelector('span')).toHaveClass('text-white/50');
  ```
- **After**:
  ```typescript
  expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
  expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
  ...
  expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
  expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
  ```

---

## 5. Verification Plan
Once the changes in the `.patch` file are applied, the implementer must run:
1. `npm run build` or `npx next build` to verify there are no compilation errors in the CSS, page pages, and component configurations.
2. If test runners (like Jest) are configured, run the test command (e.g. `npm test` or `npx jest`) to verify that the `BottomNav.test.tsx` and context test suites execute successfully.
