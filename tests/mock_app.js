/**
 * Mock App Simulator for Nomaq E2E Tests
 */

class MockElement {
  constructor(app, tagName, attributes = {}, textContent = '') {
    this.app = app;
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attributes };
    this.classList = new Set(
      (attributes.class || attributes.className || '').split(/\s+/).filter(Boolean)
    );
    this._textContent = textContent;
    this.children = [];
    this.parent = null;
    this._value = attributes.value || '';
    this.disabled = !!attributes.disabled;
  }

  get textContent() {
    let text = this._textContent || '';
    for (const child of this.children) {
      text += child.textContent;
    }
    return text
      .replace(/&amp;/g, '&')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x3D;/g, '=')
      .replace(/&eacute;/g, 'é')
      .replace(/&#xE9;/g, 'é')
      .replace(/&egrave;/g, 'è')
      .replace(/&#xE8;/g, 'è');
  }

  set textContent(val) {
    this._textContent = val;
    this.children = [];
  }

  get className() {
    return Array.from(this.classList).join(' ');
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    const testid = this.getAttribute('data-testid');
    if (testid === 'waitlist-email' || testid === 'waitlist-email-input') {
      this.app.waitlistEmail = val;
    }
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? String(this.attributes[name]) : null;
  }

  appendChild(child) {
    if (child) {
      child.parent = this;
      this.children.push(child);
    }
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results.length > 0 ? results[0] : null;
  }

  querySelectorAll(selector) {
    const subSelectors = selector.split(',').map(s => s.trim()).filter(Boolean);
    let results = [];
    for (let sub of subSelectors) {
      sub = sub.replace(/\s*>\s*/g, ' > ');
      const parts = sub.split(/\s+/).filter(Boolean);
      results.push(...findNodes(this, parts, 0));
    }
    return Array.from(new Set(results));
  }

  click() {
    const testid = this.getAttribute('data-testid');

    // Bottom Navigation click
    if (testid && testid.startsWith('nav-')) {
      const tabId = testid.slice(4);
      this.app.clickNav(tabId);
      return;
    }

    // Save button click
    if (testid === 'save-button') {
      const itemId = this.getAttribute('data-id');
      if (this.app.savedItems.has(itemId)) {
        this.app.unsaveItem(itemId);
      } else {
        this.app.saveItem(itemId);
      }
      return;
    }

    // Unsave button click
    if (testid && testid.startsWith('unsave-btn-')) {
      const itemId = testid.slice(11);
      this.app.unsaveItem(itemId);
      return;
    }

    // Dismiss notification click
    if (testid && testid.startsWith('toast-dismiss-')) {
      const notifId = testid.slice(14);
      this.app.dismissNotification(notifId);
      return;
    }

    // Simulate Drop button click
    if (testid === 'debug-price-drop' || testid === 'simulate-drop-btn') {
      // Pick a random flight to drop
      this.app.triggerPriceDrop('flight-roma', 99);
      return;
    }

    // Submit Waitlist button click
    if (testid === 'waitlist-submit' || this.getAttribute('type') === 'submit') {
      let cur = this;
      let form = null;
      while (cur) {
        if (cur.tagName === 'FORM') {
          form = cur;
          break;
        }
        cur = cur.parent;
      }
      if (form) {
        const emailInput = form.querySelector('[data-testid="waitlist-email-input"]') || form.querySelector('[data-testid="waitlist-email"]');
        if (emailInput) {
          this.app.submitWaitlist(emailInput.value);
        }
      }
      return;
    }
  }
}

function matchSelector(node, selector) {
  if (!selector) return false;
  if (selector === '>' || selector === '+' || selector === '~') return false;

  let match = true;

  // Tag name match
  const tagMatch = selector.match(/^[a-zA-Z0-9]+/);
  if (tagMatch) {
    const expectedTag = tagMatch[0].toUpperCase();
    if (node.tagName !== expectedTag) {
      return false;
    }
  }

  // Class match
  const classMatches = selector.match(/\.[a-zA-Z0-9_-]+/g);
  if (classMatches) {
    for (const cm of classMatches) {
      const className = cm.slice(1);
      if (!node.classList.has(className)) {
        return false;
      }
    }
  }

  // Attribute match
  const attrMatches = selector.match(/\[([a-zA-Z0-9_-]+)([\^$*]?=)?['"]?([^'"]+)?['"]?\]/g);
  if (attrMatches) {
    for (const am of attrMatches) {
      const matchDetails = am.match(/\[([a-zA-Z0-9_-]+)([\^$*]?=)?['"]?([^'"]+)?['"]?\]/);
      if (matchDetails) {
        const attrName = matchDetails[1];
        const operator = matchDetails[2];
        const attrVal = matchDetails[3];

        if (!(attrName in node.attributes)) {
          return false;
        }

        const actualVal = String(node.attributes[attrName]);

        if (operator === '=') {
          if (actualVal !== attrVal) return false;
        } else if (operator === '^=') {
          if (!actualVal.startsWith(attrVal)) return false;
        } else if (operator === '$=') {
          if (!actualVal.endsWith(attrVal)) return false;
        } else if (operator === '*=') {
          if (!actualVal.includes(attrVal)) return false;
        }
      }
    }
  }

  return true;
}

