import React from 'react';
import { Heart, Plane, Hotel } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import SmartImage from '@/components/SmartImage';
import { getDestinationImage } from '@/utils/destinationImages';

/* ── Feed Card ── */
const FeedCard = React.memo(function FeedCard({
  item,
  isSaved,
  onToggleSave,
  onOpenDetail,
}: {
  item: any;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetail?: (item: any) => void;
}) {
  const { t } = useLanguage();
  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  const rawTag = item.tag || '';
  const cleanTag = rawTag.replace(/^[^\w\s]+\s*/, '').trim();

  return (
    <div
      className="feed-card backdrop-blur-md animate-slide-up rounded-2xl cursor-pointer flex flex-col overflow-hidden w-full h-full group"
      data-testid="feed-item"
      data-id={item.id}
      role="button"
      tabIndex={0}
      aria-label={item.price != null ? `${item.destination} — €${item.price}` : item.destination}
      onClick={() => {
        if (onOpenDetail) { onOpenDetail(item); return; }
        if (item.booking_url) window.open(item.booking_url, '_blank', 'noopener,noreferrer');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onOpenDetail) { onOpenDetail(item); return; }
          if (item.booking_url) window.open(item.booking_url, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {/* Image (Top half) — zoom lento su hover, cifra tipica dei siti premium */}
      <div className="relative w-full h-28 lg:h-44 flex-shrink-0 overflow-hidden">
        <SmartImage
          src={item.image || getDestinationImage(item.destination, item.id || 'item')}
          fallbackSrc={getDestinationImage(item.destination, item.id || 'item')}
          alt={item.destination}
          sizes="(min-width: 1024px) 300px, 45vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {/* Save button */}
        <button
          data-testid="save-button"
          data-id={item.id}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          // Ferma Invio/Spazio dal risalire al card handler (che aprirebbe il
          // DetailSheet): così il bottone si attiva normalmente e salva.
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
          aria-label={isSaved ? 'Rimuovi dai preferiti' : 'Salva nei preferiti'}
          className={`absolute top-2 left-2 w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 ${
            isSaved ? 'bg-nomaq-lavender' : 'bg-white/85 backdrop-blur-sm'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${isSaved ? 'text-nomaq-violet fill-nomaq-violet' : 'text-slate-500'}`}
            strokeWidth={1.5}
          />
        </button>
        {/* Tag in overlay sull'immagine: il titolo sotto resta a piena larghezza
            (a 375px badge+titolo sulla stessa riga spezzavano "Weekend a…") */}
        {cleanTag && (
          <span className="nomaq-badge absolute top-2 right-2 bg-white/90 backdrop-blur-sm">{cleanTag}</span>
        )}
      </div>

      {/* Content (Bottom half) */}
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0 bg-white/80">
        {/* Row 1: titolo a piena larghezza (il tag vive sull'immagine) */}
        <div className="mb-1 min-h-[36px] lg:min-h-0">
          <h3 className="text-sm lg:text-base font-semibold text-nomaq-navy leading-snug line-clamp-2">{item.destination}</h3>
        </div>

        {/* Row 2: Descriptive text / Flight details */}
        <p className="text-xs text-slate-500 leading-snug line-clamp-2 mb-2.5 min-h-[32px]">{item.description}</p>

        {/* Row 3 (Footer): Country/Airline (left) and Prices (right) */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate flex-1 pr-1">
            {item.type === 'flight' ? (
              <>
                <Plane className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="truncate">{item.airline || 'Airline'}</span>
              </>
            ) : (
              <>
                <Hotel className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="truncate">{item.hotelName || item.country}</span>
              </>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 flex-shrink-0 tabular-nums">
            {discount > 0 && (
              <span className="text-slate-400 text-[11px] line-through">€{item.originalPrice}</span>
            )}
            <span className="text-nomaq-indigo font-semibold text-sm">{item.price != null ? `€${item.price}` : t('searchNow')}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FeedCard;

// Skeleton della FeedCard (stessa forma) mostrato durante la ricerca: usa la
// classe .shimmer (già in CSS, prima inutilizzata) per un caricamento percepito
// più veloce, come sui prodotti travel leader.
export function FeedCardSkeleton() {
  return (
    <div className="feed-card rounded-2xl overflow-hidden w-full h-full flex flex-col" aria-hidden="true">
      <div className="w-full h-28 lg:h-44 flex-shrink-0 shimmer" />
      <div className="flex-1 p-3.5 flex flex-col gap-2 bg-white/80">
        <div className="h-3.5 w-3/4 rounded shimmer" />
        <div className="h-2.5 w-full rounded shimmer" />
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="h-2.5 w-1/3 rounded shimmer" />
          <div className="h-3 w-10 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}
