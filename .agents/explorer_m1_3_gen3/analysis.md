# Brand Styling and Test Mismatch Remediation Plan (Milestone 1)

This document provides a comprehensive, step-by-step remediation plan to align the virtual simulator (`tests/mock_app.js`), E2E test suite (`tests/tier1_feature_coverage.test.js`), and unit tests with the newly adopted Light Theme styling guidelines. Additionally, it addresses the contrast ratio requirement for inactive labels in the navigation bar (`src/components/BottomNav.tsx`) to conform to WCAG 4.5:1 standards.

---

## 1. Summary of Findings

- **Production Styles (`src/styles/globals.css`)**: Complies with the Light Theme specification. Standard background is Pure White (`#ffffff`), base text color is Anthracite Grey (`#1e1e24`), and light glassmorphism style is declared via `.glassmorphism` (`background-color: rgba(255, 255, 255, 0.75)`). No legacy dark classes exist here.
- **E2E Simulator (`tests/mock_app.js`)**: Contains legacy dark-theme classes (`glassmorphism-dark`, `text-white/60`, `text-white/50`, etc.) hardcoded in simulated elements to pass stale test suites.
- **E2E Test Suite (`tests/tier1_feature_coverage.test.js`)**: Specifically asserts the presence of the legacy `.glassmorphism-dark` class on the simulated navigation container.
- **Production Navigation Bar (`src/components/BottomNav.tsx`)**: Inactive tab labels are styled with `text-anthracite-grey/50`, which fails to meet the WCAG 4.5:1 minimum contrast ratio requirement on white pages.
- **React Unit Tests (`src/components/__tests__/BottomNav.test.tsx`)**: Assert the usage of `text-anthracite-grey/50` for inactive labels, and must be updated to align with the new WCAG contrast-compliant class (`text-anthracite-grey/70`).

---

## 2. Step-by-Step Remediation Plan

### Step 1: Update production navigation bar contrast (`src/components/BottomNav.tsx`)
Modify inactive labels from `text-anthracite-grey/50` to `text-anthracite-grey/70` to satisfy WCAG contrast requirements.

* **File**: `src/components/BottomNav.tsx`
* **Change Area**: Line 48-49

**Before:**
```tsx
48:                     isActive ? "text-electric-orange" : "text-anthracite-grey/50"
```

**After:**
```tsx
48:                     isActive ? "text-electric-orange" : "text-anthracite-grey/70"
```

---

### Step 2: Update unit test assertions (`src/components/__tests__/BottomNav.test.tsx`)
Align unit test assertions with the contrast-adjusted class `text-anthracite-grey/70`.

* **File**: `src/components/__tests__/BottomNav.test.tsx`
* **Change Area**: Lines 31 and 46

**Before (Line 31):**
```tsx
31:     expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
```

**After (Line 31):**
```tsx
31:     expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
```

**Before (Line 46):**
```tsx
46:     expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
```

**After (Line 46):**
```tsx
46:     expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
```

---

### Step 3: Align virtual simulator layout/styles with Light Theme (`tests/mock_app.js`)
Replace legacy dark-theme selectors (`glassmorphism-dark`, `text-white/*`) with light-theme palette counterparts (`glassmorphism`, `text-anthracite-grey/*`).

* **File**: `tests/mock_app.js`

#### Update 3.1: Header subtitle class (Line 355)
**Before:**
```javascript
355:   header.appendChild(new MockElement(this, 'p', { class: 'text-white/60 mb-4' }, 'Mobile-First Travel Booking'));
```
**After:**
```javascript
355:   header.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 mb-4' }, 'Mobile-First Travel Booking'));
```

#### Update 3.2: Empty feed layout text (Lines 373-375)
**Before:**
```javascript
373:         feedContainer.appendChild(new MockElement(this, 'div', {
374:           class: 'text-white/40 text-center py-8',
375:           'data-testid': 'feed-empty'
376:         }, 'No travel options available.'));
```
**After:**
```javascript
373:         feedContainer.appendChild(new MockElement(this, 'div', {
374:           class: 'text-anthracite-grey/40 text-center py-8',
375:           'data-testid': 'feed-empty'
376:         }, 'No travel options available.'));
```

