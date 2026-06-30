# Synthesis Plan: Milestone 1 Scaffolding & Design System

This document synthesizes the plans from the Explorer agents for Milestone 1.

## 1. Project Setup & Architecture
- **Framework**: Next.js 14 (Pages Router) using TypeScript.
- **Styling**: Tailwind CSS.
- **Icons**: `lucide-react`.
- **Directory Layout**:
  - `src/pages/` containing `_app.tsx`, `_document.tsx`, `index.tsx`, `waitlist.tsx`.
  - `src/components/` containing `BottomNav.tsx`.
  - `src/context/` containing `AppState.tsx`.
  - `src/styles/` containing `globals.css`.

## 2. Configuration Files

### `package.json`
```json
{
  "name": "nomaq",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.395.0",
    "next": "14.2.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.8",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.4",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5"
  }
}
```

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        'electric-orange': {
          light: '#FF8533',
          DEFAULT: '#FF6B00',
          dark: '#E05E00',
        },
        'anthracite-grey': {
          light: '#2E2E38',
          DEFAULT: '#1E1E24',
          dark: '#121216',
        },
      },
    },
  },
  plugins: [],
}
```

### `postcss.config.js`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
```

### `src/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

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

  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### `src/pages/_app.tsx`
```tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AppStateProvider } from '@/context/AppState';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppStateProvider>
      <Component {...pageProps} />
    </AppStateProvider>
  );
}
```

### `src/pages/_document.tsx`
```tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="it">
      <Head />
      <body className="bg-white text-anthracite-grey antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### `src/context/AppState.tsx`
For Milestone 1, we need a simple initial version of this context to provide the active tab state for `BottomNav.tsx` to compile and function.
```tsx
import React, { createContext, useContext, useState } from 'react';

export type TabId = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';

