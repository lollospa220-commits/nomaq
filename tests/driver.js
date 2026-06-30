/**
 * Unified Test Driver for Nomaq E2E tests
 */

const mockApp = require('./mock_app');
const { MockApp, MockElement } = mockApp;

function parseHTML(htmlString, appInstance) {
  const root = new MockElement(appInstance, 'DIV', { 'data-testid': 'document-root' });
  const stack = [root];

  // Regex to tokenize HTML tags vs text
  const tokenRegex = /(<[^>]+>)|([^<]+)/g;
  let match;

  while ((match = tokenRegex.exec(htmlString)) !== null) {
    if (match[1]) {
      const tagContent = match[1];
      if (tagContent.startsWith('<!--')) {
        continue;
      }
      if (tagContent.startsWith('</')) {
        const tagName = tagContent.slice(2, -1).trim().toUpperCase();
        if (stack.length > 1) {
          stack.pop();
        }
      } else {
        const isSelfClosing = tagContent.endsWith('/>');
        const content = isSelfClosing ? tagContent.slice(1, -2) : tagContent.slice(1, -1);
        
        const tagNameMatch = content.match(/^[a-zA-Z0-9:-]+/);
        if (!tagNameMatch) continue;
        const tagName = tagNameMatch[0].toUpperCase();
        
        const attributes = {};
        const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
        attrRegex.lastIndex = tagNameMatch[0].length;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(content)) !== null) {
          const attrName = attrMatch[1];
          const attrVal = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : (attrMatch[4] !== undefined ? attrMatch[4] : true));
          attributes[attrName] = attrVal;
        }

        const element = new MockElement(appInstance, tagName, attributes);
        const currentParent = stack[stack.length - 1];
        currentParent.appendChild(element);
        
        const isVoid = isSelfClosing || ['IMG', 'INPUT', 'BR', 'HR', 'META', 'LINK'].includes(tagName);
        if (!isVoid) {
          stack.push(element);
        }
      }
    } else if (match[2]) {
      const text = match[2].trim();
      if (text) {
        const textNode = new MockElement(appInstance, 'span', {}, text);
        const currentParent = stack[stack.length - 1];
        currentParent.appendChild(textNode);
      }
    }
  }
  return root;
}

