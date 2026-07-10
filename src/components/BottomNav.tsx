import React from 'react';
import { Plane, Hotel, TrendingDown, Sparkles, User } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import { useRouter } from 'next/router';

// aria-label = etichetta visibile tradotta (WCAG 2.5.3 Label-in-Name): prima
// era una stringa fissa "per gli E2E" che per alcune tab divergeva dal testo a
// schermo (Drops→"Radar", Salvati→"Concierge"), confondendo gli screen reader.
const TABS: { id: TabId; displayLabelKey: TranslationKey; Icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }> }[] = [
  { id: 'vola-vola', displayLabelKey: 'navVolaVola', Icon: Plane },
  { id: 'soggiorna', displayLabelKey: 'navSoggiorna', Icon: Hotel },
  { id: 'drops', displayLabelKey: 'navDrops', Icon: TrendingDown },
  { id: 'concierge', displayLabelKey: 'navConcierge', Icon: Sparkles },
  { id: 'profilo', displayLabelKey: 'navProfilo', Icon: User },
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
        {TABS.map(({ id, displayLabelKey, Icon }) => {
          const displayLabel = t(displayLabelKey);
          const isActive = activeTab === id;
          const hasBadge = id === 'drops' && notificationsCount !== undefined && notificationsCount > 0;

          return (
            <button
              key={id}
              id={`nav-btn-${id}`}
              onClick={() => handleTabClick(id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200"
              aria-label={displayLabel}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`nav-${id}`}
            >
              <div className="relative flex flex-col items-center gap-0.5">
                <div
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isActive ? 'bg-nomaq-lavender' : ''
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-all duration-200 ${
                      isActive ? 'text-nomaq-indigo' : 'text-slate-500'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>

                {hasBadge && (
                  <span
                    className="absolute -top-0.5 -right-1 bg-[#C2410C] text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5"
                    data-testid="drops-badge"
                    aria-label={`${notificationsCount} notifiche`}
                  >
                    {notificationsCount}
                  </span>
                )}

                <span
                  className={`text-[9px] font-semibold transition-all duration-200 leading-none ${
                    isActive ? 'text-nomaq-indigo' : 'text-slate-500'
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

