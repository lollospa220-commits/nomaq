# Nomaq Milestone 1 Scaffolding & Design System Report

## 1. Next.js Pages Router Scaffolding

To initialize the project in the workspace (`/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq`), run the following commands. These configure Next.js with Pages Router (`--no-app`), TypeScript (`--typescript`), Tailwind CSS (`--tailwind`), ESLint (`--eslint`), and the source directory (`--src-dir`).

```bash
# Verify inside directory
cd /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq

# Initialize Next.js TypeScript project using Pages Router with specific Tailwind and src directory configurations
npx create-next-app@14.2.0 . \
  --typescript \
  --tailwind \
  --eslint \
  --src-dir \
  --no-app \
  --import-alias "@/*" \
  --use-npm
```

---

## 2. Configuration Files

### 2.1. `package.json`
This defines dependencies needed for a glassmorphic dark theme, incorporating React, Next.js, and auxiliary UI utilities (`lucide-react` for icons, `clsx` and `tailwind-merge` for class overrides).

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
    "lucide-react": "^0.378.0",
    "next": "14.2.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5"
  }
}
```

### 2.2. `tailwind.config.js`
Tailwind extended configuration specifying custom colors for **Electric Orange**, **Anthracite Grey** (in shades supporting backgrounds, cards, and borders), and custom backdrop blur.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            DEFAULT: '#FF5A00', // Electric Orange
            hover: '#E04F00',
            light: '#FF7E33',
          },
          anthracite: {
            950: '#0A0A0C', // Deep black-grey for background overlays
            900: '#121215', // Main app black/anthracite page background
            800: '#1C1C21', // Dark card/component background
            700: '#2A2A33', // Border and active-grey elements
            600: '#3A3A47', // Muted/hover state grey
            DEFAULT: '#1C1C21',
          }
        }
      },
      backdropBlur: {
        'md-custom': '16px',
      },
    },
  },
  plugins: [],
}
```

### 2.3. `next.config.js`
Standard configuration optimized for pages routing, enabling strict mode and remote asset domains if loading external mock images.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'placeholder.com'],
  },
};

module.exports = nextConfig;
```

### 2.4. `tsconfig.json`
Ensures standard path mapping (`@/*` to `./src/*`) and enforces strict TypeScript rules.

```json
{
  "compilerOptions": {
    "target": "es5",
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

---

## 3. Design System & Glassmorphism Styling Rules

Custom styling layers defined in `src/styles/globals.css` inject glassmorphism overlays and brand layouts.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #121215; /* brand.anthracite.900 */
    color: #F5F5F7;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
}

@layer utilities {
  /* Classic light-tint glassmorphism */
  .glass-light {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Dark brand glassmorphism, ideal for bottom navigation and cards */
  .glass-dark {
    background: rgba(20, 20, 25, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Interactive overlay cards */
  .glass-card {
    background: rgba(28, 28, 33, 0.5);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  }

  /* Electric orange glowing accent for active states */
  .orange-glow {
    box-shadow: 0 0 15px rgba(255, 90, 0, 0.25);
  }
}
```

---

## 4. `BottomNav.tsx` Implementation Plan

### 4.1. Interface Contract Specs
* **Tabs & Labels**: The navigation bar must display 5 tabs with exact labels:
  1. `Vola Vola` (Active tab state: `'vola-vola'`)
  2. `Soggiorna` (Active tab state: `'soggiorna'`)
  3. `Drops` (Active tab state: `'drops'`)
  4. `Salvati` (Active tab state: `'salvati'`)
  5. `Profilo` (Active tab state: `'profilo'`)
* **State Hook Integration**: Tab updates read from/write to global context hook `useAppState()` or client-side react state containing:
  ```typescript
  type TabType = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';
  ```

### 4.2. Layout Design
* Fixed to the bottom of the viewport: `fixed bottom-0 left-0 right-0 z-50`.
* Constrained to a mobile layout width: `max-w-md mx-auto w-full`.
* Outer container styled with glassmorphism `glass-dark px-4 pb-safe`.
* Inner layout arranged as `flex justify-around items-center h-20`.

### 4.3. Proposed React Component Skeleton

Below is the design plan for `src/components/BottomNav.tsx`:

```tsx
import React from 'react';
import { Plane, Bed, Sparkles, Heart, User } from 'lucide-react';
import { useAppState } from '@/context/AppState'; // Assumes state management in milestone 2/3

// Define type to match index.tsx contract
export type TabType = 'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo';

interface NavigationItem {
  id: TabType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const navigationItems: NavigationItem[] = [
  { id: 'vola-vola', label: 'Vola Vola', Icon: Plane },
  { id: 'soggiorna', label: 'Soggiorna', Icon: Bed },
  { id: 'drops', label: 'Drops', Icon: Sparkles },
  { id: 'salvati', label: 'Salvati', Icon: Heart },
  { id: 'profilo', label: 'Profilo', Icon: User },
];

const BottomNav: React.FC = () => {
  // Pull states from context. Mock fallback can be implemented for direct isolation tests
  const { activeTab, setActiveTab } = useAppState();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="max-w-md mx-auto w-full glass-dark rounded-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <ul className="flex justify-around items-center h-20 px-2">
          {navigationItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <li key={id} className="flex-1">
                <button
                  onClick={() => setActiveTab(id)}
                  className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 focus:outline-none"
                  aria-label={label}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'text-brand-orange bg-brand-orange/10 scale-110' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wider transition-colors duration-200 ${
                      isActive ? 'text-brand-orange' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default BottomNav;
```

---

## 5. Next Steps for Milestone 1 Execution
1. Run `create-next-app` scaffolding CLI to generate the workspace structure.
2. Replace configuration files (`package.json`, `tailwind.config.js`, `tsconfig.json`, `next.config.js`) with the specified templates.
3. Clean standard Next.js template artifacts in `src/pages` and create custom directories `src/components/`, `src/context/`, `src/styles/`.
4. Inject custom CSS classes and global rules to `src/styles/globals.css`.
5. Implement `BottomNav.tsx` component and verify layout using mock routing variables inside `src/pages/index.tsx`.
