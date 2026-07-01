/**
 * Tier 1 - Feature Coverage E2E Tests (exactly 25 tests, 5 per feature)
 */

const test = require('node:test');
const assert = require('node:assert');
const { page } = require('./driver');

// ==========================================
// FEATURE 1: Bottom Navigation Bar (5 tests)
// ==========================================

test('F1.1: Nav bar container exists with exactly 5 navigation items', () => {
  page.reset();
  const nav = page.querySelector('[data-testid="bottom-nav"]');
  assert.ok(nav, 'Bottom navigation container should exist');
  assert.ok(nav.classList.has('glassmorphism'), 'Nav bar container should use glassmorphism styling');

  const navItems = page.querySelectorAll('[data-testid^="nav-"]');
  assert.strictEqual(navItems.length, 5, 'Should contain exactly 5 navigation tab buttons');
});

test('F1.2: Nav bar contains "Vola Vola" item', () => {
  page.reset();
  const volaBtn = page.querySelector('[data-testid="nav-vola-vola"]');
  assert.ok(volaBtn, '"Vola Vola" tab button should exist');
  assert.strictEqual(volaBtn.getAttribute('aria-label'), 'Vola Vola', 'Label/Aria-label should be "Vola Vola"');
});

test('F1.3: Nav bar contains "Soggiorna" item', () => {
  page.reset();
  const soggBtn = page.querySelector('[data-testid="nav-soggiorna"]');
  assert.ok(soggBtn, '"Soggiorna" tab button should exist');
  assert.strictEqual(soggBtn.getAttribute('aria-label'), 'Soggiorna', 'Label/Aria-label should be "Soggiorna"');
});

test('F1.4: Nav bar contains "Drops" item', () => {
  page.reset();
  const dropsBtn = page.querySelector('[data-testid="nav-drops"]');
  assert.ok(dropsBtn, '"Drops" tab button should exist');
  assert.strictEqual(dropsBtn.getAttribute('aria-label'), 'Drops', 'Label/Aria-label should be "Drops"');
});

test('F1.5: Nav bar contains "Salvati" and "Profilo" items', () => {
  page.reset();
  const salvatiBtn = page.querySelector('[data-testid="nav-salvati"]');
  const profiloBtn = page.querySelector('[data-testid="nav-profilo"]');
  
  assert.ok(salvatiBtn, '"Salvati" tab button should exist');
  assert.strictEqual(salvatiBtn.getAttribute('aria-label'), 'Salvati', 'Label should be "Salvati"');
  
  assert.ok(profiloBtn, '"Profilo" tab button should exist');
  assert.strictEqual(profiloBtn.getAttribute('aria-label'), 'Profilo', 'Label should be "Profilo"');
});


// ==========================================
// FEATURE 2: Inspirational Feed (5 tests)
// ==========================================

test('F2.1: Feed container exists in "Vola Vola" and "Soggiorna" views', () => {
  page.reset();
  
  // Default view is vola-vola
  assert.strictEqual(page.activeTab, 'vola-vola');
  let feedContainer = page.querySelector('[data-testid="feed-container"]');
  assert.ok(feedContainer, 'Feed container should exist in "Vola Vola" view');

  // Switch to soggiorna
  page.clickNav('soggiorna');
  feedContainer = page.querySelector('[data-testid="feed-container"]');
  assert.ok(feedContainer, 'Feed container should exist in "Soggiorna" view');
});

test('F2.2: Feed items are scrollable', () => {
  page.reset();
  const feedContainer = page.querySelector('[data-testid="feed-container"]');
  assert.ok(feedContainer, 'Feed container should exist');
  
  // Check scroll styling classes
  const hasScrollClass = feedContainer.classList.has('overflow-y-auto') || feedContainer.classList.has('scrollable');
  assert.ok(hasScrollClass, 'Feed container must have scroll styling (overflow-y-auto or scrollable)');
});

test('F2.3: Feed items contain inspirational travel content (images/metadata)', () => {
  page.reset();
  const items = page.querySelectorAll('[data-testid="feed-item"]');
  assert.ok(items.length > 0, 'Feed should contain items');
  
  const firstItem = items[0];
  const img = firstItem.querySelector('img');
  assert.ok(img, 'Feed item should contain an image element');
  assert.ok(img.getAttribute('src'), 'Image should have a src attribute');
  assert.ok(img.getAttribute('alt'), 'Image should have an alt attribute');
  
  const title = firstItem.querySelector('h3');
  assert.ok(title, 'Feed item should contain a heading');
  assert.ok(title.textContent.length > 0, 'Heading should have destination text');
});

