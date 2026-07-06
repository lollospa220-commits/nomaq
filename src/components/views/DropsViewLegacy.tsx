import React from 'react';
import { ArrowDown, Calendar, Clock, MapPin, Sparkles, User, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const MOCK_DROPS = [
  {
    id: 'drop-1',
    destination: 'Bali → Milano',
    oldPrice: 620,
    newPrice: 389,
    dropPercent: 37,
    airline: 'Qatar Airways',
    date: 'Lug 12',
    timeAgo: '2 min fa',
    isNew: true,
  },
  {
    id: 'drop-2',
    destination: 'Roma → Tokyo',
    oldPrice: 890,
    newPrice: 541,
    dropPercent: 39,
    airline: 'ANA Airlines',
    date: 'Ago 5',
    timeAgo: '1 ora fa',
    isNew: true,
  },
  {
    id: 'drop-3',
    destination: 'Milano → Dubai',
    oldPrice: 420,
    newPrice: 245,
    dropPercent: 42,
    airline: 'Emirates',
    date: 'Ott 10',
    timeAgo: '3 ore fa',
    isNew: false,
  },
  {
    id: 'drop-4',
    destination: 'Roma → Lisbona',
    oldPrice: 180,
    newPrice: 89,
    dropPercent: 51,
    airline: 'TAP Portugal',
    date: 'Weekend',
    timeAgo: '5 ore fa',
    isNew: false,
  },
];

const getDropImage = (destination: string) => {
  const dest = destination.toLowerCase();
  if (dest.includes('bali')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop';
  }
  if (dest.includes('tokyo') || dest.includes('giappone') || dest.includes('japan')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop';
  }
  if (dest.includes('dubai')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop';
  }
  if (dest.includes('lisbona') || dest.includes('lisbon')) {
    return 'https://images.unsplash.com/photo-1501415201023-2f45fbcefac0?q=80&w=800&auto=format&fit=crop';
  }
  if (dest.includes('parigi') || dest.includes('paris')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop';
  }
  if (dest.includes('barcellona') || dest.includes('barcelona')) {
    return 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop';
};

function DropMagazineCard({ drop, isFeatured = false }: { drop: any; isFeatured?: boolean }) {
  const imageUrl = getDropImage(drop.destination);
  const dropAmount = drop.oldPrice - drop.newPrice;

  return (
    <div 
      className="group w-full h-56 rounded-3xl overflow-hidden relative cursor-pointer shadow-[0_10px_34px_rgba(15,23,42,0.22)] hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out"
      data-testid={isFeatured ? undefined : `drop-item-${drop.id}`}
      role="button"
      tabIndex={0}
      aria-label={drop.destination}
      onClick={() => {
        window.open('https://www.google.com/flights', '_blank', 'noopener,noreferrer');
      }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open('https://www.google.com/flights', '_blank', 'noopener,noreferrer'); } }}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={drop.destination}
        className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      
      {/* Dark overlay gradient (higher contrast) */}
      <div className="bg-gradient-to-t from-black/80 via-black/25 to-transparent absolute inset-0 z-0" />

      {/* Top Left Badge */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="bg-white/90 backdrop-blur-sm text-nomaq-indigo font-bold rounded-lg px-2.5 py-1 text-xs shadow-sm">
          Drop €{dropAmount}
        </span>
        <span className="bg-nomaq-navy/85 backdrop-blur-sm text-white font-bold rounded-lg px-2.5 py-1 text-xs shadow-sm">
          -{drop.dropPercent}%
        </span>
      </div>

      {/* Bottom Content Overlay */}
      <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-4">
        {/* Left Side: Destination & details */}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white mb-0.5 truncate">{drop.destination}</h2>
          <p className="text-slate-300 text-xs truncate">
            {drop.airline || 'Airline'} • {drop.date || 'Flexible'} • {drop.timeAgo || 'Just now'}
          </p>
        </div>

        {/* Right Side: Price details */}
        <div className="text-right flex-shrink-0">
          <div className="text-slate-400 text-xs line-through leading-none mb-1">€{drop.oldPrice}</div>
          <div className="text-2xl font-extrabold text-white leading-none [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">€{drop.newPrice}</div>
        </div>
      </div>
    </div>
  );
}

const MOCK_FEATURED_DROP = {
  id: 'drop-featured',
  destination: 'Parigi → New York',
  oldPrice: 550,
  newPrice: 299,
  dropPercent: 45,
  airline: 'Air France',
  date: 'Ott 22',
  timeAgo: '10 min fa',
  isNew: true,
};

function DropsView({ simulatedDrops, isE2E, onSimulateDrop }: { simulatedDrops: any[]; isE2E?: boolean; onSimulateDrop: () => void }) {
  const { t } = useLanguage();
  const allDrops = isE2E ? simulatedDrops : [...simulatedDrops, ...MOCK_DROPS];

  return (
    <div className="px-5 pb-4 animate-fade-in" data-testid="drops-view">
      {/* Header with Zap trigger */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg text-nomaq-navy mb-1">Radar</h1>
          <p className="text-slate-500 text-sm">{t('dropsSubtitle')}</p>
        </div>
        <button
          data-testid="debug-price-drop"
          onClick={onSimulateDrop}
          className="w-10 h-10 bg-electric-orange text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none"
          title="Simulate a Price Drop"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Filter pills (Interactive buttons) */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <span className="nomaq-pill cursor-default flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-nomaq-indigo" />
          {t('fromNaples')}
        </span>
        <span className="nomaq-pill cursor-default flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-nomaq-indigo" />
          {t('anyMonth')}
        </span>
        <span className="nomaq-pill cursor-default flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-nomaq-indigo" />
          {t('oneTraveler')}
        </span>
      </div>

      {/* Featured "Picked for you" */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-nomaq-indigo" />
          <h2 className="font-display text-lg text-nomaq-navy">{t('pickedForYou')}</h2>
        </div>
        <DropMagazineCard drop={MOCK_FEATURED_DROP} isFeatured={true} />
      </div>

      {/* "Just dropped now" list */}
      <div className="mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-nomaq-indigo" />
        <h2 className="font-display text-lg text-nomaq-navy">{t('justDroppedNow')}</h2>
      </div>

      <div className="space-y-4" data-testid="drops-history-list">
        {allDrops.length === 0 ? (
          <div className="text-center py-12" data-testid="drops-empty">
            <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ArrowDown className="w-8 h-8 text-nomaq-indigo/40" />
            </div>
            <p className="text-slate-500 font-medium">{t('noDropsYet')}</p>
            <p className="text-slate-400 text-sm mt-1">{t('radarListening')}</p>
          </div>
        ) : (
          allDrops.map((drop) => (
            <DropMagazineCard key={drop.id} drop={drop} />
          ))
        )}
      </div>

      {/* Footer */}
      {allDrops.length > 0 && (
        <div className="flex justify-center mt-6 mb-2">
          <p className="text-slate-400 text-xs flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-nomaq-indigo/70" /> {t('dropsFooter')}</p>
        </div>
      )}
    </div>
  );
}

export default DropsView;
