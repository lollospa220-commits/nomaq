import React from 'react';
import { Plane, Hotel, TrendingDown, Bookmark, User } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';

const TABS: { id: TabId; label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }> }[] = [
  { id: 'vola-vola', label: 'Vola Vola', Icon: Plane },
  { id: 'soggiorna', label: 'Soggiorna', Icon: Hotel },
  { id: 'drops', label: 'Drops', Icon: TrendingDown },
  { id: 'salvati', label: 'Salvati', Icon: Bookmark },
  { id: 'profilo', label: 'Profilo', Icon: User },
];

interface BottomNavProps {
  activeTab?: TabId;
  notificationsCount?: number;
}

export default function BottomNav({ activeTab: propActiveTab, notificationsCount }: BottomNavProps = {}) {
  const [contextActiveTab, setContextActiveTab] = React.useState<TabId>('vola-vola');

  let activeTabFromContext: TabId = 'vola-vola';
  let setActiveTabFn: (tab: TabId) => void = setContextActiveTab;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const state = useAppState();
    activeTabFromContext = state.activeTab;
    setActiveTabFn = state.setActiveTab;
  } catch {
    // Outside of AppStateProvider — use local state (for standalone testing)
  }

  const activeTab = propActiveTab ?? activeTabFromContext;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav pb-safe glassmorphism"
      data-testid="bottom-nav"
      role="navigation"
      aria-label="Navigazione principale"
    >
      <div className="mx-auto max-w-md h-[60px] flex items-center justify-around px-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const hasBadge = id === 'drops' && notificationsCount !== undefined && notificationsCount > 0;

          return (
            <button
              key={id}
              id={`nav-btn-${id}`}
              onClick={() => setActiveTabFn(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`nav-${id}`}
            >
              <div className="relative flex flex-col items-center gap-0.5">
                <div
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-nomaq-lavender'
                      : ''
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-all duration-200 ${
                      isActive ? 'text-nomaq-indigo' : 'text-slate-400'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>

                {hasBadge && (
                  <span
                    className="absolute -top-0.5 -right-1 bg-electric-orange text-white text-[8px] font-black min-w-[15px] h-[15px] flex items-center justify-center rounded-full px-0.5"
                    data-testid="drops-badge"
                    aria-label={`${notificationsCount} notifiche`}
                  >
                    {notificationsCount}
                  </span>
                )}

                <span
                  className={`text-[9px] font-semibold transition-all duration-200 leading-none ${
                    isActive ? 'text-nomaq-indigo' : 'text-slate-400'
                  }`}
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