test('F2.4: Feed layout uses glassmorphism visual style selectors', () => {
  page.reset();
  
  const feedItem = page.querySelector('[data-testid="feed-item"]');
  assert.ok(feedItem, 'Feed item should exist');
  
  try {
    assert.ok(
      feedItem.classList.has('glassmorphism') || feedItem.classList.has('glass-card') || feedItem.classList.has('glass'),
      'Feed item should have glassmorphism visual style class'
    );
  } catch (err) {
    console.error('DIAGNOSTIC F2.4 feedItem className:', feedItem.className);
    throw err;
  }
});

test('F2.5: Bottom navigation bar is visible on top of feed', () => {
  page.reset();
  const nav = page.querySelector('[data-testid="bottom-nav"]');
  const feed = page.querySelector('[data-testid="feed-container"]');
  
  assert.ok(nav && feed, 'Both bottom nav and feed container should exist');
  const hasOnTopClass = nav.classList.has('z-50') || nav.classList.has('fixed');
  assert.ok(hasOnTopClass, 'Nav bar must be positioned fixed and on top (z-50)');
});


// ==========================================
// FEATURE 3: Save Route / Heart (5 tests)
// ==========================================

test('F3.1: Heart/Save button is present on feed items', () => {
  page.reset();
  const items = page.querySelectorAll('[data-testid="feed-item"]');
  assert.ok(items.length > 0);
  
  const saveBtn = items[0].querySelector('[data-testid="save-button"]');
  assert.ok(saveBtn, 'Save button should be present on feed item card');
});

test('F3.2: Clicking Save changes button visual state (filled heart)', () => {
  page.reset();
  const firstItemId = page.feed[0].id;
  const saveBtn = page.querySelector(`[data-testid="save-button"][data-id="${firstItemId}"]`);
  
  assert.ok(!saveBtn.classList.has('filled'), 'Button should not be in filled/saved state initially');
  
  // Click the save button
  saveBtn.click();
  
  const updatedBtn = page.querySelector(`[data-testid="save-button"][data-id="${firstItemId}"]`);
  assert.ok(updatedBtn.classList.has('filled'), 'Button should now have filled state class');
  assert.ok(updatedBtn.classList.has('text-electric-orange'), 'Button should have electric orange accent color');
});

test('F3.3: Saved item is added to "Salvati" view', () => {
  page.reset();
  const firstItemId = page.feed[0].id;
  
  // Save item
  page.saveItem(firstItemId);
  
  // Navigate to Salvati
  page.clickNav('salvati');
  
  const savedItemCard = page.querySelector(`[data-testid="saved-item-${firstItemId}"]`);
  assert.ok(savedItemCard, 'Saved item should exist in the Salvati view');
});

test('F3.4: Saved items list contains the correct mock travel data', () => {
  page.reset();
  const originalItem = page.feed[0];
  
  page.saveItem(originalItem.id);
  page.clickNav('salvati');
  
  const savedItemCard = page.querySelector(`[data-testid="saved-item-${originalItem.id}"]`);
  const destinationTitle = savedItemCard.querySelector('h4');
  
  assert.strictEqual(destinationTitle.textContent, originalItem.destination, 'Saved destination name must match original');
});

test('F3.5: Saved items persist across nav switching', () => {
  page.reset();
  const itemId = page.feed[0].id;
  
  page.saveItem(itemId);
  page.clickNav('salvati');
  assert.ok(page.querySelector(`[data-testid="saved-item-${itemId}"]`));
  
  // Navigate back to Feed and then to Salvati again
  page.clickNav('vola-vola');
  page.clickNav('salvati');
  
  const savedItemCard = page.querySelector(`[data-testid="saved-item-${itemId}"]`);
  assert.ok(savedItemCard, 'Saved item must persist after switching tabs back and forth');
});


// ==========================================
// FEATURE 4: Drops Simulation (5 tests)
// ==========================================

test('F4.1: Drops view lists price drop history', () => {
  page.reset();
  page.clickNav('drops');
  
  const historyList = page.querySelector('[data-testid="drops-history-list"]');
  assert.ok(historyList, 'Drops history list container should exist in Drops tab');
});

