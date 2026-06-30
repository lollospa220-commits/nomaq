# Milestone 1 Style Mismatch and Contrast Remediation Plan

This analysis document outlines the necessary code-level adjustments to remediate the styling discrepancy between the production application (already on Light Theme) and the E2E/virtual environment (`tests/mock_app.js` and `tests/tier1_feature_coverage.test.js`), as well as fixing WCAG contrast violations in `BottomNav.tsx`.

---

## 1. Visual Specification Alignment

To transition the E2E mock/simulator environment from Legacy Dark to the new Light Theme, the following rules have been applied:
- **Backgrounds**: Transition from dark styles (`glassmorphism-dark`, opaque dark panels) to pure white (`#ffffff` or standard Tailwind background modifiers like `bg-white`, `bg-green-50`, etc.) and light glassmorphism (`glassmorphism` style from `globals.css`).
- **Texts and Icons (Inactive)**: Transition from white variants (`text-white/60`, `text-white/50`, etc.) to Anthracite Grey variants (`text-anthracite-grey`, `#1E1E24`).
- **Active Accents**: Keep electric orange (`#FF6B00`, `text-electric-orange`, `bg-electric-orange`).
- **WCAG Contrast Ratios**: Inactive nav label text contrast must meet the WCAG 4.5:1 threshold (at least `text-anthracite-grey/70`).

---

## 2. File-by-File Remediation Plan

### 2.1. `src/components/BottomNav.tsx`
* **Objective**: Improve the contrast ratio of the inactive navigation tab label. Changing `text-anthracite-grey/50` (which does not meet WCAG AA 4.5:1) to `text-anthracite-grey/70` (which passes contrast requirements).

* **Replacement Chunk**:
  * **Line Range**: 45–52
  * **Original Code**:
    ```tsx
    <span
      className={clsx(
        "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
        isActive ? "text-electric-orange" : "text-anthracite-grey/50"
      )}
    >
    ```
  * **Replacement Code**:
    ```tsx
    <span
      className={clsx(
        "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
        isActive ? "text-electric-orange" : "text-anthracite-grey/70"
      )}
    >
    ```

---

### 2.2. `src/components/__tests__/BottomNav.test.tsx`
* **Objective**: Update the unit tests to match the new contrast ratio class (`text-anthracite-grey/70`) for the inactive navigation labels.

* **Replacement Chunk 1**:
  * **Line Range**: 29–32
  * **Original Code**:
    ```tsx
        const soggiornaBtn = screen.getByTestId('nav-soggiorna');
        expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
        expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
    ```
  * **Replacement Code**:
    ```tsx
        const soggiornaBtn = screen.getByTestId('nav-soggiorna');
        expect(soggiornaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
        expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
    ```

* **Replacement Chunk 2**:
  * **Line Range**: 45–47
  * **Original Code**:
    ```tsx
        expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
        expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
      });
    ```
  * **Replacement Code**:
    ```tsx
        expect(volaVolaBtn.querySelector('svg')).toHaveClass('text-anthracite-grey/60');
        expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
      });
    ```

---

### 2.3. `tests/tier1_feature_coverage.test.js`
* **Objective**: Remediate the E2E test assertion so that it expects the light theme `glassmorphism` style on the bottom navigation container instead of `glassmorphism-dark`.

* **Replacement Chunk**:
  * **Line Range**: 15–18
  * **Original Code**:
    ```javascript
      const nav = page.querySelector('[data-testid="bottom-nav"]');
      assert.ok(nav, 'Bottom navigation container should exist');
      assert.ok(nav.classList.has('glassmorphism-dark'), 'Nav bar container should use glassmorphism-dark styling');
    ```
  * **Replacement Code**:
    ```javascript
      const nav = page.querySelector('[data-testid="bottom-nav"]');
      assert.ok(nav, 'Bottom navigation container should exist');
      assert.ok(nav.classList.has('glassmorphism'), 'Nav bar container should use glassmorphism styling');
    ```

---

### 2.4. `tests/mock_app.js`
* **Objective**: Bring the virtual simulator in complete alignment with the Light Theme specifications. This involves replacing legacy dark container classes (`glassmorphism-dark`) and text white classes (`text-white/60`, `text-white/50`, etc.) with their anthracite-grey equivalents and accessible color scales.

