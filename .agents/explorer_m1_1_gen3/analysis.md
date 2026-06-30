# Step-by-Step Remediation Plan: Milestone 1 Styling Mismatch

This document presents the detailed, step-by-step remediation plan to fix the styling and test mismatch in Milestone 1. The goal is to bring the virtual simulator (`tests/mock_app.js`), E2E test suite (`tests/tier1_feature_coverage.test.js`), unit tests (`src/components/__tests__/BottomNav.test.tsx`), and the actual component (`src/components/BottomNav.tsx`) to complete alignment under the **Light Theme** design system specification (Sfondo Bianco Puro, electric-orange active elements, anthracite-grey text/inactive elements, WCAG 4.5:1 contrast requirements).

---

## 1. Production Code Remediation

### File: `src/components/BottomNav.tsx`
* **Goal**: Improve contrast ratio of inactive labels to meet WCAG 4.5:1 requirements by changing the color modifier from `text-anthracite-grey/50` to `text-anthracite-grey/70`.

#### **Proposed Change**
**Target Range**: Lines 47-49
**Before**:
```tsx
                  className={clsx(
                    "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
                    isActive ? "text-electric-orange" : "text-anthracite-grey/50"
                  )}
```
**After**:
```tsx
                  className={clsx(
                    "text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap",
                    isActive ? "text-electric-orange" : "text-anthracite-grey/70"
                  )}
```

---

## 2. Unit Test Suite Alignment

### File: `src/components/__tests__/BottomNav.test.tsx`
* **Goal**: Update unit test assertions to match the updated inactive label style (`text-anthracite-grey/70`).

#### **Proposed Change 1**
**Target Range**: Line 31
**Before**:
```tsx
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
```
**After**:
```tsx
    expect(soggiornaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
```

#### **Proposed Change 2**
**Target Range**: Line 46
**Before**:
```tsx
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/50');
```
**After**:
```tsx
    expect(volaVolaBtn.querySelector('span')).toHaveClass('text-anthracite-grey/70');
```

---

## 3. E2E Test Suite Remediation

### File: `tests/tier1_feature_coverage.test.js`
* **Goal**: Update the test container style assertion from the dark theme class (`glassmorphism-dark`) to the light theme class (`glassmorphism`).

#### **Proposed Change**
**Target Range**: Lines 15-18
**Before**:
```javascript
  const nav = page.querySelector('[data-testid="bottom-nav"]');
  assert.ok(nav, 'Bottom navigation container should exist');
  assert.ok(nav.classList.has('glassmorphism-dark'), 'Nav bar container should use glassmorphism-dark styling');
```
**After**:
```javascript
  const nav = page.querySelector('[data-testid="bottom-nav"]');
  assert.ok(nav, 'Bottom navigation container should exist');
  assert.ok(nav.classList.has('glassmorphism'), 'Nav bar container should use glassmorphism styling');
```

---

## 4. Virtual Simulator Remediation

### File: `tests/mock_app.js`
* **Goal**: Align the mock DOM simulator structure with the Light Theme. Replace legacy dark styling (`glassmorphism-dark`, `text-white/60`, `text-white/50`, etc.) with light theme classes (`glassmorphism`, `text-anthracite-grey/...`) and match the updated WCAG-conforming BottomNav labels (`text-anthracite-grey/70`).

#### **Proposed Change 1 (Sub-header text)**
**Target Range**: Line 355
**Before**:
```javascript
    header.appendChild(new MockElement(this, 'p', { class: 'text-white/60 mb-4' }, 'Mobile-First Travel Booking'));
```
**After**:
```javascript
    header.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 mb-4' }, 'Mobile-First Travel Booking'));
```

