import React from 'react';
import { TrendingDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/* ── Toast Notification ── */
export default function ToastNotification({ notif, onDismiss }: { notif: any; onDismiss: (id: string) => void }) {
  const { t } = useLanguage();
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(notif.id), 5000);
    return () => clearTimeout(timer);
  }, [notif.id, onDismiss]);

  return (
    <div
      className="nomaq-card border-l-4 border-nomaq-indigo rounded-2xl p-4 flex items-start gap-3 animate-slide-up"
      style={{ boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)' }}
      data-testid="notification-toast"
      data-id={notif.id}
    >
      <div className="w-9 h-9 bg-nomaq-lavender rounded-xl flex items-center justify-center flex-shrink-0">
        <TrendingDown className="w-5 h-5 text-nomaq-indigo" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-nomaq-indigo mb-0.5">⚡ {t('dropDetected')}</div>
        <div className="text-sm text-nomaq-navy font-medium leading-tight">{notif.message}</div>
      </div>
      <button
        data-testid={`toast-dismiss-${notif.id}`}
        onClick={() => onDismiss(notif.id)}
        className="text-slate-400 hover:text-nomaq-navy transition-colors text-xs mt-0.5"
      >
        ✕
      </button>
    </div>
  );
}