* **Replacement Chunk 1 (Header Section)**:
  * **Line Range**: 354–356
  * **Original Code**:
    ```javascript
        header.appendChild(new MockElement(this, 'h1', { class: 'text-2xl font-bold mb-2' }, 'Nomaq'));
        header.appendChild(new MockElement(this, 'p', { class: 'text-white/60 mb-4' }, 'Mobile-First Travel Booking'));
    ```
  * **Replacement Code**:
    ```javascript
        header.appendChild(new MockElement(this, 'h1', { class: 'text-2xl font-bold mb-2' }, 'Nomaq'));
        header.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 mb-4' }, 'Mobile-First Travel Booking'));
    ```

* **Replacement Chunk 2 (Feed Empty State)**:
  * **Line Range**: 373–376
  * **Original Code**:
    ```javascript
            feedContainer.appendChild(new MockElement(this, 'div', {
              class: 'text-white/40 text-center py-8',
              'data-testid': 'feed-empty'
            }, 'No travel options available.'));
    ```
  * **Replacement Code**:
    ```javascript
            feedContainer.appendChild(new MockElement(this, 'div', {
              class: 'text-anthracite-grey/40 text-center py-8',
              'data-testid': 'feed-empty'
            }, 'No travel options available.'));
    ```

* **Replacement Chunk 3 (Feed Item Title & Description)**:
  * **Line Range**: 393–398
  * **Original Code**:
    ```javascript
              feedCard.appendChild(new MockElement(this, 'h3', {
                class: 'text-lg font-semibold text-white truncate'
              }, item.destination));
              
              const descClass = item.description.length > 200 ? 'text-xs text-white/50 line-clamp-2' : 'text-sm text-white/70';
    ```
  * **Replacement Code**:
    ```javascript
              feedCard.appendChild(new MockElement(this, 'h3', {
                class: 'text-lg font-semibold text-anthracite-grey truncate'
              }, item.destination));
              
              const descClass = item.description.length > 200 ? 'text-xs text-anthracite-grey/50 line-clamp-2' : 'text-sm text-anthracite-grey/70';
    ```

* **Replacement Chunk 4 (Feed Item Heart Button State)**:
  * **Line Range**: 404–406
  * **Original Code**:
    ```javascript
              const isSaved = this.savedItems.has(item.id);
              const heartClass = isSaved ? 'text-electric-orange filled' : 'text-white/60';
    ```
  * **Replacement Code**:
    ```javascript
              const isSaved = this.savedItems.has(item.id);
              const heartClass = isSaved ? 'text-electric-orange filled' : 'text-anthracite-grey/60';
    ```

* **Replacement Chunk 5 (Salvati Empty State)**:
  * **Line Range**: 424–427
  * **Original Code**:
    ```javascript
            savedContainer.appendChild(new MockElement(this, 'div', {
              class: 'text-white/40 text-center py-8',
              'data-testid': 'salvati-empty'
            }, 'No saved travel routes yet. Explore the feed to add some!'));
    ```
  * **Replacement Code**:
    ```javascript
            savedContainer.appendChild(new MockElement(this, 'div', {
              class: 'text-anthracite-grey/40 text-center py-8',
              'data-testid': 'salvati-empty'
            }, 'No saved travel routes yet. Explore the feed to add some!'));
    ```

* **Replacement Chunk 6 (Saved Item Title)**:
  * **Line Range**: 438–439
  * **Original Code**:
    ```javascript
                info.appendChild(new MockElement(this, 'h4', { class: 'text-md font-semibold text-white truncate' }, item.destination));
    ```
  * **Replacement Code**:
    ```javascript
                info.appendChild(new MockElement(this, 'h4', { class: 'text-md font-semibold text-anthracite-grey truncate' }, item.destination));
    ```