#### **Proposed Change 2 (Feed empty state text)**
**Target Range**: Lines 373-376
**Before**:
```javascript
        feedContainer.appendChild(new MockElement(this, 'div', {
          class: 'text-white/40 text-center py-8',
          'data-testid': 'feed-empty'
        }, 'No travel options available.'));
```
**After**:
```javascript
        feedContainer.appendChild(new MockElement(this, 'div', {
          class: 'text-anthracite-grey/40 text-center py-8',
          'data-testid': 'feed-empty'
        }, 'No travel options available.'));
```

#### **Proposed Change 3 (Card heading text)**
**Target Range**: Lines 393-395
**Before**:
```javascript
          feedCard.appendChild(new MockElement(this, 'h3', {
            class: 'text-lg font-semibold text-white truncate'
          }, item.destination));
```
**After**:
```javascript
          feedCard.appendChild(new MockElement(this, 'h3', {
            class: 'text-lg font-semibold text-anthracite-grey truncate'
          }, item.destination));
```

#### **Proposed Change 4 (Card description text)**
**Target Range**: Line 397
**Before**:
```javascript
          const descClass = item.description.length > 200 ? 'text-xs text-white/50 line-clamp-2' : 'text-sm text-white/70';
```
**After**:
```javascript
          const descClass = item.description.length > 200 ? 'text-xs text-anthracite-grey/50 line-clamp-2' : 'text-sm text-anthracite-grey/70';
```

#### **Proposed Change 5 (Card heart inactive state text)**
**Target Range**: Line 405
**Before**:
```javascript
          const heartClass = isSaved ? 'text-electric-orange filled' : 'text-white/60';
```
**After**:
```javascript
          const heartClass = isSaved ? 'text-electric-orange filled' : 'text-anthracite-grey/60';
```

#### **Proposed Change 6 (Saved empty state text)**
**Target Range**: Lines 424-427
**Before**:
```javascript
        savedContainer.appendChild(new MockElement(this, 'div', {
          class: 'text-white/40 text-center py-8',
          'data-testid': 'salvati-empty'
        }, 'No saved travel routes yet. Explore the feed to add some!'));
```
**After**:
```javascript
        savedContainer.appendChild(new MockElement(this, 'div', {
          class: 'text-anthracite-grey/40 text-center py-8',
          'data-testid': 'salvati-empty'
        }, 'No saved travel routes yet. Explore the feed to add some!'));
```

#### **Proposed Change 7 (Saved card title text)**
**Target Range**: Line 438
**Before**:
```javascript
            info.appendChild(new MockElement(this, 'h4', { class: 'text-md font-semibold text-white truncate' }, item.destination));
```
**After**:
```javascript
            info.appendChild(new MockElement(this, 'h4', { class: 'text-md font-semibold text-anthracite-grey truncate' }, item.destination));
```

#### **Proposed Change 8 (Drops view empty state text)**
**Target Range**: Lines 471-474
**Before**:
```javascript
        historyList.appendChild(new MockElement(this, 'div', {
          class: 'text-white/40 text-center py-8',
          'data-testid': 'drops-empty'
        }, 'No price drops recorded yet.'));
```
**After**:
```javascript
        historyList.appendChild(new MockElement(this, 'div', {
          class: 'text-anthracite-grey/40 text-center py-8',
          'data-testid': 'drops-empty'
        }, 'No price drops recorded yet.'));
```

#### **Proposed Change 9 (Drops history card destination and metadata text)**
**Target Range**: Lines 483-484
**Before**:
```javascript
          details.appendChild(new MockElement(this, 'span', { class: 'font-semibold text-white text-sm block' }, drop.destination));
          details.appendChild(new MockElement(this, 'span', { class: 'text-xs text-white/50' }, `Was €${drop.oldPrice} → Now €${drop.newPrice}`));
```
**After**:
```javascript
          details.appendChild(new MockElement(this, 'span', { class: 'font-semibold text-anthracite-grey text-sm block' }, drop.destination));
          details.appendChild(new MockElement(this, 'span', { class: 'text-xs text-anthracite-grey/50' }, `Was €${drop.oldPrice} → Now €${drop.newPrice}`));
```