function findNodes(node, selectorParts, index) {
  const currentSelector = selectorParts[index];
  const isLast = index === selectorParts.length - 1;
  let results = [];

  function check(n) {
    if (matchSelector(n, currentSelector)) {
      if (isLast) {
        results.push(n);
      } else {
        if (selectorParts[index + 1] === '>') {
          if (index + 2 < selectorParts.length) {
            for (const child of n.children) {
              results.push(...findNodes(child, selectorParts, index + 2));
            }
          }
        } else {
          for (const child of n.children) {
            results.push(...findNodes(child, selectorParts, index + 1));
          }
        }
      }
    }
    const isDescendantTransition = index === 0 || selectorParts[index - 1] !== '>';
    if (isDescendantTransition) {
      for (const child of n.children) {
        results.push(...findNodes(child, selectorParts, index));
      }
    }
  }

  check(node);
  return results;
}

class MockApp {
  constructor() {
    this.reset();
  }

  reset() {
    this.activeTab = 'vola-vola';
    this.feed = [
      { id: 'flight-roma', type: 'flight', destination: 'Roma', price: 120, description: 'Direct flight to the historic capital of Italy, Roma.', image: 'roma.jpg' },
      { id: 'flight-paris', type: 'flight', destination: 'Paris', price: 150, description: 'Fly to Paris and explore the City of Light.', image: 'paris.jpg' },
      { id: 'hotel-london', type: 'hotel', destination: 'London Cozy Inn', price: 200, description: 'A cozy boutique hotel in the heart of London.', image: 'london.jpg' },
      { id: 'hotel-tokyo', type: 'hotel', destination: 'Tokyo Suite', price: 350, description: 'Luxury suite with stunning Tokyo skyline views.', image: 'tokyo.jpg' },
      { id: 'flight-ny', type: 'flight', destination: 'New York City', price: 400, description: 'Non-stop flight to JFK NYC. Experience the Big Apple!', image: 'nyc.jpg' }
    ];
    this.savedItems = new Set();
    this.notifications = [];
    this.dropsHistory = [];
    this.waitlistSubmitted = false;
    this.waitlistEmail = '';
    this.waitlistError = null;
    this.waitlistSubmissions = [];
    this.viewportWidth = 375;
    this.viewportHeight = 667;
    this.loadersTriggeredCount = 0;
    this.queryParameters = {};
  }

  // Setters/Event simulation
  clickNav(tabId) {
    const validTabs = ['vola-vola', 'soggiorna', 'drops', 'salvati', 'profilo'];
    if (!validTabs.includes(tabId)) {
      this.activeTab = 'not-found';
      return;
    }
    if (this.activeTab === tabId) {
      // Clicking the currently active nav tab does not re-trigger initial loaders
      return;
    }
    this.activeTab = tabId;
    this.loadersTriggeredCount++;
  }

  saveItem(itemId) {
    const item = this.feed.find(i => i.id === itemId);
    if (item) {
      this.savedItems.add(itemId);
    }
  }

  unsaveItem(itemId) {
    this.savedItems.delete(itemId);
  }

  submitWaitlist(email) {
    this.waitlistError = null;
    if (!email || email.trim() === '') {
      this.waitlistError = 'Email cannot be empty';
      return;
    }
    const trimmed = email.trim();
    
    // Check SQL injection patterns
    const sqlInjectionPattern = /'|--|union|select|insert|delete|drop|update/i;
    if (sqlInjectionPattern.test(trimmed)) {
      this.waitlistError = 'SQL injection pattern detected';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      this.waitlistError = 'Invalid email format';
      return;
    }

    this.waitlistSubmitted = true;
    this.waitlistEmail = trimmed;
    this.waitlistSubmissions.push(trimmed);
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
  }

  dismissNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  resizeViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setQueryParameters(params) {
    this.queryParameters = { ...params };
  }

  // DOM Query Simulator
  querySelector(selector) {
    const doc = this.render();
    return doc.querySelector(selector);
  }

  querySelectorAll(selector) {
    const doc = this.render();
    return doc.querySelectorAll(selector);
  }

  render() {
    const root = new MockElement(this, 'main', {
      class: 'min-h-screen pb-20 flex flex-col items-center justify-center p-4 bg-white text-anthracite-grey',
      'data-testid': 'app-root'
    });

    const isDesktop = this.viewportWidth >= 1024;
    const layoutClass = isDesktop ? 'max-w-4xl p-12' : 'max-w-md p-6';

    const header = new MockElement(this, 'div', {
      class: `glassmorphism rounded-2xl ${layoutClass} w-full text-center`
    });
    header.appendChild(new MockElement(this, 'h1', { class: 'text-2xl font-bold mb-2' }, 'Nomaq'));
    header.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 mb-4' }, 'Mobile-First Travel Booking'));
    header.appendChild(new MockElement(this, 'div', {
      class: 'bg-electric-orange/10 border border-electric-orange/20 text-electric-orange px-4 py-2 rounded-xl inline-block font-semibold',
      'data-testid': 'active-view'
    }, `Active view: ${this.activeTab}`));
    
    root.appendChild(header);

    if (this.activeTab === 'vola-vola' || this.activeTab === 'soggiorna') {
      const feedContainer = new MockElement(this, 'div', {
        class: 'feed-container overflow-y-auto scrollable mt-6 w-full space-y-4 max-h-[400px]',
        'data-testid': 'feed-container'
      });
      
      const filterType = this.activeTab === 'vola-vola' ? 'flight' : 'hotel';
      const filteredFeed = this.feed.filter(item => item.type === filterType);
      
      if (filteredFeed.length === 0) {
        feedContainer.appendChild(new MockElement(this, 'div', {
          class: 'text-anthracite-grey/40 text-center py-8',
          'data-testid': 'feed-empty'
        }, 'No travel options available.'));
      } else {
        for (const item of filteredFeed) {
          const imgSrc = item.image ? item.image : 'fallback-placeholder.jpg';
          
          const feedCard = new MockElement(this, 'div', {
            class: 'glassmorphism p-4 rounded-xl flex flex-col relative',
            'data-testid': 'feed-item',
            'data-id': item.id
          });
          
          const img = new MockElement(this, 'img', {
            src: imgSrc,
            alt: item.destination,
            class: 'w-full h-32 object-cover rounded-lg mb-2'
          });
          feedCard.appendChild(img);
          
          feedCard.appendChild(new MockElement(this, 'h3', {
            class: 'text-lg font-semibold text-anthracite-grey truncate'
          }, item.destination));
          
          const descClass = item.description.length > 200 ? 'text-xs text-anthracite-grey/50 line-clamp-2' : 'text-sm text-anthracite-grey/70';
          feedCard.appendChild(new MockElement(this, 'p', { class: descClass }, item.description));
          
          feedCard.appendChild(new MockElement(this, 'div', {
            class: 'text-electric-orange font-bold mt-2'
          }, `€${item.price}`));
          
          const isSaved = this.savedItems.has(item.id);
          const heartClass = isSaved ? 'text-electric-orange filled' : 'text-anthracite-grey/60';
          feedCard.appendChild(new MockElement(this, 'button', {
            'data-testid': 'save-button',
            'data-id': item.id,
            class: `absolute top-6 right-6 p-2 rounded-full bg-white/40 shadow-sm border border-white/20 ${heartClass}`
          }, isSaved ? '❤️' : '🤍'));
          
          feedContainer.appendChild(feedCard);
        }
      }
      
      root.appendChild(feedContainer);
      
    } else if (this.activeTab === 'salvati') {
      const savedContainer = new MockElement(this, 'div', {
        class: 'saved-container mt-6 w-full space-y-4',
        'data-testid': 'salvati-list'
      });
      
      if (this.savedItems.size === 0) {
        savedContainer.appendChild(new MockElement(this, 'div', {
          class: 'text-anthracite-grey/40 text-center py-8',
          'data-testid': 'salvati-empty'
        }, 'No saved travel routes yet. Explore the feed to add some!'));
      } else {
        for (const itemId of this.savedItems) {
          const item = this.feed.find(i => i.id === itemId);
          if (item) {
            const savedCard = new MockElement(this, 'div', {
              class: 'glassmorphism p-4 rounded-xl flex justify-between items-center',
              'data-testid': `saved-item-${item.id}`
            });
            
            const isLong = item.destination.length > 30;
            const info = new MockElement(this, 'div', { class: 'flex flex-col truncate' });
            info.appendChild(new MockElement(this, 'h4', { class: `text-md font-semibold text-anthracite-grey ${isLong ? 'truncate' : ''}` }, item.destination));
            info.appendChild(new MockElement(this, 'span', { class: 'text-electric-orange font-bold text-sm' }, `€${item.price}`));
            savedCard.appendChild(info);
            
            savedCard.appendChild(new MockElement(this, 'button', {
              'data-testid': `unsave-btn-${item.id}`,
              class: 'text-electric-orange p-2 hover:underline font-medium'
            }, 'Unsave'));
            
            savedContainer.appendChild(savedCard);
          }
        }
      }
      
      root.appendChild(savedContainer);
      
    } else if (this.activeTab === 'drops') {
      const dropsContainer = new MockElement(this, 'div', {
        class: 'drops-container mt-6 w-full space-y-4',
        'data-testid': 'drops-view'
      });
      
      dropsContainer.appendChild(new MockElement(this, 'button', {
        'data-testid': 'debug-price-drop',
        class: 'w-full bg-electric-orange text-white py-2 px-4 rounded-xl font-bold hover:bg-electric-orange/80 transition'
      }, 'Simulate Random Price Drop'));
      
      const historyList = new MockElement(this, 'div', {
        class: 'space-y-2',
        'data-testid': 'drops-history-list'
      });
      
      if (this.dropsHistory.length === 0) {
        historyList.appendChild(new MockElement(this, 'div', {
          class: 'text-anthracite-grey/40 text-center py-8',
          'data-testid': 'drops-empty'
        }, 'No price drops recorded yet.'));
      } else {
        for (const drop of this.dropsHistory) {
          const dropItem = new MockElement(this, 'div', {
            class: 'glassmorphism p-3 rounded-lg flex justify-between items-center border-l-4 border-electric-orange',
            'data-testid': `drop-item-${drop.id}`
          });
          
          const details = new MockElement(this, 'div');
          details.appendChild(new MockElement(this, 'span', { class: 'font-semibold text-anthracite-grey text-sm block' }, drop.destination));
          details.appendChild(new MockElement(this, 'span', { class: 'text-xs text-anthracite-grey/60' }, `Was €${drop.oldPrice} → Now €${drop.newPrice}`));
          
          const badge = new MockElement(this, 'span', {
            class: 'bg-electric-orange/20 text-electric-orange text-xs font-bold px-2 py-1 rounded'
          }, `-${drop.dropPercentage}%`);
          
          dropItem.appendChild(details);
          dropItem.appendChild(badge);
          historyList.appendChild(dropItem);
        }
      }
      dropsContainer.appendChild(historyList);
      root.appendChild(dropsContainer);
      
    } else if (this.activeTab === 'profilo') {
      const profileContainer = new MockElement(this, 'div', {
        class: 'profile-container mt-6 w-full space-y-6',
        'data-testid': 'profile-view'
      });
      
      const waitlistForm = new MockElement(this, 'form', {
        'data-testid': 'waitlist-form',
        class: 'glassmorphism p-6 rounded-xl space-y-4'
      });
      
      waitlistForm.appendChild(new MockElement(this, 'h3', { class: 'text-lg font-bold text-anthracite-grey' }, 'Join the Drops Waitlist'));
      waitlistForm.appendChild(new MockElement(this, 'p', { class: 'text-xs text-anthracite-grey/60' }, 'Get notified before anyone else when prices drop.'));
      
      waitlistForm.appendChild(new MockElement(this, 'input', {
        type: 'email',
        'data-testid': 'waitlist-email-input',
        placeholder: 'Enter your email',
        value: this.waitlistEmail || '',
        class: 'w-full bg-anthracite-grey/5 border border-anthracite-grey/10 rounded-xl px-4 py-2 text-anthracite-grey focus:outline-none focus:border-electric-orange'
      }));
      
      waitlistForm.appendChild(new MockElement(this, 'button', {
        type: 'submit',
        'data-testid': 'waitlist-submit',
        class: 'w-full bg-electric-orange text-white py-2 rounded-xl font-semibold'
      }, 'Join Waitlist'));
      
      if (this.waitlistSubmitted) {
        waitlistForm.appendChild(new MockElement(this, 'div', {
          'data-testid': 'waitlist-success',
          class: 'bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm'
        }, `Awesome! You are on the list: ${this.waitlistEmail}`));
        
        waitlistForm.appendChild(new MockElement(this, 'button', {
          'data-testid': 'share-button',
          class: 'w-full border border-electric-orange text-electric-orange py-2 rounded-xl font-semibold mt-2'
        }, 'Flexa il tuo Drop'));
      }
      
      if (this.waitlistError) {
        waitlistForm.appendChild(new MockElement(this, 'div', {
          'data-testid': 'waitlist-error',
          class: 'bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm'
        }, this.waitlistError));
      }
      
      profileContainer.appendChild(waitlistForm);
      root.appendChild(profileContainer);
      
    } else if (this.activeTab === 'not-found') {
      const fallback = new MockElement(this, 'div', {
        'data-testid': 'not-found',
        class: 'glassmorphism p-6 rounded-xl text-center mt-6 w-full'
      });
      fallback.appendChild(new MockElement(this, 'h2', { class: 'text-xl font-bold text-anthracite-grey' }, '404 - Not Found'));
      fallback.appendChild(new MockElement(this, 'p', { class: 'text-anthracite-grey/60 text-sm mt-2' }, 'We cannot find the page you are looking for.'));
      root.appendChild(fallback);
    }

    if (this.notifications.length > 0) {
      const toastContainer = new MockElement(this, 'div', {
        'data-testid': 'toast-container',
        class: 'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full'
      });
      for (const notif of this.notifications) {
        const toast = new MockElement(this, 'div', {
          'data-testid': 'notification-toast',
          'data-id': notif.id,
          class: 'glassmorphism border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center'
        });
        
        toast.appendChild(new MockElement(this, 'div', { class: 'text-sm text-anthracite-grey' }, notif.message));
        
        toast.appendChild(new MockElement(this, 'button', {
          'data-testid': `toast-dismiss-${notif.id}`,
          class: 'text-anthracite-grey/60 hover:text-anthracite-grey ml-4 text-xs font-bold'
        }, '✕'));
        
        toastContainer.appendChild(toast);
      }
      root.appendChild(toastContainer);
    }

    const nav = new MockElement(this, 'nav', {
      class: 'fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe',
      'data-testid': 'bottom-nav'
    });
    
    const navContainer = new MockElement(this, 'div', {
      class: 'mx-auto max-w-md h-16 flex items-center justify-around px-2'
    });

    const TABS = [
      { id: 'vola-vola', label: 'Vola Vola' },
      { id: 'soggiorna', label: 'Soggiorna' },
      { id: 'drops', label: 'Drops' },
      { id: 'salvati', label: 'Salvati' },
      { id: 'profilo', label: 'Profilo' }
    ];

    for (const tab of TABS) {
      const isActive = this.activeTab === tab.id;
      const itemBtn = new MockElement(this, 'button', {
        'data-testid': `nav-${tab.id}`,
        'aria-label': tab.label,
        class: 'flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200'
      });
      
      const wrapper = new MockElement(this, 'div', { class: 'relative flex flex-col items-center' });
      
      const icon = new MockElement(this, 'svg', {
        class: isActive 
          ? 'w-6 h-6 transition-all duration-200 text-electric-orange scale-110 drop-shadow-[0_0_8px_rgba(255,107,0,0.3)]' 
          : 'text-anthracite-grey/60 hover:text-anthracite-grey'
      });
      wrapper.appendChild(icon);
      
      const labelSpan = new MockElement(this, 'span', {
        class: isActive ? 'text-electric-orange text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap' : 'text-anthracite-grey/70 text-[10px] mt-1 font-medium transition-all duration-200 whitespace-nowrap'
      }, tab.label);
      
      if (tab.id === 'drops' && this.notifications.length > 0) {
        wrapper.appendChild(new MockElement(this, 'span', {
          class: 'absolute -top-1 -right-2 bg-electric-orange text-white text-[8px] font-bold px-1 rounded-full',
          'data-testid': 'drops-badge'
        }, String(this.notifications.length)));
      }
      
      wrapper.appendChild(labelSpan);
      itemBtn.appendChild(wrapper);
      navContainer.appendChild(itemBtn);
    }
    
    nav.appendChild(navContainer);
    root.appendChild(nav);

    return root;
  }
}

const defaultApp = new MockApp();

module.exports = {
  MockApp,
  MockElement,
  page: defaultApp
};
