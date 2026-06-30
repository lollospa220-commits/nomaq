# Milestone 1 Planning Report: Scaffolding & Design System

## 1. Project Initialization & Architecture

To initialize the Next.js Pages Router project with TypeScript and Tailwind CSS in the empty `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq` directory, the following sequence of commands is recommended:

```bash
# Initialize Node package configuration
npm init -y

# Install Core Next.js & React dependencies
npm install next@14.2.4 react@^18.3.1 react-dom@^18.3.1 lucide-react@^0.395.0 clsx@^2.1.1 tailwind-merge@^2.3.0

# Install Dev Dependencies (TypeScript, PostCSS, Tailwind, Autoprefixer, ESLint)
npm install -D typescript@^5.4.5 @types/node@^20.14.8 @types/react@^18.3.3 @types/react-dom@^18.3.0 postcss@^8.4.38 tailwindcss@^3.4.4 autoprefixer@^10.4.19 eslint@^8.57.0 eslint-config-next@14.2.4
```

### Directory Structure Requirements
The source files must be structured within the `src/` directory as specified in the implementation scope:
```
nomaq/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── pages/
    │   ├── _app.tsx
    │   ├── _document.tsx
    │   ├── index.tsx
    │   └── waitlist.tsx
    ├── components/
    │   ├── BottomNav.tsx
    │   ├── Feed.tsx
    │   └── DebugPanel.tsx
    ├── context/
    │   └── AppState.tsx
    └── styles/
        └── globals.css
```

---

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

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
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
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
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

### `src/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-anthracite-grey-dark text-white min-h-screen font-sans antialiased overflow-x-hidden;
  }
}

@layer utilities {
  /* Glassmorphism custom classes with webkit fallback support */
  .glassmorphism {
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .glassmorphism-dark {
    background-color: rgba(18, 18, 22, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Safe Area Padding for mobile screens */
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
      <div className="relative min-h-screen bg-anthracite-grey-dark text-white">
        <Component {...pageProps} />
      </div>
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
      <body className="bg-anthracite-grey-dark text-white antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

---

## 3. Design System & Glassmorphism Rules

The UI layout utilizes custom color configurations and transparency layers to create a premium glassmorphic effect.

### Custom Palette
1. **Electric Orange (`#FF6B00`)**: Used for interactive states, primary action highlights, and notifications.
   - Text color: `text-electric-orange`
   - Background hover: `bg-electric-orange/10` or active pill: `bg-electric-orange`
2. **Anthracite Grey (`#1E1E24` default, `#121216` dark, `#2E2E38` light)**: Used for body backdrop, dark UI sections, and card background structures.
   - Base body layout: `bg-anthracite-grey-dark`
   - Custom card backdrops: `bg-anthracite-grey-light`

### Glassmorphism System
To build highly consistent components:
* **UI Panels / Cards**: Apply class `glassmorphism`. Under the hood, this translates to:
  ```css
  background-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  ```
* **Navigation Overlay (Bottom Bar)**: Apply class `glassmorphism-dark`. This guarantees clear read-through of background content while locking the navigation's position:
  ```css
  background-color: rgba(18, 18, 22, 0.75);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  ```

---

## 4. BottomNav.tsx Implementation Design

The global navigation bar coordinates view switching across the active tab states specified by the project contracts.

### Interface Contracts
* **Tab ID Type Definition**:
  `type TabId = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';`
* **Required Navigation Labels**:
  `'Vola Vola'`, `'Soggiorna'`, `'Drops'`, `'Salvati'`, `'Profilo'`

### Recommended Implementation Structure

```tsx
import React from 'react';
import { Plane, Bed, Bell, Heart, User } from 'lucide-react';
import { useAppState } from '@/context/AppState';
import clsx from 'clsx';

export type TabId = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe">
      <div className="mx-auto max-w-md h-16 flex items-center justify-around px-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={label}
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
                  {label}
                </span>
                
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute -bottom-1.5 w-4 h-0.5 rounded-full bg-electric-orange animate-fade-in" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## 5. Verification Plan

The implementer can verify the scaffolded project using these commands and sanity checks:

1. **Clean Installation and Run Build**:
   ```bash
   # In root project directory
   npm run build
   ```
   This tests compatibility of TypeScript compiler configuration and module resolution pathways.
2. **Linter Execution**:
   ```bash
   npm run lint
   ```
   Validates standard configuration layout compliance and verifies type contracts.
3. **Responsive Visual Audit**:
   - Confirm layout works perfectly on mobile views. The navigation bar must stay sticky at the bottom (`fixed bottom-0`).
   - Confirm active class is appended correctly to active tab, transforming its style to `text-electric-orange` and rendering labels exactly as specified: `Vola Vola`, `Soggiorna`, `Drops`, `Salvati`, `Profilo`.