interface AppContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  savedItems: string[];
  toggleSaveItem: (id: string) => void;
  drops: string[];
  addDrop: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabId>('vola-vola');
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [drops, setDrops] = useState<string[]>([]);

  const toggleSaveItem = (id: string) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addDrop = (id: string) => {
    setDrops((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        savedItems,
        toggleSaveItem,
        drops,
        addDrop,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
```

### `src/components/BottomNav.tsx`
```tsx
import React from 'react';
import { Plane, Bed, Bell, Heart, User } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';
import clsx from 'clsx';

interface TabConfig {
  id: TabId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: 'vola-vola', label: 'Vola Vola', Icon: Plane },
  { id: 'soggiorna', label: 'Soggiorna', Icon: Bed },
  { id: 'drops', label: 'Drops', Icon: Bell },
  { id: 'salvati', label: 'Salvati', Icon: Heart },
  { id: 'profilo', label: 'Profilo', Icon: User }
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppState();

  return (
    <nav data-testid="bottom-nav" className="fixed bottom-0 left-0 right-0 z-50 glassmorphism pb-safe">
      <div className="mx-auto max-w-md h-16 flex items-center justify-around px-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={label}
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
                    isActive ? "text-electric-orange" : "text-anthracite-grey/70"
                  )}
                >
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

### `src/pages/index.tsx`
Initial main view showing BottomNav and rendering the current active tab label for sanity check.
```tsx
import Head from 'next/head';
import BottomNav from '@/components/BottomNav';
import { useAppState } from '@/context/AppState';

export default function Home() {
  const { activeTab } = useAppState();

  return (
    <>
      <Head>
        <title>Nomaq - Travel Booking</title>
        <meta name="description" content="Nomaq mobile-first travel booking web application" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <main className="min-h-screen pb-20 flex flex-col items-center justify-center p-4 bg-white text-anthracite-grey" data-testid="app-root">
        <div className={`glassmorphism rounded-2xl ${layoutClass} w-full text-center`}>
          <h1 className="text-2xl font-bold mb-2">Nomaq</h1>
          <p className="text-anthracite-grey/60 mb-4">Mobile-First Travel Booking</p>
          <div className="bg-electric-orange/10 border border-electric-orange/20 text-electric-orange px-4 py-2 rounded-xl inline-block font-semibold" data-testid="active-view">
            Active view: {activeTab}
          </div>
        </div>

        {/* Tab contents */}
        {(activeTab === 'vola-vola' || activeTab === 'soggiorna') && (
          <div className="feed-container overflow-y-auto scrollable mt-6 w-full space-y-4 max-h-[400px]" data-testid="feed-container">
            {feedItems.filter(item => item.type === (activeTab === 'vola-vola' ? 'flight' : 'hotel')).length === 0 ? (
              <div className="text-anthracite-grey/40 text-center py-8" data-testid="feed-empty">
                No travel options available.
              </div>
            ) : (
              feedItems
                .filter(item => item.type === (activeTab === 'vola-vola' ? 'flight' : 'hotel'))
                .map(item => {
                  const isSaved = savedItems.includes(item.id);
                  const heartClass = isSaved ? 'text-electric-orange filled' : 'text-anthracite-grey/60';
                  return (
                    <div key={item.id} className="glassmorphism p-4 rounded-xl flex flex-col relative" data-testid="feed-item" data-id={item.id}>
                      <img src={item.image || 'fallback-placeholder.jpg'} alt={item.destination} className="w-full h-32 object-cover rounded-lg mb-2" />
                      <h3 className="text-lg font-semibold text-anthracite-grey truncate">{item.destination}</h3>
                      <p className={item.description.length > 200 ? 'text-xs text-anthracite-grey/50 line-clamp-2' : 'text-sm text-anthracite-grey/70'}>{item.description}</p>
                      <div className="text-electric-orange font-bold mt-2">€{item.price}</div>
                      <button 
                        data-testid="save-button" 
                        data-id={item.id} 
                        onClick={() => toggleSaveItem(item.id)}
                        className={`absolute top-6 right-6 p-2 rounded-full bg-white/40 shadow-sm border border-white/20 ${heartClass}`}
                      >
                        {isSaved ? '❤️' : '🤍'}
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {activeTab === 'salvati' && (
          <div className="saved-container mt-6 w-full space-y-4" data-testid="salvati-list">
            {savedItems.length === 0 ? (
              <div className="text-anthracite-grey/40 text-center py-8" data-testid="salvati-empty">
                No saved travel routes yet. Explore the feed to add some!
              </div>
            ) : (
              savedItems.map(itemId => {
                const item = DEFAULT_FEED.find(i => i.id === itemId);
                if (!item) return null;
                const isLong = item.destination.length > 30;
                return (
                  <div key={item.id} className="glassmorphism p-4 rounded-xl flex justify-between items-center" data-testid={`saved-item-${item.id}`}>
                    <div className="flex flex-col truncate">
                      <h4 className={`text-md font-semibold text-anthracite-grey ${isLong ? 'truncate' : ''}`}>{item.destination}</h4>
                      <span className="text-electric-orange font-bold text-sm">€{item.price}</span>
                    </div>
                    <button 
                      data-testid={`unsave-btn-${item.id}`} 
                      onClick={() => toggleSaveItem(item.id)}
                      className="text-electric-orange p-2 hover:underline font-medium"
                    >
                      Unsave
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'drops' && (
          <div className="drops-container mt-6 w-full space-y-4" data-testid="drops-view">
            <button 
              data-testid="debug-price-drop" 
              onClick={handleSimulateDrop}
              className="w-full bg-electric-orange text-white py-2 px-4 rounded-xl font-bold hover:bg-electric-orange/80 transition"
            >
              Simulate Random Price Drop
            </button>
            <div className="space-y-2" data-testid="drops-history-list">
              {dropsHistory.length === 0 ? (
                <div className="text-anthracite-grey/40 text-center py-8" data-testid="drops-empty">
                  No price drops recorded yet.
                </div>
              ) : (
                dropsHistory.map(drop => (
                  <div key={drop.id} className="glassmorphism p-3 rounded-lg flex justify-between items-center border-l-4 border-electric-orange" data-testid={`drop-item-${drop.id}`}>
                    <div>
                      <span className="font-semibold text-anthracite-grey text-sm block">{drop.destination}</span>
                      <span className="text-xs text-anthracite-grey/60">Was €{drop.oldPrice} → Now €{drop.newPrice}</span>
                    </div>
                    <span className="bg-electric-orange/20 text-electric-orange text-xs font-bold px-2 py-1 rounded">-{drop.dropPercentage}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'profilo' && (
          <div className="profile-container mt-6 w-full space-y-6" data-testid="profile-view">
            <form data-testid="waitlist-form" className="glassmorphism p-6 rounded-xl space-y-4" onSubmit={handleWaitlistSubmit}>
              <h3 className="text-lg font-bold text-anthracite-grey">Join the Drops Waitlist</h3>
              <p className="text-xs text-anthracite-grey/60">Get notified before anyone else when prices drop.</p>
              <input 
                type="email" 
                data-testid="waitlist-email-input" 
                placeholder="Enter your email" 
                value={waitlistEmail} 
                onChange={e => setWaitlistEmail(e.target.value)}
                className="w-full bg-anthracite-grey/5 border border-anthracite-grey/10 rounded-xl px-4 py-2 text-anthracite-grey focus:outline-none focus:border-electric-orange" 
              />
              <button type="submit" data-testid="waitlist-submit" className="w-full bg-electric-orange text-white py-2 rounded-xl font-semibold">Join Waitlist</button>
              {waitlistError && (
                <div data-testid="waitlist-error" className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                  {waitlistError}
                </div>
              )}
              {waitlistSubmitted && !waitlistError && (
                <>
                  <div data-testid="waitlist-success" className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
                    Awesome! You are on the list: {waitlistEmail}
                  </div>
                  <button data-testid="share-button" className="w-full border border-electric-orange text-electric-orange py-2 rounded-xl font-semibold mt-2">
                    Flexa il tuo Drop
                  </button>
                </>
              )}
            </form>
          </div>
        )}

        {/* Toast notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full" data-testid="toast-container">
            {notifications.map(notif => (
              <div key={notif.id} className="glassmorphism border-l-4 border-electric-orange p-4 rounded-lg shadow-lg flex justify-between items-center" data-testid="notification-toast" data-id={notif.id}>
                <div className="text-sm text-anthracite-grey">{notif.message}</div>
                <button 
                  data-testid={`toast-dismiss-${notif.id}`} 
                  onClick={() => dismissNotification(notif.id)}
                  className="text-anthracite-grey/60 hover:text-anthracite-grey ml-4 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Nav Bar */}
        <BottomNav />
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      query: context.query || {},
      resolvedUrl: context.resolvedUrl || '',
    },
  };
}
```

## 3. E2E Test Suite & Virtual Simulator Alignment

### `tests/tier1_feature_coverage.test.js`
Update the BottomNav container style assertion from `glassmorphism-dark` to `glassmorphism`:
```javascript
  assert.ok(nav.classList.has('glassmorphism'), 'Nav bar container should use glassmorphism styling');
```

### `tests/mock_app.js`
Update the mock DOM structures to align with the pure white background / light glassmorphism styles:
- Change body background/color elements and sub-header text classes to use `text-anthracite-grey/...` instead of `text-white/...`.
- In mock navbar rendering, change `nav` container class to `glassmorphism` (from `glassmorphism-dark`).
- Change inactive tab icon class to `text-anthracite-grey/60 hover:text-anthracite-grey`.
- Change inactive tab label class to `text-anthracite-grey/70 text-[10px] mt-1 font-medium`.
- Align toast notifications and forms with light styling and proper accessibility contrast ratios.

### `tests/driver.js`
Fix the ReferenceError by correctly destructuring after importing the module namespace or changing the import pattern:
```javascript
const mockApp = require('./mock_app');
const { MockApp, MockElement } = mockApp;
```
