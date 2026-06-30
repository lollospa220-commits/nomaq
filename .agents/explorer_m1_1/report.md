# Nomaq Milestone 1: Scaffolding & Design System - Analysis & Planning Report

## 1. Executive Summary
This report analyzes and plans **Milestone 1: Scaffolding & Design System** for the Nomaq project. It synthesizes findings from peer explorations (`explorer_m1_2` and `explorer_m1_3`), resolves architectural conflicts, and addresses critical gaps between the implementation track and the E2E testing track.

### Key Finding: E2E Selector Gap
During synthesis of the implementation and test scopes, a critical mismatch was identified: **peer reports omitted the exact `data-testid` selectors** required by the E2E track in `sub_orch_e2e/SCOPE.md`. This report explicitly incorporates these selectors (`data-testid="bottom-nav"` and `data-testid="nav-[tab-id]"`) into the `BottomNav` design to ensure seamless E2E verification from day one.

---

## 2. Next.js Pages Router Scaffolding

The project is initialized in the empty workspace `/Users/lorenzospavone/.gemini/antigravity/scratch/nomaq`. We recommend using the Next.js CLI to scaffold the project structure. This creates a standard Pages Router (`--no-app`), TypeScript, and Tailwind setup.

### Scaffolding Command
```bash
# Verify inside the directory
cd /Users/lorenzospavone/.gemini/antigravity/scratch/nomaq

# Scaffold Next.js Pages Router with TypeScript and Tailwind CSS using Next.js 14.2.4
npx create-next-app@14.2.4 . \
  --typescript \
  --tailwind \
  --eslint \
  --src-dir \
  --no-app \
  --import-alias "@/*" \
  --use-npm
```

### Directory Structure Layout
Following the scaffolding and cleaning up standard boilerplates, the workspace directory layout will be:
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

## 3. Recommended Configuration Files

### 3.1. `package.json`
Specifies stable dependencies for the Next.js environment, styling, icons, and UI state logic.
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

### 3.2. `tailwind.config.js`
Exposes design system colors for **Electric Orange** and **Anthracite Grey** as top-level utility classes rather than nested structures. This improves readability of JSX utility classes.
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
          DEFAULT: '#FF6B00', // Primary Brand Color
          dark: '#E05E00',
        },
        'anthracite-grey': {
          light: '#2E2E38',   // Borders / Secondary Backgrounds
          DEFAULT: '#1E1E24', // Card backgrounds
          dark: '#121216',    // Page Base Background
        },
      },
    },
  },
  plugins: [],
}
```

### 3.3. `next.config.js`
Optimized for standard Pages Router build and deployment.
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

### 3.4. `tsconfig.json`
Ensures TypeScript compiler handles path resolution matching the `@/*` mapping and strictly verifies types.
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

### 3.5. `postcss.config.js`
Enables styling pre-processing via Autoprefixer and Tailwind CSS.
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 4. Design System & Glassmorphism Styling Rules

Custom styling layers defined in `src/styles/globals.css` inject glassmorphism utilities and responsive base layouts.

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
  /* Classic light-tint glassmorphism for widgets and cards */
  .glassmorphism {
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  /* Dark brand glassmorphism, ideal for floating navigation overlays */
  .glassmorphism-dark {
    background-color: rgba(18, 18, 22, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Safe Area Padding support for modern iOS bottom indicators */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## 5. `BottomNav.tsx` Component Design & Implementation Plan

The bottom navigation bar coordinates client-side view switching. The design below integrates the exact active states, labels, and critical E2E testing hooks.

### Component Design Specification
* **Tab ID States**: `'vola-vola' | 'soggiorna' | 'drops' | 'salvati' | 'profilo'`
* **Exact UI Labels**: `Vola Vola`, `Soggiorna`, `Drops`, `Salvati`, `Profilo`
* **Test Attribute Compliance**:
  - Main nav container: `data-testid="bottom-nav"`
  - Individual nav tabs: `data-testid="nav-[tab-id]"` (e.g., `data-testid="nav-vola-vola"`)
* **State Hook Integration**: Active state is read from and written to `AppState.tsx` context using `useAppState()`.
* **Icons (Lucide React)**:
  - `Vola Vola` -> `Plane`
  - `Soggiorna` -> `Bed`
  - `Drops` -> `Bell` (Reconciled as preferred over Sparkles to represent alerts/drops; standard E2E expects a drop notification interaction)
  - `Salvati` -> `Heart`
  - `Profilo` -> `User`

### Proposed Code Skeleton
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
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glassmorphism-dark pb-safe"
      data-testid="bottom-nav"
    >
      <div className="mx-auto max-w-md h-16 flex items-center justify-around px-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={label}
              data-testid={`nav-${id}`}
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
                
                {/* Visual Active Indicator Dot/Line */}
                {isActive && (
                  <span className="absolute -bottom-1.5 w-4 h-0.5 rounded-full bg-electric-orange transition-all duration-200" />
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

## 6. Inter-Track Synthesis & Conflict Resolution

During synthesis, multiple architectural decisions were reconciled:

### 6.1. Reconciled Decisions
| Dimension | `explorer_m1_2` | `explorer_m1_3` | Consensus & Rationale |
|-----------|-----------------|-----------------|----------------------|
| **Next.js Version** | `14.2.0` | `14.2.4` | **`14.2.4`**: Standardizes on a newer stable Next 14 release to minimize router-specific edge cases. |
| **Theme Key Prefix** | `brand.orange` / `brand.anthracite` | `electric-orange` / `anthracite-grey` | **Flat Names (`electric-orange`, `anthracite-grey`)**: Flat configurations are much simpler to type inside standard JSX classes (`text-electric-orange` instead of `text-brand-orange-DEFAULT`). |
| **Drops Tab Icon** | `Sparkles` | `Bell` | **`Bell`**: Aligns with price drop notification logic (toast alerts, badge counts on the tab). |
| **E2E Selectors** | Omitted | Omitted | **Added `data-testid`**: Crucial to allow opaque-box tests to query the DOM structure as specified in `sub_orch_e2e/SCOPE.md`. |

### 6.2. Scaffolding Gaps
- **Verification Strategy**: The build test (`npm run build`) and ESLint (`npm run lint`) commands are standard validation tools. The implementation track should run them as part of milestone completion.
- **Mock State Fallback**: Since State is in development, a local React Context (`src/context/AppState.tsx`) must be set up in tandem with scaffolding the components, so that the `BottomNav` compilation does not break.