class LiveDriver {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.activeTab = 'vola-vola';
    this.viewportWidth = 375;
    this.viewportHeight = 667;
    this.loadersTriggeredCount = 0;
    this.queryParameters = {};
    this.savedItems = new Set();
    this.dropsHistory = [];
    this.notifications = [];
    this.waitlistSubmitted = false;
    this.waitlistEmail = '';
    this.waitlistError = null;
    this.waitlistSubmissions = [];
    this.feed = [
      { id: 'flight-roma', type: 'flight', destination: 'Roma', price: 120, description: 'Direct flight to the historic capital of Italy, Roma.', image: 'roma.jpg' },
      { id: 'flight-paris', type: 'flight', destination: 'Paris', price: 150, description: 'Fly to Paris and explore the City of Light.', image: 'paris.jpg' },
      { id: 'hotel-london', type: 'hotel', destination: 'London Cozy Inn', price: 200, description: 'A cozy boutique hotel in the heart of London.', image: 'london.jpg' },
      { id: 'hotel-tokyo', type: 'hotel', destination: 'Tokyo Suite', price: 350, description: 'Luxury suite with stunning Tokyo skyline views.', image: 'tokyo.jpg' },
      { id: 'flight-ny', type: 'flight', destination: 'New York City', price: 400, description: 'Non-stop flight to JFK NYC. Experience the Big Apple!', image: 'nyc.jpg' }
    ];
    this.currentDoc = null;
  }

  reset() {
    this.activeTab = 'vola-vola';
    this.loadersTriggeredCount = 0;
    this.queryParameters = {};
    this.savedItems = new Set();
    this.dropsHistory = [];
    this.notifications = [];
    this.waitlistSubmitted = false;
    this.waitlistEmail = '';
    this.waitlistError = null;
    this.waitlistSubmissions = [];
    this.feed = [
      { id: 'flight-roma', type: 'flight', destination: 'Roma', price: 120, description: 'Direct flight to the historic capital of Italy, Roma.', image: 'roma.jpg' },
      { id: 'flight-paris', type: 'flight', destination: 'Paris', price: 150, description: 'Fly to Paris and explore the City of Light.', image: 'paris.jpg' },
      { id: 'hotel-london', type: 'hotel', destination: 'London Cozy Inn', price: 200, description: 'A cozy boutique hotel in the heart of London.', image: 'london.jpg' },
      { id: 'hotel-tokyo', type: 'hotel', destination: 'Tokyo Suite', price: 350, description: 'Luxury suite with stunning Tokyo skyline views.', image: 'tokyo.jpg' },
      { id: 'flight-ny', type: 'flight', destination: 'New York City', price: 400, description: 'Non-stop flight to JFK NYC. Experience the Big Apple!', image: 'nyc.jpg' }
    ];
    
    this.fetchRoute('/');
  }

  buildUrl(route) {
    const params = { ...this.queryParameters };
    if (this.savedItems.size > 0) {
      params.saved = Array.from(this.savedItems).join(',');
    }
    if (this.waitlistSubmitted && this.waitlistEmail) {
      params.email = this.waitlistEmail;
    }
    if (this.waitlistError) {
      params.error = this.waitlistError;
    }
    if (this.dropsHistory.length > 0) {
      params.drops = this.dropsHistory.map(d => `${d.itemId}:${d.newPrice}`).join(',');
    }
    if (this.notifications.length > 0) {
      params.notifications = this.notifications.map(n => `${n.id}:${n.itemId}:${n.newPrice}`).join(',');
    }
    if (this.viewportWidth >= 1024) {
      params.desktop = 'true';
    }
    
    if (this.feed.length === 0) {
      params.feed = 'empty';
    } else {
      const defaults = [
        { id: 'flight-roma', destination: 'Roma', price: 120, description: 'Direct flight to the historic capital of Italy, Roma.', image: 'roma.jpg' },
        { id: 'flight-paris', destination: 'Paris', price: 150, description: 'Fly to Paris and explore the City of Light.', image: 'paris.jpg' },
        { id: 'hotel-london', destination: 'London Cozy Inn', price: 200, description: 'A cozy boutique hotel in the heart of London.', image: 'london.jpg' },
        { id: 'hotel-tokyo', destination: 'Tokyo Suite', price: 350, description: 'Luxury suite with stunning Tokyo skyline views.', image: 'tokyo.jpg' },
        { id: 'flight-ny', destination: 'New York City', price: 400, description: 'Non-stop flight to JFK NYC. Experience the Big Apple!', image: 'nyc.jpg' }
      ];
      const mods = [];
      this.feed.forEach((item, idx) => {
        const d = defaults[idx];
        if (!d) return;
        if (item.image !== d.image) mods.push(`${item.id}:image:${item.image}`);
        if (item.destination !== d.destination) mods.push(`${item.id}:destination:${item.destination}`);
        if (item.description !== d.description) mods.push(`${item.id}:description:${item.description}`);
        if (item.price !== d.price) mods.push(`${item.id}:price:${item.price}`);
      });
      if (mods.length > 0) {
        params.feed_mod = mods.join(';');
      }
    }

    const qString = Object.keys(params)
      .map(k => `${k}=${encodeURIComponent(params[k])}`)
      .join('&');
      
    return qString ? `${route}?${qString}` : route;
  }

  fetchRoute(route) {
    const fullRoute = this.buildUrl(route);
    const { execSync } = require('child_process');
    try {
      const url = `${this.baseUrl}${fullRoute}`;
      const cmd = `node -e "fetch('${url}').then(r => r.text()).then(t => process.stdout.write(t)).catch(e => { console.error(e); process.exit(1); })"`;
      const html = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'inherit'] });
      this.currentDoc = parseHTML(html, this);
    } catch (err) {
      console.error(`[Live Mode] Failed to fetch route ${fullRoute}:`, err.message);
      throw err;
    }
  }

  clickNav(tabId) {
    const validTabs = ['vola-vola', 'soggiorna', 'drops', 'salvati', 'profilo'];
    if (!validTabs.includes(tabId)) {
      this.activeTab = 'not-found';
      this.fetchRoute('/404');
      return;
    }
    if (this.activeTab === tabId) {
      return;
    }
    this.activeTab = tabId;
    this.loadersTriggeredCount++;
    
    let route = `/${tabId}`;
    if (tabId === 'vola-vola') route = '/';
    
    this.fetchRoute(route);
  }

  saveItem(itemId) {
    const item = this.feed.find(i => i.id === itemId);
    if (item) {
      this.savedItems.add(itemId);
    }
    this.fetchRoute(this.activeTab === 'vola-vola' ? '/' : `/${this.activeTab}`);
  }

  unsaveItem(itemId) {
    this.savedItems.delete(itemId);
    this.fetchRoute(this.activeTab === 'vola-vola' ? '/' : `/${this.activeTab}`);
  }

  submitWaitlist(email) {
    this.waitlistError = null;
    if (!email || email.trim() === '') {
      this.waitlistError = 'Email cannot be empty';
      this.fetchRoute('/profilo');
      return;
    }
    const trimmed = email.trim();
    const sqlInjectionPattern = /'|--|union|select|insert|delete|drop|update/i;
    if (sqlInjectionPattern.test(trimmed)) {
      this.waitlistError = 'SQL injection pattern detected';
      this.fetchRoute('/profilo');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      this.waitlistError = 'Invalid email format';
      this.fetchRoute('/profilo');
      return;
    }
    this.waitlistSubmitted = true;
    this.waitlistEmail = trimmed;
    this.waitlistSubmissions.push(trimmed);
    
    this.fetchRoute('/profilo');
  }

  triggerPriceDrop(itemId, newPrice) {
    const item = this.feed.find(i => i.id === itemId);
    if (!item) return;

    const oldPrice = item.price;
    item.price = newPrice;

    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const dropPercentage = oldPrice <= 0 ? 0 : Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    const message = `Price drop! ${item.destination} is now €${newPrice} (${dropPercentage}% off)`;

    this.notifications.push({
      id: notifId,
      itemId,
      oldPrice,
      newPrice,
      dropPercentage,
      message
    });

    this.dropsHistory.push({
      id: `drop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      itemId,
      destination: item.destination,
      oldPrice,
      newPrice,
      dropPercentage
    });

    this.fetchRoute(this.activeTab === 'vola-vola' ? '/' : `/${this.activeTab}`);
  }

  dismissNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.fetchRoute(this.activeTab === 'vola-vola' ? '/' : `/${this.activeTab}`);
  }

  resizeViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.fetchRoute(this.activeTab === 'vola-vola' ? '/' : `/${this.activeTab}`);
  }

  setQueryParameters(params) {
    this.queryParameters = { ...params };
    this.fetchRoute(this.activeTab === 'vola-vola' ? '/' : `/${this.activeTab}`);
  }

  querySelector(selector) {
    if (!this.currentDoc) {
      this.reset();
    }
    return this.currentDoc.querySelector(selector);
  }

  querySelectorAll(selector) {
    if (!this.currentDoc) {
      this.reset();
    }
    return this.currentDoc.querySelectorAll(selector);
  }
}

let page;
if (process.env.TEST_MOCK === 'false') {
  page = new LiveDriver();
} else {
  page = mockApp.page;
}

module.exports = {
  page
};