#### **Proposed Change 10 (Waitlist form texts)**
**Target Range**: Lines 509-510
**Before**:
```javascript
      waitlistForm.appendChild(new MockElement(this, 'h3', { class: 'text-lg font-bold text-white' }, 'Join the Drops Waitlist'));
      waitlistForm.appendChild(new MockElement(this, 'p', { class: 'text-xs text-white/60' }, 'Get notified before anyone else when prices drop.'));
```
**After**:
```javascript
      waitlistForm.appendChild(new MockElement(this, 'h3', { class: 'text-lg font-bold text-anthracite-grey' }, 'Join the Drops Waitlist'));
      waitlistForm.appendChild(new MockElement(this, 'p', { class: 'text-xs text-anthracite-grey/60' }, 'Get notified before anyone else when prices drop.'));
```

#### **Proposed Change 11 (Waitlist input field styling)**
**Target Range**: Lines 512-518
**Before**:
```javascript
      waitlistForm.appendChild(new MockElement(this, 'input', {
        type: 'email',
        'data-testid': 'waitlist-email',
        placeholder: 'Enter your email',
        value: this.waitlistEmail || '',
        class: 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-electric-orange'
      }));
```
**After**:
```javascript
      waitlistForm.appendChild(new MockElement(this, 'input', {
        type: 'email',
        'data-testid': 'waitlist-email',
        placeholder: 'Enter your email',
        value: this.waitlistEmail || '',
        class: 'w-full bg-anthracite-grey/5 border border-anthracite-grey/20 rounded-xl px-4 py-2 text-anthracite-grey focus:outline-none focus:border-electric-orange'
      }));
```

#### **Proposed Change 12 (Waitlist success and error messages contrast improvements)**
**Target Range**: Lines 527-543
**Before**:
```javascript
      if (this.waitlistSubmitted) {
        waitlistForm.appendChild(new MockElement(this, 'div', {
          'data-testid': 'waitlist-success',
          class: 'bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm'
        }, `Awesome! You are on the list: ${this.waitlistEmail}`));
        
        waitlistForm.appendChild(new MockElement(this, 'button', {
          'data-testid': 'flexa-drop-btn',
          class: 'w-full border border-electric-orange text-electric-orange py-2 rounded-xl font-semibold mt-2'
        }, 'Flexa il tuo Drop'));
      }
      
      if (this.waitlistError) {
        waitlistForm.appendChild(new MockElement(this, 'div', {
          'data-testid': 'waitlist-error',
          class: 'bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm'
        }, this.waitlistError));
      }
```
**After**:
```javascript
      if (this.waitlistSubmitted) {
        waitlistForm.appendChild(new MockElement(this, 'div', {
          'data-testid': 'waitlist-success',
          class: 'bg-green-500/20 border border-green-500/30 text-green-700 p-3 rounded-lg text-sm'
        }, `Awesome! You are on the list: ${this.waitlistEmail}`));
        
        waitlistForm.appendChild(new MockElement(this, 'button', {
          'data-testid': 'flexa-drop-btn',
          class: 'w-full border border-electric-orange text-electric-orange py-2 rounded-xl font-semibold mt-2'
        }, 'Flexa il tuo Drop'));
      }
      
      if (this.waitlistError) {
        waitlistForm.appendChild(new MockElement(this, 'div', {
          'data-testid': 'waitlist-error',
          class: 'bg-red-500/20 border border-red-500/30 text-red-700 p-3 rounded-lg text-sm'
        }, this.waitlistError));
      }
```