#### Update 3.3: Feed item title text (Line 394)
**Before:**
```javascript
394:             class: 'text-lg font-semibold text-white truncate'
```
**After:**
```javascript
394:             class: 'text-lg font-semibold text-anthracite-grey truncate'
```

#### Update 3.4: Feed item description text (Line 397)
**Before:**
```javascript
397:           const descClass = item.description.length > 200 ? 'text-xs text-white/50 line-clamp-2' : 'text-sm text-white/70';
```
**After:**
```javascript
397:           const descClass = item.description.length > 200 ? 'text-xs text-anthracite-grey/50 line-clamp-2' : 'text-sm text-anthracite-grey/70';
```

#### Update 3.5: Heart/Save button inactive state (Line 405)
**Before:**
```javascript
405:           const heartClass = isSaved ? 'text-electric-orange filled' : 'text-white/60';
```
**After:**
```javascript
405:           const heartClass = isSaved ? 'text-electric-orange filled' : 'text-anthracite-grey/60';
```

#### Update 3.6: Saved routes empty layout text (Lines 424-426)
**Before:**
```javascript
424:         savedContainer.appendChild(new MockElement(this, 'div', {
425:           class: 'text-white/40 text-center py-8',
426:           'data-testid': 'salvati-empty'
427:         }, 'No saved travel routes yet. Explore the feed to add some!'));
```
**After:**
```javascript
424:         savedContainer.appendChild(new MockElement(this, 'div', {
425:           class: 'text-anthracite-grey/40 text-center py-8',
426:           'data-testid': 'salvati-empty'
427:         }, 'No saved travel routes yet. Explore the feed to add some!'));
```

#### Update 3.7: Saved route item destination text (Line 438)
**Before:**
```javascript
438:             info.appendChild(new MockElement(this, 'h4', { class: 'text-md font-semibold text-white truncate' }, item.destination));
```
**After:**
```javascript
438:             info.appendChild(new MockElement(this, 'h4', { class: 'text-md font-semibold text-anthracite-grey truncate' }, item.destination));
```

#### Update 3.8: Drops view empty layout text (Lines 471-473)
**Before:**
```javascript
471:         historyList.appendChild(new MockElement(this, 'div', {
472:           class: 'text-white/40 text-center py-8',
473:           'data-testid': 'drops-empty'
474:         }, 'No price drops recorded yet.'));
```
**After:**
```javascript
471:         historyList.appendChild(new MockElement(this, 'div', {
472:           class: 'text-anthracite-grey/40 text-center py-8',
473:           'data-testid': 'drops-empty'
474:         }, 'No price drops recorded yet.'));
```

#### Update 3.9: Drop history destination text (Line 483)
**Before:**
```javascript
483:           details.appendChild(new MockElement(this, 'span', { class: 'font-semibold text-white text-sm block' }, drop.destination));
```
**After:**
```javascript
483:           details.appendChild(new MockElement(this, 'span', { class: 'font-semibold text-anthracite-grey text-sm block' }, drop.destination));
```

#### Update 3.10: Drop history old/new price description text (Line 484)
**Before:**
```javascript
484:           details.appendChild(new MockElement(this, 'span', { class: 'text-xs text-white/50' }, `Was €${drop.oldPrice} → Now €${drop.newPrice}`));
```
**After:**
```javascript
484:           details.appendChild(new MockElement(this, 'span', { class: 'text-xs text-anthracite-grey/50' }, `Was €${drop.oldPrice} → Now €${drop.newPrice}`));
```

#### Update 3.11: Waitlist form header text (Line 509)
**Before:**
```javascript
509:       waitlistForm.appendChild(new MockElement(this, 'h3', { class: 'text-lg font-bold text-white' }, 'Join the Drops Waitlist'));
```
**After:**
```javascript
509:       waitlistForm.appendChild(new MockElement(this, 'h3', { class: 'text-lg font-bold text-anthracite-grey' }, 'Join the Drops Waitlist'));
```

#### Update 3.12: Waitlist form description text (Line 510)
**Before:**
```javascript
510:       waitlistForm.appendChild(new MockElement(this, 'p', { class: 'text-xs text-white/60' }, 'Get notified before anyone else when prices drop.'));
```
**After:**
```javascript
510:       waitlistForm.appendChild(new MockElement(this, 'p', { class: 'text-xs text-anthracite-grey/60' }, 'Get notified before anyone else when prices drop.'));
```

