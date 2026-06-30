# Styling Remediation Report - Milestone 1

## Overview
This report details the styling remediation plan to address the brand design integrity violations reported by the Forensic Auditor. The brand specifications require a light theme layout ("Sfondo Bianco Puro, Pulsanti e CTA in Arancione Elettrico, Testi in Grigio Antracite"), while the previous implementation used a dark theme layout.

---

## 1. Summary of Identified Violations
Based on the Forensic Audit Report and codebase analysis:
- **`src/styles/globals.css`**: The body background color was set to `#121216` (anthracite-grey-dark) instead of Pure White (`#ffffff`), and the text color was set to `#ffffff` instead of Grigio Antracite. Additionally, `.glassmorphism` was optimized for a dark background (low opacity white background/border) and `.glassmorphism-dark` was used for the navigation bar.
- **`src/pages/_document.tsx`**: The document body template explicitly defined Tailwind classes `bg-anthracite-grey-dark text-white`, which override any CSS `body` element rules.
- **`src/components/BottomNav.tsx`**: The navbar container used the class `glassmorphism-dark`, and the inactive buttons used `text-white/60 hover:text-white` and `text-white/50`, making them invisible on a white background.
- **`src/pages/index.tsx`**: The card component used `text-white/60` for description text, which would become unreadable on a light background.
- **`src/components/__tests__/BottomNav.test.tsx`**: Unit tests hardcoded expectations checking for `text-white/60` and `text-white/50` for inactive navigation buttons. These need to be updated to match the new theme classes to prevent test failures.

---

## 2. Proposed Remediation Plan (Exact Code Changes)

### A. Fixes for `src/styles/globals.css`
Modify `globals.css` to define a Pure White background, Anthracite Grey body text, and update `.glassmorphism` to be a light glassmorphism style clearly visible on white backgrounds.

```diff
<<<<
@layer base {
  body {
    background-color: #121216; /* anthracite-grey-dark */
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
}

@layer utilities {
  .glassmorphism {
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
====
@layer base {
  body {
    background-color: #ffffff; /* Sfondo Bianco Puro */
    color: #1e1e24; /* Testi in Grigio Antracite */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
}

@layer utilities {
  .glassmorphism {
    background-color: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(30, 30, 36, 0.08);
    box-shadow: 0 -4px 20px rgba(30, 30, 36, 0.04);
  }
>>>>
```

### B. Fixes for `src/pages/_document.tsx`
Update the `body` tag attributes in Next.js Custom Document to support the light theme:

```diff
<<<<
      <body className="bg-anthracite-grey-dark text-white antialiased">
====
      <body className="bg-white text-anthracite-grey antialiased">
>>>>
```

### C. Redesign of `src/components/BottomNav.tsx`
1. Replace `glassmorphism-dark` with `glassmorphism` for the navigation bar background.
2. Replace white button colors for inactive tabs with `anthracite-grey` based utility classes.
3. Active state will continue using `text-electric-orange` and drop shadow.

```diff
<<<<
    <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe" data-testid="bottom-nav">
      <div className="mx-auto max-w-md h-16 flex items-center justify-around px-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={label}
              data-testid={`nav-${id}`}
            >
              <div className="relative flex flex-col items-center">
                <Icon
                  className={clsx(
                    "w-6 h-6 transition-all duration-200",
                    isActive 
                      ? "text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" 
                      : "text-white/60 hover:text-white"
                  )}
                />
                <span
                  className={clsx(
                    "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
                    isActive ? "text-electric-orange" : "text-white/50"
                  )}
                >
====
    <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe" data-testid="bottom-nav">
      <div className="mx-auto max-w-md h-16 flex items-center justify-around px-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={label}
              data-testid={`nav-${id}`}
            >
              <div className="relative flex flex-col items-center">
                <Icon
                  className={clsx(
                    "w-6 h-6 transition-all duration-200",
                    isActive 
                      ? "text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.3)]" 
                      : "text-anthracite-grey/60 hover:text-anthracite-grey"
                  )}
                />
                <span
                  className={clsx(
                    "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
                    isActive ? "text-electric-orange" : "text-anthracite-grey/50"
                  )}
                >
>>>>
```

### D. Fixes for `src/pages/index.tsx`
Update index page descriptive text from white/60 to anthracite-grey/60.

```diff
<<<<
          <h1 className="text-2xl font-bold mb-2">Nomaq</h1>
          <p className="text-white/60 mb-4">Mobile-First Travel Booking</p>
====
          <h1 className="text-2xl font-bold mb-2">Nomaq</h1>
          <p className="text-anthracite-grey/60 mb-4">Mobile-First Travel Booking</p>
>>>>
```

### E. Fixes for `src/components/__tests__/BottomNav.test.tsx`
Update the assertions in unit tests to match the new Tailwind text classes for inactive buttons.

```diff
<<<<
  test('initial active tab is vola-vola', () => {
    renderWithProvider(<BottomNav />);
    
    const volaVolaBtn = screen.getByTestId('nav-vola-vola');
    expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-electric-orange');
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-electric-orange');

    const soggiornaBtn = screen.getByTestId('nav-soggiorna');
    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-white/60');
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-white/50');
  });

  test('switches active state correctly on click', () => {
    renderWithProvider(<BottomNav />);

    const soggiornaBtn = screen.getByTestId('nav-soggiorna');
    const volaVolaBtn = screen.getByTestId('nav-vola-vola');

    fireEvent.click(soggiornaBtn);

    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-electric-orange');
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-electric-orange');

    expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-white/60');
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-white/50');
  });
====
  test('initial active tab is vola-vola', () => {
    renderWithProvider(<BottomNav />);
    
    const volaVolaBtn = screen.getByTestId('nav-vola-vola');
    expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-electric-orange');
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-electric-orange');

    const soggiornaBtn = screen.getByTestId('nav-soggiorna');
    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
  });

  test('switches active state correctly on click', () => {
    renderWithProvider(<BottomNav />);

    const soggiornaBtn = screen.getByTestId('nav-soggiorna');
    const volaVolaBtn = screen.getByTestId('nav-vola-vola');

    fireEvent.click(soggiornaBtn);

    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-electric-orange');
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-electric-orange');

    expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
  });
>>>>
```

---

## 3. Verification Method
To verify the remediation:
1. Apply the diff patch or rewrite the designated files as shown.
2. Run build step: `npm run build`
3. Run test suites: `npm test` (if set up) or test using `jest` directly `npx jest src/components/__tests__/BottomNav.test.tsx` to confirm the test suite passes.
4. Launch the application in dev mode (`npm run dev`) and inspect the bottom navigation bar manually to verify visibility on a white background.
