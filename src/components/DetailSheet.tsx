import React from 'react';
import { X, Plane, Hotel, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import SmartImage from '@/components/SmartImage';
import { getDestinationImage } from '@/utils/destinationImages';

/**
 * Scheda dettaglio in-app aperta al tap su una card: mostra i dati completi e
 * SOLO alla fine il CTA "Prenota" (link esterno) — riduce la frizione del
 * window.open immediato, il pattern dei prodotti travel leader. Bottom-sheet su
 * mobile, modal centrato su desktop. Chiusura con Escape o click sul backdrop.
 */
export default function DetailSheet({ item, onClose }: { item: any | null; onClose: () => void }) {
  const { t } = useLanguage();

  React.useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const isHotel = item.type === 'hotel';
  const tag = (item.tag || '').replace(/^[^\w\s]+\s*/, '').trim();
  const discount = item.originalPrice && item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;
  const book = () => {
    if (item.booking_url) window.open(item.booking_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid="detail-sheet"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.destination}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full lg:max-w-lg bg-white rounded-t-[28px] lg:rounded-[28px] overflow-hidden shadow-[0_-10px_60px_rgba(0,0,0,0.35)] lg:shadow-[0_30px_80px_rgba(0,0,0,0.4)] max-h-[92vh] flex flex-col animate-slide-up"
      >
        <div className="relative h-52 lg:h-60 flex-shrink-0">
          <SmartImage
            src={item.image || getDestinationImage(item.destination, item.id || 'detail')}
            fallbackSrc={getDestinationImage(item.destination, item.id || 'detail')}
            alt={item.destination}
            sizes="(min-width: 1024px) 512px, 100vw"
            priority
          />
          <button
            onClick={onClose}
            aria-label={t('close')}
            data-testid="detail-close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm shadow-soft flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-nomaq-navy" />
          </button>
          {tag && <span className="nomaq-badge absolute top-3 left-3 bg-white/90 backdrop-blur-sm">{tag}</span>}
        </div>

        <div className="p-5 lg:p-6 overflow-y-auto flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-2xl text-nomaq-navy leading-tight">{item.destination}</h2>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                {isHotel ? <Hotel className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} /> : <Plane className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />}
                <span className="truncate">{isHotel ? (item.hotelName || item.country || '') : (item.airline || item.country || '')}</span>
              </p>
            </div>
            {item.rating != null && (
              <div className="flex items-center gap-1 text-sm flex-shrink-0">
                <Star className="w-4 h-4 fill-nomaq-indigo text-nomaq-indigo" />
                <span className="font-bold text-nomaq-indigo">{item.rating}</span>
              </div>
            )}
          </div>

          {item.description && <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>}

          <div className="flex items-end justify-between gap-3 mt-1 pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2 tabular-nums">
              {discount > 0 && <span className="text-slate-400 text-sm line-through">€{item.originalPrice}</span>}
              {item.price != null ? (
                <>
                  <span className="text-sm text-slate-400 font-medium self-center">{t('fromPrice')}</span>
                  <span className="text-3xl font-extrabold text-nomaq-navy leading-none">€{item.price}</span>
                  {isHotel && <span className="text-xs text-slate-400">{t('perNight')}</span>}
                </>
              ) : (
                <span className="text-lg font-bold text-nomaq-indigo">{t('searchNow')}</span>
              )}
            </div>
            <button
              onClick={book}
              data-testid="detail-book"
              className="btn-primary !rounded-xl flex items-center gap-2 text-sm flex-shrink-0"
            >
              {t('bookNow')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trasparenza prezzo: la tariffa mostrata è indicativa (deep-link
              affiliato); il totale reale lo conferma il partner. Evita il
              mismatch "prezzo card ≠ prezzo sul sito". */}
          <p className="text-[11px] text-slate-400 leading-snug">{t('priceDisclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