#### Update 3.13: Waitlist input box container styling (Line 517)
**Before:**
```javascript
517:         class: 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-electric-orange'
```
**After:**
```javascript
517:         class: 'w-full bg-white border border-anthracite-grey/20 rounded-xl px-4 py-2 text-anthracite-grey focus:outline-none focus:border-electric-orange'
```

#### Update 3.14: Fallback 404 header text (Line 553)
**Before:**
```javascript
553:       fallback.appendChild(new MockElement(this, 'h2', { class: 'text-xl font-bold text-white' }, '404 - Not Found'));
```
**After:**
```javascript
553:       fallback.appendChild(new MockElement(this, 'h2', { class: 'text-xl font-bold text-anthracite-grey' }, '404 - Not Found'));
```

#### Update 3.15: Fallback 404 description text (Line 554)
**Before:**
```javascript
554:       fallback.appendChild(new MockElement(this, 'p', { class: 'text-white/60 text-sm mt-2' }, 'We cannot find the page you are looking for.'));
```
**After:**
```javascript
554:       fallback.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 text-sm mt-2' }, 'We cannot find the page you are looking for.'));
```

#### Update 3.16: Toast notification background class (Line 566)
**Before:**
```javascript
566:           class: 'glassmorphism-dark border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center'
```
**After:**
```javascript
566:           class: 'glassmorphism border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center'
```

#### Update 3.17: Toast notification text (Line 569)
**Before:**
```javascript
569:         toast.appendChild(new MockElement(this, 'div', { class: 'text-sm text-white' }, notif.message));
```
**After:**
```javascript
569:         toast.appendChild(new MockElement(this, 'div', { class: 'text-sm text-anthracite-grey' }, notif.message));
```

#### Update 3.18: Toast notification dismiss button (Line 573)
**Before:**
```javascript
573:           class: 'text-white/60 hover:text-white ml-4 text-xs font-bold'
```
**After:**
```javascript
573:           class: 'text-anthracite-grey/60 hover:text-anthracite-grey ml-4 text-xs font-bold'
```

#### Update 3.19: Navigation Bar container style class (Line 582)
**Before:**
```javascript
582:       class: 'fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe',
```
**After:**
```javascript
582:       class: 'fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe',
```

#### Update 3.20: Navigation Bar item icon styles (Line 611)
**Before:**
```javascript
611:           : 'text-white/60 hover:text-white'
```
**After:**
```javascript
611:           : 'text-anthracite-grey/60 hover:text-anthracite-grey'
```

#### Update 3.21: Navigation Bar item label style classes (Line 616)
**Before:**
```javascript
616:         class: isActive ? 'text-electric-orange text-[10px] mt-1 font-medium whitespace-nowrap' : 'text-white/50 text-[10px] mt-1 font-medium whitespace-nowrap'
```
**After:**
```javascript
616:         class: isActive ? 'text-electric-orange text-[10px] mt-1 font-medium whitespace-nowrap' : 'text-anthracite-grey/70 text-[10px] mt-1 font-medium whitespace-nowrap'
```

---

### Step 4: Fix E2E test suite container assertion (`tests/tier1_feature_coverage.test.js`)
Assert on light-theme class `.glassmorphism` instead of legacy `.glassmorphism-dark` on the simulated bottom navigation bar container.

* **File**: `tests/tier1_feature_coverage.test.js`
* **Change Area**: Line 17

**Before:**
```javascript
17:   assert.ok(nav.classList.has('glassmorphism-dark'), 'Nav bar container should use glassmorphism-dark styling');
```

**After:**
```javascript
17:   assert.ok(nav.classList.has('glassmorphism'), 'Nav bar container should use glassmorphism styling');
```

---

## 3. Verification Method

Once implemented, the changes can be validated using:

1. **Unit Test Suite**:
   Ensure React component unit tests pass to verify markup structures:
   ```bash
   npm test
   ```
2. **E2E Test Suite**:
   Run the Node.js E2E test suite to verify correct simulation rendering:
   ```bash
   node --test tests/tier1_feature_coverage.test.js
   ```
