import { TabId } from '@/context/AppState';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

/* Desktop top navbar */
export default function DesktopNav({ activeTab, onNavigate, isDarkBackground }: { activeTab: TabId; onNavigate: (id: TabId) => void; isDarkBackground?: boolean }) {
  const { t } = useLanguage();
  const items: { id: TabId; label: string }[] = [
    { id: 'vola-vola', label: t('navFlights') },
    { id: 'soggiorna', label: t('navSoggiorna') },
    { id: 'drops', label: t('navDrops') },
    { id: 'concierge', label: t('navConcierge') },
    { id: 'profilo', label: t('navProfilo') },
  ];
  return (
    <header
      className="hidden lg:block sticky top-0 z-40 bg-transparent backdrop-blur-md"
      data-testid="desktop-nav"
    >
      <div className="max-w-6xl mx-auto h-20 px-6 flex items-center justify-between">
        <img
          src="/images/logo.png"
          alt="Nomaq"
          className={`h-12 w-auto object-contain cursor-pointer ${isDarkBackground ? 'brightness-0 invert' : ''}`}
          onClick={() => onNavigate('vola-vola')}
        />
        <nav className="flex items-center gap-1" aria-label="Navigazione principale desktop">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-testid={`desktop-nav-${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-nomaq-lavender text-nomaq-indigo'
                    : isDarkBackground
                      ? 'text-white hover:bg-white/10 hover:text-white'
                      : 'text-nomaq-navy hover:bg-slate-50 hover:text-nomaq-indigo'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="ml-3">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