* **Replacement Chunk 7 (Drops Empty State)**:
  * **Line Range**: 470–474
  * **Original Code**:
    ```javascript
          if (this.dropsHistory.length === 0) {
            historyList.appendChild(new MockElement(this, 'div', {
              class: 'text-white/40 text-center py-8',
              'data-testid': 'drops-empty'
            }, 'No price drops recorded yet.'));
    ```
  * **Replacement Code**:
    ```javascript
          if (this.dropsHistory.length === 0) {
            historyList.appendChild(new MockElement(this, 'div', {
              class: 'text-anthracite-grey/40 text-center py-8',
              'data-testid': 'drops-empty'
            }, 'No price drops recorded yet.'));
    ```

* **Replacement Chunk 8 (Drops Item Details)**:
  * **Line Range**: 482–485
  * **Original Code**:
    ```javascript
              const details = new MockElement(this, 'div');
              details.appendChild(new MockElement(this, 'span', { class: 'font-semibold text-white text-sm block' }, drop.destination));
              details.appendChild(new MockElement(this, 'span', { class: 'text-xs text-white/50' }, `Was €${drop.oldPrice} → Now €${drop.newPrice}`));
    ```
  * **Replacement Code**:
    ```javascript
              const details = new MockElement(this, 'div');
              details.appendChild(new MockElement(this, 'span', { class: 'font-semibold text-anthracite-grey text-sm block' }, drop.destination));
              details.appendChild(new MockElement(this, 'span', { class: 'text-xs text-anthracite-grey/60' }, `Was €${drop.oldPrice} → Now €${drop.newPrice}`));
    ```

* **Replacement Chunk 9 (Waitlist Heading & Paragraph)**:
  * **Line Range**: 508–511
  * **Original Code**:
    ```javascript
          
          waitlistForm.appendChild(new MockElement(this, 'h3', { class: 'text-lg font-bold text-white' }, 'Join the Drops Waitlist'));
          waitlistForm.appendChild(new MockElement(this, 'p', { class: 'text-xs text-white/60' }, 'Get notified before anyone else when prices drop.'));
    ```
  * **Replacement Code**:
    ```javascript
          
          waitlistForm.appendChild(new MockElement(this, 'h3', { class: 'text-lg font-bold text-anthracite-grey' }, 'Join the Drops Waitlist'));
          waitlistForm.appendChild(new MockElement(this, 'p', { class: 'text-xs text-anthracite-grey/60' }, 'Get notified before anyone else when prices drop.'));
    ```

* **Replacement Chunk 10 (Waitlist Input Style)**:
  * **Line Range**: 512–518
  * **Original Code**:
    ```javascript
          waitlistForm.appendChild(new MockElement(this, 'input', {
            type: 'email',
            'data-testid': 'waitlist-email',
            placeholder: 'Enter your email',
            value: this.waitlistEmail || '',
            class: 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-electric-orange'
          }));
    ```
  * **Replacement Code**:
    ```javascript
          waitlistForm.appendChild(new MockElement(this, 'input', {
            type: 'email',
            'data-testid': 'waitlist-email',
            placeholder: 'Enter your email',
            value: this.waitlistEmail || '',
            class: 'w-full bg-anthracite-grey/5 border border-anthracite-grey/10 rounded-xl px-4 py-2 text-anthracite-grey focus:outline-none focus:border-electric-orange'
          }));
    ```

* **Replacement Chunk 11 (Waitlist Success Alert - Light Accessibility)**:
  * **Line Range**: 527–530
  * **Original Code**:
    ```javascript
            waitlistForm.appendChild(new MockElement(this, 'div', {
              'data-testid': 'waitlist-success',
              class: 'bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm'
            }, `Awesome! You are on the list: ${this.waitlistEmail}`));
    ```
  * **Replacement Code**:
    ```javascript
            waitlistForm.appendChild(new MockElement(this, 'div', {
              'data-testid': 'waitlist-success',
              class: 'bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm'
            }, `Awesome! You are on the list: ${this.waitlistEmail}`));
    ```

* **Replacement Chunk 12 (Waitlist Error Alert - Light Accessibility)**:
  * **Line Range**: 539–543
  * **Original Code**:
    ```javascript
            waitlistForm.appendChild(new MockElement(this, 'div', {
              'data-testid': 'waitlist-error',
              class: 'bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm'
            }, this.waitlistError));
    ```
  * **Replacement Code**:
    ```javascript
            waitlistForm.appendChild(new MockElement(this, 'div', {
              'data-testid': 'waitlist-error',
              class: 'bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm'
            }, this.waitlistError));
    ```

