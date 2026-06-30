# Milestone 1 Styling Remediation Plan

This report details the exact styling adjustments needed to fix the brand design alignment issues identified in the Forensic Audit. The objective is to conform to the brand design specifications: **Sfondo Bianco Puro (#ffffff)**, **Pulsanti e CTA in Arancione Elettrico (#FF6B00)**, and **Testi in Grigio Antracite (#1E1E24)**.

---

## 1. Summary of Brand Design Specifications
* **Background**: Pure White (`#ffffff`)
* **Text / Typography**: Anthracite Grey (`#1E1E24` or `#2E2E38`). The Tailwind configuration defines `'anthracite-grey'` with values:
  * `light`: `#2E2E38`
  * `DEFAULT`: `#1E1E24`
  * `dark`: `#121216`
* **Buttons / CTA (Active)**: Electric Orange (`#FF6B00`). The Tailwind configuration defines `'electric-orange'` with values:
  * `light`: `#FF8533`
  * `DEFAULT`: `#FF6B00`
  * `dark`: `#E05E00`
* **Nav Bar Background**: Light glassmorphism visible on white background.

---

## 2. Proposed Code Changes

### A. Global Styles (`src/styles/globals.css`)
We change the body background to Pure White (`#ffffff`) and the base text color to Grigio Antracite (`#1e1e24`). Additionally, we redefine `.glassmorphism` to be a light semi-transparent card visible on a white background by adjusting its opacity, adding a subtle border using the anthracite-grey brand color, and adding a soft shadow.

#### Exact Proposed Changes:
```diff
diff --git a/src/styles/globals.css b/src/styles/globals.css
--- a/src/styles/globals.css
+++ b/src/styles/globals.css
@@ -6,8 +6,8 @@
 @layer base {
   body {
-    background-color: #121216; /* anthracite-grey-dark */
-    color: #ffffff;
+    background-color: #ffffff; /* Sfondo Bianco Puro */
+    color: #1e1e24; /* Testi in Grigio Antracite */
     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
     -webkit-font-smoothing: antialiased;
     overflow-x: hidden;
   }
 }
 
 @layer utilities {
   .glassmorphism {
-    background-color: rgba(255, 255, 255, 0.08);
-    backdrop-filter: blur(16px);
-    -webkit-backdrop-filter: blur(16px);
-    border: 1px solid rgba(255, 255, 255, 0.12);
+    background-color: rgba(255, 255, 255, 0.8);
+    backdrop-filter: blur(20px);
+    -webkit-backdrop-filter: blur(20px);
+    border: 1px solid rgba(30, 30, 36, 0.08); /* border using anthracite-grey */
+    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
   }
```

---

### B. Navigation Bar Component (`src/components/BottomNav.tsx`)
We wrap the navigation bar in `.glassmorphism` (light glassmorphism style) rather than `.glassmorphism-dark`. We update inactive buttons to use Grigio Antracite with appropriate opacity (`text-anthracite-grey/60 hover:text-anthracite-grey` for icons and `text-anthracite-grey/50` for labels) so they are legible against the white page background. Active buttons retain the brand's Electric Orange styling.

#### Exact Proposed Changes:
```diff
diff --git a/src/components/BottomNav.tsx b/src/components/BottomNav.tsx
--- a/src/components/BottomNav.tsx
+++ b/src/components/BottomNav.tsx
@@ -24,3 +24,3 @@
   return (
-    <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe" data-testid="bottom-nav">
+    <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe" data-testid="bottom-nav">
       <div className="mx-auto max-w-md h-16 flex items-center justify-around px-2">
@@ -40,3 +40,3 @@
                     isActive 
                       ? "text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" 
-                      : "text-white/60 hover:text-white"
+                      : "text-anthracite-grey/60 hover:text-anthracite-grey"
                   )}
@@ -48,3 +48,3 @@
                     "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
-                    isActive ? "text-electric-orange" : "text-white/50"
+                    isActive ? "text-electric-orange" : "text-anthracite-grey/50"
                   )}
```

---

### C. Document HTML Shell (`src/pages/_document.tsx`)
The current body element in `_document.tsx` hardcodes the dark classes `bg-anthracite-grey-dark` and `text-white`. We change these to use white background and anthracite-grey text to prevent conflicts with the global styles.

#### Exact Proposed Changes:
```diff
diff --git a/src/pages/_document.tsx b/src/pages/_document.tsx
--- a/src/pages/_document.tsx
+++ b/src/pages/_document.tsx
@@ -7,3 +7,3 @@
       <Head />
-      <body className="bg-anthracite-grey-dark text-white antialiased">
+      <body className="bg-white text-anthracite-grey antialiased">
         <Main />
```

---

### D. Main Index Page (`src/pages/index.tsx`)
The index page contains a subtitle using `text-white/60`, which is invisible on a white background. We update it to use `text-anthracite-grey/60`.

#### Exact Proposed Changes:
```diff
diff --git a/src/pages/index.tsx b/src/pages/index.tsx
--- a/src/pages/index.tsx
+++ b/src/pages/index.tsx
@@ -18,3 +18,3 @@
           <h1 className="text-2xl font-bold mb-2">Nomaq</h1>
-          <p className="text-white/60 mb-4">Mobile-First Travel Booking</p>
+          <p className="text-anthracite-grey/60 mb-4">Mobile-First Travel Booking</p>
           <div className="bg-electric-orange/10 border border-electric-orange/20 text-electric-orange px-4 py-2 rounded-xl inline-block font-semibold">
```

---

### E. Navigation Test File (`src/components/__tests__/BottomNav.test.tsx`)
To keep tests green and aligned with the updated class selectors, the tests checking inactive button classes must assert `text-anthracite-grey/60` and `text-anthracite-grey/50` instead of `text-white/60` and `text-white/50`.

#### Exact Proposed Changes:
```diff
diff --git a/src/components/__tests__/BottomNav.test.tsx b/src/components/__tests__/BottomNav.test.tsx
--- a/src/components/__tests__/BottomNav.test.tsx
+++ b/src/components/__tests__/BottomNav.test.tsx
@@ -30,2 +30,2 @@
     const soggiornaBtn = screen.getByTestId('nav-soggiorna');
-    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-white/60');
-    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-white/50');
+    expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
+    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
   });
@@ -45,2 +45,2 @@
     expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-white/60');
-    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-white/50');
+    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
```

---

## 3. Verification Method
After implementation, verify the fix by checking:
1. Background and Text color match brand specifications visually.
2. Glassmorphism cards and navigation bar are visibly delineated against the white background.
3. If a test runner is configured globally or locally, run the tests to ensure `BottomNav.test.tsx` passes.
