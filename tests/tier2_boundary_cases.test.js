/**
 * Tier 2 - Boundary and Corner Cases E2E Tests (exactly 25 tests, 5 per feature)
 */

const test = require('node:test');
const assert = require('node:assert');
const { page } = require('./driver');

// ==========================================
// FEATURE 1: Bottom Navigation Bar (5 tests)
// ==========================================

test('B1.1: Fast consecutive switching between tabs doesn\'t break rendering or state', () => {
  page.reset();
  const tabs = ['soggiorna', 'drops', 'salvati', 'profilo', 'vola-vola'];
  
  // Fast consecutive switching
  for (let i = 0; i < 10; i++) {
    const nextTab = tabs[i % tabs.length];
    page.clickNav(nextTab);
  }
  
  assert.strictEqual(page.activeTab, 'vola-vola', 'Active tab should match the last clicked tab');
  const activeViewEl = page.querySelector('[data-testid="active-view"]');
  assert.ok(activeViewEl.textContent.includes('vola-vola'), 'Rendered active view text should update correctly');
});

test('B1.2: Direct navigation to unknown routes handles gracefully', () => {
  page.reset();
  
  // Navigate to non-existent tab
  page.clickNav('non-existent-tab');
  
  assert.strictEqual(page.activeTab, 'not-found', 'State should move to not-found fallback');
  const fallbackEl = page.querySelector('[data-testid="not-found"]');
  assert.ok(fallbackEl, ' Graceful 404/fallback screen should be rendered');
});

test('B1.3: Resizing viewport to desktop sizes maintains mobile-first layout styling', () => {
  page.reset();
  
  // Normal mobile size
  page.resizeViewport(375, 667);
  let headerEl = page.querySelector('main > div');
  assert.ok(headerEl.classList.has('max-w-md'), 'Should have max-w-md class in mobile viewport');
  
  // Desktop size
  page.resizeViewport(1200, 800);
  headerEl = page.querySelector('main > div');
  assert.ok(headerEl.classList.has('max-w-4xl'), 'Should adapt with max-w-4xl class in desktop viewport');
});

test('B1.4: Clicking the currently active nav tab does not re-trigger initial loaders', () => {
  page.reset();
  
  // Count after first load/switch
  assert.strictEqual(page.loadersTriggeredCount, 0);
  
  page.clickNav('soggiorna');
  assert.strictEqual(page.loadersTriggeredCount, 1);
  
  // Click same tab again
  page.clickNav('soggiorna');
  assert.strictEqual(page.loadersTriggeredCount, 1, 'Loader count should not increment on clicking the active tab again');
});

test('B1.5: Navigation state is preserved when query parameters are present', () => {
  page.reset();
  
  page.setQueryParameters({ ref: 'promo_email', utm_source: 'newsletter' });
  page.clickNav('drops');
  
  assert.strictEqual(page.activeTab, 'drops');
  assert.strictEqual(page.queryParameters.ref, 'promo_email', 'Query parameters must be preserved across navigation');
  assert.strictEqual(page.queryParameters.utm_source, 'newsletter', 'Query parameters must be preserved across navigation');
});


// ==========================================
// FEATURE 2: Inspirational Feed (5 tests)
// ==========================================

test('B2.1: Feed scroll behaves correctly when feed has no items (empty state)', () => {
  page.reset();
  
  // Set feed to empty list
  page.feed = [];
  
  const feedContainer = page.querySelector('[data-testid="feed-container"]');
  assert.ok(feedContainer, 'Feed container should still render');
  
  const emptyFeedEl = page.querySelector('[data-testid="feed-empty"]');
  assert.ok(emptyFeedEl, 'Empty state element should be rendered when feed has no items');
});

test('B2.2: Feed items with missing images handle fallback gracefully', () => {
  page.reset();
  
  // Set image to null/undefined on a feed item
  page.feed[0].image = null;
  
  page.clickNav('vola-vola');
  const firstItem = page.querySelector(`[data-testid="feed-item"][data-id="${page.feed[0].id}"]`);
  const img = firstItem.querySelector('img');
  
  assert.ok(img, 'Image element should still render');
  assert.strictEqual(img.getAttribute('src'), 'fallback-placeholder.jpg', 'Image src should fallback to placeholder image');
});

test('B2.3: Very long descriptions in feed items do not break layout', () => {
  page.reset();
  
  const veryLongDesc = 'A'.repeat(500);
  page.feed[0].description = veryLongDesc;
  
  page.clickNav('vola-vola');
  const firstItem = page.querySelector(`[data-testid="feed-item"][data-id="${page.feed[0].id}"]`);
  const descParagraph = firstItem.querySelector('p');
  
  assert.ok(descParagraph, 'Description paragraph should render');
  assert.ok(descParagraph.classList.has('line-clamp-2') || descParagraph.classList.has('text-xs'), 'Layout styles should truncate or wrap long texts');
});