* **Replacement Chunk 13 (404 Page Elements)**:
  * **Line Range**: 553–555
  * **Original Code**:
    ```javascript
          fallback.appendChild(new MockElement(this, 'h2', { class: 'text-xl font-bold text-white' }, '404 - Not Found'));
          fallback.appendChild(new MockElement(this, 'p', { class: 'text-white/60 text-sm mt-2' }, 'We cannot find the page you are looking for.'));
    ```
  * **Replacement Code**:
    ```javascript
          fallback.appendChild(new MockElement(this, 'h2', { class: 'text-xl font-bold text-anthracite-grey' }, '404 - Not Found'));
          fallback.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 text-sm mt-2' }, 'We cannot find the page you are looking for.'));
    ```

* **Replacement Chunk 14 (Toast Notification Card Background)**:
  * **Line Range**: 564–567
  * **Original Code**:
    ```javascript
            const toast = new MockElement(this, 'div', {
              'data-testid': `toast-${notif.id}`,
              class: 'glassmorphism-dark border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center'
            });
    ```
  * **Replacement Code**:
    ```javascript
            const toast = new MockElement(this, 'div', {
              'data-testid': `toast-${notif.id}`,
              class: 'glassmorphism border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center'
            });
    ```

* **Replacement Chunk 15 (Toast Message and Dismiss Button Text)**:
  * **Line Range**: 569–574
  * **Original Code**:
    ```javascript
            toast.appendChild(new MockElement(this, 'div', { class: 'text-sm text-white' }, notif.message));
            
            toast.appendChild(new MockElement(this, 'button', {
              'data-testid': `toast-dismiss-${notif.id}`,
              class: 'text-white/60 hover:text-white ml-4 text-xs font-bold'
            }, '✕'));
    ```
  * **Replacement Code**:
    ```javascript
            toast.appendChild(new MockElement(this, 'div', { class: 'text-sm text-anthracite-grey' }, notif.message));
            
            toast.appendChild(new MockElement(this, 'button', {
              'data-testid': `toast-dismiss-${notif.id}`,
              class: 'text-anthracite-grey/60 hover:text-anthracite-grey ml-4 text-xs font-bold'
            }, '✕'));
    ```

* **Replacement Chunk 16 (Navigation Bar Container Class)**:
  * **Line Range**: 581–584
  * **Original Code**:
    ```javascript
        const nav = new MockElement(this, 'nav', {
          class: 'fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe',
          'data-testid': 'bottom-nav'
        });
    ```
  * **Replacement Code**:
    ```javascript
        const nav = new MockElement(this, 'nav', {
          class: 'fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe',
          'data-testid': 'bottom-nav'
        });
    ```

* **Replacement Chunk 17 (Navigation Icon Active/Inactive Classes)**:
  * **Line Range**: 608–612
  * **Original Code**:
    ```javascript
          const icon = new MockElement(this, 'svg', {
            class: isActive 
              ? 'w-6 h-6 transition-all duration-200 text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]' 
              : 'text-white/60 hover:text-white'
          });
    ```
  * **Replacement Code**:
    ```javascript
          const icon = new MockElement(this, 'svg', {
            class: isActive 
              ? 'w-6 h-6 transition-all duration-200 text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.3)]' 
              : 'text-anthracite-grey/60 hover:text-anthracite-grey'
          });
    ```

* **Replacement Chunk 18 (Navigation Label Active/Inactive Classes - Accessible Contrast)**:
  * **Line Range**: 615–617
  * **Original Code**:
    ```javascript
          const labelSpan = new MockElement(this, 'span', {
            class: isActive ? 'text-electric-orange text-[10px] mt-1 font-medium whitespace-nowrap' : 'text-white/50 text-[10px] mt-1 font-medium whitespace-nowrap'
          }, tab.label);
    ```
  * **Replacement Code**:
    ```javascript
          const labelSpan = new MockElement(this, 'span', {
            class: isActive ? 'text-electric-orange text-[10px] mt-1 font-medium whitespace-nowrap' : 'text-anthracite-grey/70 text-[10px] mt-1 font-medium whitespace-nowrap'
          }, tab.label);
    ```
