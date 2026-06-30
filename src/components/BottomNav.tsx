import React from 'react';
import { Plane, Hotel, TrendingDown, Bookmark, User } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';

const TABS: { id: TabId; label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
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
      <div className="mx-auto max-w-md h-16 flex items-center justify-around px-2">
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
                  className={`p-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-electric-orange/10' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? 'text-electric-orange' : 'text-anthracite-grey/50'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {hasBadge && (
                  <span
                    className="absolute -top-0.5 -right-0.5 bg-electric-orange text-white text-[9px] font-black min-w-[16px] h-4 flex items-center justify-center rounded-full px-1"
                    data-testid="drops-badge"
                    aria-label={`${notificationsCount} notifiche`}
                  >
                    {notificationsCount}
                  </span>
                )}

                <span
                  className={`text-[9px] font-semibold transition-all duration-200 leading-none ${
                    isActive ? 'text-electric-orange' : 'text-anthracite-grey/40'
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