test('B2.4: Rapid scrolling doesn\'t crash the feed', () => {
  page.reset();
  
  // Simulate rendering/updating multiple times rapidly to mimic scroll/render triggers
  for (let i = 0; i < 20; i++) {
    page.render();
  }
  
  const feedContainer = page.querySelector('[data-testid="feed-container"]');
  assert.ok(feedContainer, 'Feed container should remain stable and render successfully');
});

test('B2.5: Feed items render correctly with special characters in destination names', () => {
  page.reset();
  
  const specialName = 'Café & Resort / Val-d\'Isère!';
  page.feed[0].destination = specialName;
  
  page.clickNav('vola-vola');
  const firstItem = page.querySelector(`[data-testid="feed-item"][data-id="${page.feed[0].id}"]`);
  const title = firstItem.querySelector('h3');
  
  assert.strictEqual(title.textContent, specialName, 'Special characters should render correctly in destination title');
});


// ==========================================
// FEATURE 3: Save Route / Heart (5 tests)
// ==========================================

test('B3.1: Saving already saved item (Unsave) removes it from "Salvati" page', () => {
  page.reset();
  const itemId = page.feed[0].id;
  
  page.saveItem(itemId);
  assert.ok(page.savedItems.has(itemId));
  
  // Unsave item
  page.unsaveItem(itemId);
  assert.ok(!page.savedItems.has(itemId), 'Item should be removed from savedItems state');
  
  page.clickNav('salvati');
  const savedItemCard = page.querySelector(`[data-testid="saved-item-${itemId}"]`);
  assert.ok(!savedItemCard, 'Item should not be visible in Salvati list');
});

test('B3.2: Saving items when the feed is empty/loading handles gracefully', () => {
  page.reset();
  page.feed = [];
  
  // Try saving a non-existent item id
  assert.doesNotThrow(() => {
    page.saveItem('non-existent-id');
  }, 'Saving non-existent item ID when feed is empty should not throw an error');
});

test('B3.3: "Salvati" page displays a friendly empty state when no items are saved', () => {
  page.reset();
  
  // Ensure no saved items
  page.savedItems.clear();
  page.clickNav('salvati');
  
  const emptyEl = page.querySelector('[data-testid="salvati-empty"]');
  assert.ok(emptyEl, 'Friendly empty state message should render');
});

test('B3.4: Unsaving all items displays the empty state on "Salvati" page', () => {
  page.reset();
  const itemId1 = page.feed[0].id;
  const itemId2 = page.feed[1].id;
  
  page.saveItem(itemId1);
  page.saveItem(itemId2);
  
  page.clickNav('salvati');
  assert.ok(page.querySelector('[data-testid="salvati-list"]'));
  
  // Click unsave buttons for both items
  const unsaveBtn1 = page.querySelector(`[data-testid="unsave-btn-${itemId1}"]`);
  const unsaveBtn2 = page.querySelector(`[data-testid="unsave-btn-${itemId2}"]`);
  
  unsaveBtn1.click();
  unsaveBtn2.click();
  
  const emptyEl = page.querySelector('[data-testid="salvati-empty"]');
  assert.ok(emptyEl, 'Salvati view should transition to empty state once all items are unsaved');
});

test('B3.5: Extremely long destination names in saved list do not overflow', () => {
  page.reset();
  
  const superLongName = 'Rome-Paris-London-Tokyo-NewYork-Berlin-Madrid-Amsterdam-Vienna-Prague-Rome-Paris-London';
  page.feed[0].destination = superLongName;
  page.saveItem(page.feed[0].id);
  
  page.clickNav('salvati');
  const savedItem = page.querySelector(`[data-testid="saved-item-${page.feed[0].id}"]`);
  const destinationEl = savedItem.querySelector('h4');
  
  assert.ok(destinationEl.classList.has('truncate'), 'Saved destination heading should contain truncate utility class');
});


// ==========================================
// FEATURE 4: Drops Simulation (5 tests)
// ==========================================

test('B4.1: Triggering price drop debug multiple times handles stacked notifications', () => {
  page.reset();
  
  page.triggerPriceDrop('flight-roma', 80);
  page.triggerPriceDrop('flight-paris', 100);
  page.triggerPriceDrop('hotel-london', 150);
  
  assert.strictEqual(page.notifications.length, 3, 'Multiple notifications should stack');
  
  const toasts = page.querySelectorAll('[data-testid="notification-toast"]');
  assert.strictEqual(toasts.length, 3, 'Exactly three toast notifications should render on top of current view');
});

test('B4.2: Price drop history displays empty state if no drops occurred', () => {
  page.reset();
  
  page.dropsHistory = [];
  page.clickNav('drops');
  
  const emptyDropsEl = page.querySelector('[data-testid="drops-empty"]');
  assert.ok(emptyDropsEl, 'Drops history list should display empty state if no drops are recorded');
});

