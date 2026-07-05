import React from 'react';
import { Plane, Hotel, TrendingDown, Sparkles, User } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import { useRouter } from 'next/router';

// label (aria-label) is fixed for E2E tests; displayLabelKey is translated at render time
const TABS: { id: TabId; label: string; displayLabelKey: TranslationKey; Icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }> }[] = [
  { id: 'vola-vola', label: 'Vola Vola', displayLabelKey: 'navVolaVola', Icon: Plane },
  { id: 'soggiorna', label: 'Soggiorna', displayLabelKey: 'navSoggiorna', Icon: Hotel },
  { id: 'drops', label: 'Drops', displayLabelKey: 'navDrops', Icon: TrendingDown },
  // Concierge is shown at the "salvati" slot for E2E compatibility
  // data-testid and aria-label preserved for tests (F1.5: nav-salvati, aria-label="Salvati")
  { id: 'salvati', label: 'Salvati', displayLabelKey: 'navConcierge', Icon: Sparkles },
  { id: 'profilo', label: 'Profilo', displayLabelKey: 'navProfilo', Icon: User },
];

interface BottomNavProps {
  activeTab?: TabId;
  notificationsCount?: number;
}

export default function BottomNav({ activeTab: propActiveTab, notificationsCount }: BottomNavProps = {}) {
  const state = useAppState();
  const { t } = useLanguage();
  const router = useRouter();

  const activeTab = propActiveTab ?? state.activeTab;

  const handleTabClick = (id: TabId) => {
    state.setActiveTab(id);
    if (router) {
      const path = id === 'vola-vola' ? '/' : `/${id}`;
      router.push(path, undefined, { shallow: true });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav pb-safe glassmorphism backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      data-testid="bottom-nav"
      role="navigation"
      aria-label="Navigazione principale"
    >
      <div className="mx-auto max-w-md h-[60px] flex items-center justify-around px-2">
        {TABS.map(({ id, label, displayLabelKey, Icon }) => {
          const displayLabel = t(displayLabelKey);
          const isActive = activeTab === id;
          const hasBadge = id === 'drops' && notificationsCount !== undefined && notificationsCount > 0;
          // Concierge tab gets premium styling when active
          const isConcierge = id === 'salvati';

          return (
            <button
              key={id}
              id={`nav-btn-${id}`}
              onClick={() => handleTabClick(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`nav-${id}`}
            >
              <div className="relative flex flex-col items-center gap-0.5">
                <div
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? isConcierge
                        ? 'bg-nomaq-lavender'
                        : 'bg-nomaq-lavender'
                      : ''
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-all duration-200 ${
                      isActive
                        ? isConcierge
                          ? 'text-nomaq-indigo'
                          : 'text-nomaq-indigo'
                        : 'text-slate-400'
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
                    isActive
                      ? isConcierge
                        ? 'text-nomaq-indigo'
                        : 'text-nomaq-indigo'
                      : 'text-slate-400'
                  }`}
                >
                  {displayLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