#### **Proposed Change 13 (Fallback 404 views styling)**
**Target Range**: Lines 548-556
**Before**:
```javascript
      const fallback = new MockElement(this, 'div', {
        'data-testid': 'not-found',
        class: 'glassmorphism p-6 rounded-xl text-center mt-6 w-full'
      });
      fallback.appendChild(new MockElement(this, 'h2', { class: 'text-xl font-bold text-white' }, '404 - Not Found'));
      fallback.appendChild(new MockElement(this, 'p', { class: 'text-white/60 text-sm mt-2' }, 'We cannot find the page you are looking for.'));
```
**After**:
```javascript
      const fallback = new MockElement(this, 'div', {
        'data-testid': 'not-found',
        class: 'glassmorphism p-6 rounded-xl text-center mt-6 w-full'
      });
      fallback.appendChild(new MockElement(this, 'h2', { class: 'text-xl font-bold text-anthracite-grey' }, '404 - Not Found'));
      fallback.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 text-sm mt-2' }, 'We cannot find the page you are looking for.'));
```

#### **Proposed Change 14 (Toast notifications container and texts)**
**Target Range**: Lines 564-574
**Before**:
```javascript
        const toast = new MockElement(this, 'div', {
          'data-testid': `toast-${notif.id}`,
          class: 'glassmorphism-dark border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center'
        });
        
        toast.appendChild(new MockElement(this, 'div', { class: 'text-sm text-white' }, notif.message));
        
        toast.appendChild(new MockElement(this, 'button', {
          'data-testid': `toast-dismiss-${notif.id}`,
          class: 'text-white/60 hover:text-white ml-4 text-xs font-bold'
        }, '✕'));
```
**After**:
```javascript
        const toast = new MockElement(this, 'div', {
          'data-testid': `toast-${notif.id}`,
          class: 'glassmorphism border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center'
        });
        
        toast.appendChild(new MockElement(this, 'div', { class: 'text-sm text-anthracite-grey' }, notif.message));
        
        toast.appendChild(new MockElement(this, 'button', {
          'data-testid': `toast-dismiss-${notif.id}`,
          class: 'text-anthracite-grey/60 hover:text-anthracite-grey ml-4 text-xs font-bold'
        }, '✕'));
```

#### **Proposed Change 15 (Main bottom-nav wrapper class)**
**Target Range**: Lines 581-584
**Before**:
```javascript
    const nav = new MockElement(this, 'nav', {
      class: 'fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe',
      'data-testid': 'bottom-nav'
    });
```
**After**:
```javascript
    const nav = new MockElement(this, 'nav', {
      class: 'fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe',
      'data-testid': 'bottom-nav'
    });
```

#### **Proposed Change 16 (Nav bar inactive icon class)**
**Target Range**: Lines 608-612
**Before**:
```javascript
      const icon = new MockElement(this, 'svg', {
        class: isActive 
          ? 'w-6 h-6 transition-all duration-200 text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]' 
          : 'text-white/60 hover:text-white'
      });
```
**After**:
```javascript
      const icon = new MockElement(this, 'svg', {
        class: isActive 
          ? 'w-6 h-6 transition-all duration-200 text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]' 
          : 'text-anthracite-grey/60 hover:text-anthracite-grey'
      });
```

#### **Proposed Change 17 (Nav bar inactive label class - updated for WCAG 4.5:1 contrast)**
**Target Range**: Lines 615-617
**Before**:
```javascript
      const labelSpan = new MockElement(this, 'span', {
        class: isActive ? 'text-electric-orange text-[10px] mt-1 font-medium whitespace-nowrap' : 'text-white/50 text-[10px] mt-1 font-medium whitespace-nowrap'
      }, tab.label);
```
**After**:
```javascript
      const labelSpan = new MockElement(this, 'span', {
        class: isActive ? 'text-electric-orange text-[10px] mt-1 font-medium whitespace-nowrap' : 'text-anthracite-grey/70 text-[10px] mt-1 font-medium whitespace-nowrap'
      }, tab.label);
```

---

## 5. Globals CSS Status Check
* **File**: `src/styles/globals.css`
* **Status**: **NO CHANGES REQUIRED**. The file already defines `.glassmorphism` correctly for the light theme and has completely removed any legacy `.glassmorphism-dark` utility classes.