test('B4.3: Price drop percentage/amount calculations handle extreme numbers (e.g. 99% off)', () => {
  page.reset();
  
  // Original Roma price is 120. Drop to 1 (which is ~99.16% off, rounded to 99)
  page.triggerPriceDrop('flight-roma', 1);
  
  const dropItem = page.dropsHistory[0];
  assert.strictEqual(dropItem.dropPercentage, 99, 'Percentage off should be correctly calculated to 99%');
  
  page.clickNav('drops');
  const badge = page.querySelector('[data-testid="drops-history-list"] span.text-electric-orange');
  assert.strictEqual(badge.textContent, '-99%', 'Rendered badge should show -99%');
});

test('B4.4: Notification dismiss button works and removes the toast', () => {
  page.reset();
  
  page.triggerPriceDrop('flight-roma', 90);
  const notifId = page.notifications[0].id;
  
  const dismissBtn = page.querySelector(`[data-testid="toast-dismiss-${notifId}"]`);
  assert.ok(dismissBtn, 'Dismiss button should be present inside the toast');
  
  // Click dismiss
  dismissBtn.click();
  
  assert.strictEqual(page.notifications.length, 0, 'Notification should be removed from notifications state');
  const toast = page.querySelector(`[data-testid="notification-toast"][data-id="${notifId}"]`);
  assert.ok(!toast, 'Toast element should be removed from the DOM');
});

test('B4.5: Triggering drops while in different views displays toast notification correctly', () => {
  page.reset();
  
  // Go to profile/waitlist view
  page.clickNav('profilo');
  
  // Trigger a price drop
  page.triggerPriceDrop('flight-roma', 90);
  
  // Verify toast is rendered on top of profilo view
  const toastContainer = page.querySelector('[data-testid="toast-container"]');
  assert.ok(toastContainer, 'Toast container must render on top of waitlist page/profilo view');
  
  const toast = page.querySelector('[data-testid="notification-toast"]');
  assert.ok(toast, 'Toast notification must be visible');
});


// ==========================================
// FEATURE 5: Waitlist Landing Page (5 tests)
// ==========================================

test('B5.1: Submitting empty email displays validation error', () => {
  page.reset();
  page.clickNav('profilo');
  
  // Submit with empty value
  page.submitWaitlist('');
  
  const errorEl = page.querySelector('[data-testid="waitlist-error"]');
  assert.ok(errorEl, 'Validation error should be displayed');
  assert.strictEqual(errorEl.textContent, 'Email cannot be empty');
});

test('B5.2: Submitting invalid email formats displays error', () => {
  page.reset();
  page.clickNav('profilo');
  
  const invalidEmails = ['user@', '@domain.com', 'abc', 'user@domain', 'user.domain.com'];
  
  for (const email of invalidEmails) {
    page.submitWaitlist(email);
    const errorEl = page.querySelector('[data-testid="waitlist-error"]');
    assert.ok(errorEl, `Validation error should be shown for invalid email: "${email}"`);
    assert.strictEqual(errorEl.textContent, 'Invalid email format');
  }
});

test('B5.3: Submitting email with leading/trailing spaces trims and succeeds', () => {
  page.reset();
  page.clickNav('profilo');
  
  page.submitWaitlist('   trimmed_user@nomaq.it  ');
  
  assert.ok(page.waitlistSubmitted);
  assert.strictEqual(page.waitlistEmail, 'trimmed_user@nomaq.it', 'Email should be trimmed of whitespace');
  
  const successEl = page.querySelector('[data-testid="waitlist-success"]');
  assert.ok(successEl, 'Trimmed email submission should show success message');
});

test('B5.4: Form validation handles SQL-injection-like inputs safely', () => {
  page.reset();
  page.clickNav('profilo');
  
  const sqlPayloads = ["' OR 1=1 --", "SELECT * FROM users", "admin'--", "email@domain.com'; DROP TABLE users; --"];
  
  for (const payload of sqlPayloads) {
    page.submitWaitlist(payload);
    
    // Check state is not crashed and shows error
    assert.ok(!page.waitlistSubmitted, 'SQL payload must not be marked as successfully submitted');
    const errorEl = page.querySelector('[data-testid="waitlist-error"]');
    assert.ok(errorEl, 'Should display validation error for SQL-injection characters');
  }
});

test('B5.5: Submitting waitlist multiple times with same/different email handles gracefully', () => {
  page.reset();
  page.clickNav('profilo');
  
  page.submitWaitlist('user1@nomaq.it');
  assert.strictEqual(page.waitlistEmail, 'user1@nomaq.it');
  
  // Submit again with different email
  page.submitWaitlist('user2@nomaq.it');
  assert.strictEqual(page.waitlistEmail, 'user2@nomaq.it');
  assert.strictEqual(page.waitlistSubmissions.length, 2, 'Submissions history should record both emails');
  
  const successEl = page.querySelector('[data-testid="waitlist-success"]');
  assert.ok(successEl, 'Subsequent submission should still display success message');
});
