import React from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const STORAGE_KEY = 'nomaq_cookie_notice';

export default function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Hydration-safe: decide visibility only after mount, reading localStorage
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'dismissed') {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. privacy mode): show the notice anyway
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // ignore: banner still hides for this session
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-3 right-3 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] lg:left-auto lg:right-6 lg:bottom-6 lg:max-w-sm z-[60] nomaq-card p-4 animate-slide-up"
      role="status"
      data-testid="cookie-banner"
    >
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-nomaq-indigo shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-xs text-slate-500 leading-relaxed flex-1">
          {t('cookieBannerText')}{' '}
          <Link href="/cookie-policy" className="text-nomaq-indigo font-semibold underline">
            {t('cookieBannerPolicy')}
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="bg-nomaq-indigo text-white text-xs font-semibold rounded-full px-4 py-2 shrink-0 transition-opacity hover:opacity-90"
          data-testid="cookie-banner-ok"
        >
          {t('cookieBannerOk')}
        </button>
      </div>
    </div>
  );
}