test('F4.2: UI contains a debug/simulate price drop toggle/button', () => {
  page.reset();
  page.clickNav('drops');
  
  const simulateBtn = page.querySelector('[data-testid="debug-price-drop"]');
  assert.ok(simulateBtn, 'Simulate Price Drop button should exist');
  assert.ok(simulateBtn.classList.has('bg-electric-orange'), 'Simulate button should have electric orange brand styling');
});

test('F4.3: Clicking debug button triggers a visual notification/toast', () => {
  page.reset();
  page.clickNav('drops');
  
  const simulateBtn = page.querySelector('[data-testid="debug-price-drop"]');
  simulateBtn.click();
  
  const toastContainer = page.querySelector('[data-testid="toast-container"]');
  assert.ok(toastContainer, 'Toast container should appear in the DOM');
  
  const toasts = page.querySelectorAll('[data-testid="notification-toast"]');
  assert.ok(toasts.length > 0, 'At least one notification toast element should exist');
});

test('F4.4: Visual notification toast contains price drop information', () => {
  page.reset();
  
  // Trigger a price drop manually to check toast content
  page.triggerPriceDrop('flight-roma', 90);
  
  const toast = page.querySelector('[data-testid="notification-toast"]');
  assert.ok(toast, 'Toast notification should be visible');
  assert.ok(toast.textContent.includes('Roma'), 'Toast should contain destination name Roma');
  assert.ok(toast.textContent.includes('€90'), 'Toast should show the new price');
  assert.ok(toast.textContent.includes('25% off'), 'Toast should display correct calculation (120 -> 90 is 25% off)');
});

test('F4.5: Price drop notification updates the badge/count on the Drops tab', () => {
  page.reset();
  
  let badge = page.querySelector('[data-testid="drops-badge"]');
  assert.ok(!badge, 'No badge should be shown on Drops tab when there are no active notifications');
  
  page.triggerPriceDrop('flight-roma', 90);
  
  badge = page.querySelector('[data-testid="drops-badge"]');
  assert.ok(badge, 'Notification badge should now be visible on Drops tab');
  assert.strictEqual(badge.textContent, '1', 'Badge count should show exactly 1 active notification');
});


// ==========================================
// FEATURE 5: Waitlist Landing Page (5 tests)
// ==========================================

test('F5.1: Landing page contains email waitlist form', () => {
  page.reset();
  page.clickNav('profilo');
  
  const waitlistForm = page.querySelector('[data-testid="waitlist-form"]');
  assert.ok(waitlistForm, 'Waitlist form should be present on waitlist/profile page');
});

test('F5.2: Form has an input of type="email"', () => {
  page.reset();
  page.clickNav('profilo');
  
  const emailInput = page.querySelector('input[type="email"]');
  assert.ok(emailInput, 'Form should contain a type="email" input');
  assert.strictEqual(emailInput.getAttribute('data-testid'), 'waitlist-email-input', 'Email input should have correct data-testid');
});

test('F5.3: Form has a submit button', () => {
  page.reset();
  page.clickNav('profilo');
  
  const submitBtn = page.querySelector('[data-testid="waitlist-submit"]');
  assert.ok(submitBtn, 'Waitlist form should contain a submit button');
});

test('F5.4: Submitting a valid email displays success message', () => {
  page.reset();
  page.clickNav('profilo');
  
  const emailInput = page.querySelector('[data-testid="waitlist-email-input"]');
  emailInput.value = 'testuser@nomaq.it';
  
  const submitBtn = page.querySelector('[data-testid="waitlist-submit"]');
  submitBtn.click();
  
  const successMsg = page.querySelector('[data-testid="waitlist-success"]');
  assert.ok(successMsg, 'Success message should exist after submitting valid email');
  assert.ok(successMsg.textContent.includes('testuser@nomaq.it'), 'Success message should mirror submitted email');
});

test('F5.5: Landing page has a "Flexa il tuo Drop" social share button', () => {
  page.reset();
  page.clickNav('profilo');
  
  page.submitWaitlist('testuser@nomaq.it');
  
  const flexBtn = page.querySelector('[data-testid="share-button"]');
  assert.ok(flexBtn, '"Flexa il tuo Drop" share button should be present upon waitlist success');
});
