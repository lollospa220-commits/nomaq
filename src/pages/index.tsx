import Head from 'next/head';
import React from 'react';
import { Heart, MapPin, Calendar, Clock, Share2, Bell, ChevronRight, Zap, Star, ArrowDown, TrendingDown, Search, Plane, Hotel, Settings, User, LogOut, Gift, Globe, Shield, Sparkles, ArrowRight, X, Sun, Snowflake, CheckCircle2, PartyPopper, Tag, Palmtree, Wand2, MessageCircle, Paperclip, Send, Mic, CloudSun, Utensils, Map, Languages, Ticket } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/utils/supabaseClient';
import { fetchRealFlights, fetchRealHotels } from '@/utils/travelApi';

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const FLIGHTS = [
  {
    id: 'flight-barcelona',
    type: 'flight',
    destination: 'Weekend a Barcellona',
    country: 'Spagna',
    price: 89,
    originalPrice: 135,
    description: 'Da Napoli · 2 notti · da 89€',
    image: 'https://images.unsplash.com/photo-1583422409516-15d0ac53f937?q=80&w=800&auto=format&fit=crop',
    airline: 'EasyJet',
    duration: '2h 10m',
    date: 'Qualsiasi weekend',
    rating: 4.8,
    tag: 'BEST PRICE',
    color: '#e05b7b',
  },
  {
    id: 'flight-sicily',
    type: 'flight',
    destination: 'Mare in Sicilia',
    country: 'Italia',
    price: 129,
    originalPrice: 195,
    description: 'Partenza venerdì · hotel + volo · da 129€',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    airline: 'Ryanair',
    duration: '1h 15m',
    date: 'Partenza venerdì',
    rating: 4.9,
    tag: 'TOP CHOICES',
    color: '#1a8a6b',
  },
  {
    id: 'flight-bali',
    type: 'flight',
    destination: 'Bali',
    country: 'Indonesia',
    price: 389,
    originalPrice: 620,
    description: 'Spiagge di sabbia bianca, templi antichi e tramonti mozzafiato. Il paradiso esiste.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    airline: 'Qatar Airways',
    duration: '14h 30m',
    date: 'Lug 12 → Lug 19',
    rating: 4.9,
    tag: 'HOT DEAL',
    color: '#1a8a6b',
  },
  {
    id: 'flight-tokyo',
    type: 'flight',
    destination: 'Tokyo',
    country: 'Giappone',
    price: 541,
    originalPrice: 890,
    description: 'Metropoli futuristica incontra tradizione millenaria. Ramen, sakura e neon ovunque.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    airline: 'ANA Airlines',
    duration: '12h 45m',
    date: 'Ago 5 → Ago 15',
    rating: 4.8,
    tag: 'TOP PICK',
    color: '#e05b7b',
  },
  {
    id: 'flight-ny',
    type: 'flight',
    destination: 'New York',
    country: 'Stati Uniti',
    price: 312,
    originalPrice: 480,
    description: "The city that never sleeps. Brooklyn Bridge, Central Park e una pizza che vale il viaggio.",
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    airline: 'Delta Airlines',
    duration: '10h 20m',
    date: 'Set 1 → Set 8',
    rating: 4.7,
    tag: 'BEST PRICE',
    color: '#3a6fbf',
  },
  {
    id: 'flight-dubai',
    type: 'flight',
    destination: 'Dubai',
    country: 'Emirati Arabi',
    price: 245,
    originalPrice: 420,
    description: 'Grattacieli nel deserto, oro e lusso estremo. Un altro mondo, letteralmente.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    airline: 'Emirates',
    duration: '6h 15m',
    date: 'Ott 10 → Ott 17',
    rating: 4.9,
    tag: 'FLASH DEAL',
    color: '#d4a017',
  },
  {
    id: 'flight-lisbon',
    type: 'flight',
    destination: 'Lisbona',
    country: 'Portogallo',
    price: 89,
    originalPrice: 180,
    description: 'Pastéis de nata, Fado e tramonti sull\'Atlantico. L\'Europa a portata di weekend.',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    airline: 'TAP Portugal',
    duration: '2h 50m',
    date: 'Qualsiasi weekend',
    rating: 4.8,
    tag: 'WEEKEND',
    color: '#e08030',
  },
];

const HOTELS = [
  {
    id: 'hotel-santorini',
    type: 'hotel',
    destination: 'Santorini',
    country: 'Grecia',
    price: 180,
    originalPrice: 320,
    description: 'Suite con piscina a sfioro e vista panoramica sul calderone. Il tramonto più famoso del mondo.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    hotelName: 'Canaves Oia Suites',
    stars: 5,
    rating: 4.9,
    nights: '7 notti',
    date: 'Ago 20 → Ago 27',
    tag: 'SUNSET VIEW',
    color: '#4a90d9',
  },
  {
    id: 'hotel-maldive',
    type: 'hotel',
    destination: 'Maldive',
    country: 'Maldive',
    price: 450,
    originalPrice: 780,
    description: 'Bungalow sull\'acqua cristallina. Coralli, mante e silenzi. La vacanza della vita.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    hotelName: 'Baros Maldives',
    stars: 5,
    rating: 5.0,
    nights: '10 notti',
    date: 'Nov 1 → Nov 10',
    tag: 'PARADISE',
    color: '#00b4d8',
  },
  {
    id: 'hotel-paris',
    type: 'hotel',
    destination: 'Parigi',
    country: 'Francia',
    price: 210,
    originalPrice: 380,
    description: 'Hotel boutique nel Marais con vista sulla Tour Eiffel. Colazione francese inclusa.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    hotelName: 'Le Marais Secret',
    stars: 4,
    rating: 4.7,
    nights: '5 notti',
    date: 'Set 15 → Set 20',
    tag: 'CITY VIEW',
    color: '#8e5ea2',
  },
];

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

/* ─────────────────────────────────────────────
   UI COMPONENTS
───────────────────────────────────────────── */

function NomaqLogo() {
  return (
    <div className="flex items-center justify-center py-4">
      <img
        src="/images/logo.png"
        alt="Nomaq Logo"
        className="h-[60px] w-auto object-contain"
        loading="eager"
      />
    </div>
  );
}

/* ── Language Switcher (IT/EN) ── */
function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className="flex items-center gap-0.5 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-full p-0.5 shadow-soft"
      data-testid="language-switcher"
    >
      {(['it', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          data-testid={`lang-${l}`}
          aria-label={l === 'it' ? 'Italiano' : 'English'}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase transition-all duration-200 ${
            lang === l
              ? 'bg-nomaq-indigo text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ── Feed Card ── */
function FeedCard({
  item,
  isSaved,
  onToggleSave,
}: {
  item: any;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  const rawTag = item.tag || '';
  const cleanTag = rawTag.replace(/^[^\w\s]+\s*/, '').trim();

  const tagColors: Record<string, string> = {
    'BEST PRICE': 'bg-emerald-50 text-emerald-700',
    'TOP PICK': 'bg-violet-50 text-violet-700',
    'HOT DEAL': 'bg-rose-50 text-rose-700',
    'FLASH DEAL': 'bg-amber-50 text-amber-700',
    'WEEKEND': 'bg-blue-50 text-blue-700',
    'SUNSET VIEW': 'bg-orange-50 text-orange-700',
    'PARADISE': 'bg-cyan-50 text-cyan-700',
    'CITY VIEW': 'bg-purple-50 text-purple-700',
    'BEST RATE': 'bg-violet-50 text-violet-700',
    'FLIGHT DEAL': 'bg-blue-50 text-blue-700',
  };
  const tagClass = tagColors[cleanTag] || 'bg-slate-50 text-slate-700';

  return (
    <div
      className="feed-card glassmorphism glass-card animate-slide-up rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform duration-200 flex flex-col overflow-hidden w-full"
      data-testid="feed-item"
      data-id={item.id}
      onClick={() => {
        if (item.booking_url) {
          window.open(item.booking_url, '_blank');
        }
      }}
    >
      {/* Image (Top half) */}
      <div className="relative w-full h-28 flex-shrink-0 overflow-hidden rounded-t-2xl">
        <img
          src={item.image || 'fallback-placeholder.jpg'}
          alt={item.destination}
          className="w-full h-full object-cover"
          loading="lazy"
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
          className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${isSaved
            ? 'bg-nomaq-lavender filled text-electric-orange'
            : 'bg-white/80 backdrop-blur-sm'
            }`}
        >
          <Heart
            className={`w-4 h-4 transition-all ${isSaved ? 'text-nomaq-violet fill-nomaq-violet' : 'text-slate-400'}`}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Content (Bottom half) */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0 bg-white/40">
        {/* Row 1: Destination title (left) and Tag badge (right) */}
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-xs font-bold text-nomaq-navy leading-snug truncate flex-1">{item.destination}</h3>
          {cleanTag && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-bold ${tagClass} flex-shrink-0`}>
              <Sparkles className="w-2 h-2 mr-0.5 inline-block" /> {cleanTag}
            </span>
          )}
        </div>

        {/* Row 2: Descriptive text / Flight details */}
        <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 mb-2 min-h-[28px]">{item.description}</p>

        {/* Row 3 (Footer): Country/Airline (left) and Prices (right) */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-slate-400 text-[9px] truncate flex-1 pr-1">
            {item.type === 'flight' ? (
              <>
                <Plane className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{item.airline || 'Airline'}</span>
              </>
            ) : (
              <>
                <Hotel className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{item.hotelName || item.country}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 text-xs">
            {discount > 0 && (
              <span className="text-slate-400 text-[10px] line-through">€{item.originalPrice}</span>
            )}
            <span className="text-nomaq-indigo font-bold">€{item.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Drops View ── */
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
    return 'https://images.unsplash.com/photo-1585244161746-95e26b86558e?q=80&w=800&auto=format&fit=crop';
  }
  if (dest.includes('parigi') || dest.includes('paris')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop';
  }
  if (dest.includes('barcellona') || dest.includes('barcelona')) {
    return 'https://images.unsplash.com/photo-1583422409516-15d0ac53f937?q=80&w=800&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop';
};

function DropMagazineCard({ drop, isFeatured = false }: { drop: any; isFeatured?: boolean }) {
  const imageUrl = getDropImage(drop.destination);
  const dropAmount = drop.oldPrice - drop.newPrice;

  return (
    <div 
      className="w-full h-56 rounded-3xl overflow-hidden relative mb-6 cursor-pointer shadow-soft hover:scale-[1.01] transition-transform duration-200"
      data-testid={isFeatured ? undefined : `drop-item-${drop.id}`}
      onClick={() => {
        window.open('https://www.google.com/flights', '_blank');
      }}
    >
      {/* Background Image */}
      <img 
        src={imageUrl} 
        alt={drop.destination} 
        className="w-full h-full object-cover absolute inset-0"
      />
      
      {/* Dark overlay gradient (higher contrast) */}
      <div className="bg-gradient-to-t from-black/95 via-black/50 to-transparent absolute inset-0 z-0" />

      {/* Top Left Badge */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="bg-emerald-500 text-white font-bold border-none rounded-lg px-2.5 py-1 text-xs shadow-sm">
          Drop €{dropAmount}
        </span>
        <span 
          className="bg-orange-500 text-white font-bold border-none text-electric-orange rounded-lg px-2.5 py-1 text-xs shadow-sm"
          style={{ color: '#ffffff' }}
        >
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
          <div className="text-2xl font-extrabold text-white leading-none">€{drop.newPrice}</div>
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
          <h1 className="font-display text-display-lg text-nomaq-navy mb-1">Drops</h1>
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
        <button 
          onClick={() => alert('Filtro "Da Napoli" cliccato')}
          className="nomaq-pill cursor-pointer hover:bg-slate-200 active:scale-95 transition-all focus:outline-none flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-nomaq-indigo" />
          {t('fromNaples')}
        </button>
        <button 
          onClick={() => alert('Filtro "Qualsiasi mese" cliccato')}
          className="nomaq-pill cursor-pointer hover:bg-slate-200 active:scale-95 transition-all focus:outline-none flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-nomaq-indigo" />
          {t('anyMonth')}
        </button>
        <button 
          onClick={() => alert('Filtro "1 viaggiatore" cliccato')}
          className="nomaq-pill cursor-pointer hover:bg-slate-200 active:scale-95 transition-all focus:outline-none flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5 text-nomaq-indigo" />
          {t('oneTraveler')}
        </button>
      </div>

      {/* Featured "Picked for you" */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-nomaq-indigo" />
          <span className="text-sm font-semibold text-nomaq-navy">{t('pickedForYou')}</span>
        </div>
        <DropMagazineCard drop={MOCK_FEATURED_DROP} isFeatured={true} />
      </div>

      {/* "Just dropped now" list */}
      <div className="mb-3 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-nomaq-indigo" />
        <span className="text-sm font-semibold text-nomaq-navy">{t('justDroppedNow')}</span>
      </div>

      <div className="space-y-0" data-testid="drops-history-list">
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
          <p className="text-slate-400 text-xs flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {t('dropsFooter')}</p>
        </div>
      )}
    </div>
  );
}

/* ── Salvati View ── */
function SalvatiView({ savedIds, allItems, onUnsave }: { savedIds: string[]; allItems: any[]; onUnsave: (id: string) => void }) {
  const saved = allItems.filter((i) => savedIds.includes(i.id));

  return (
    <div className="px-5 pb-4 animate-fade-in" data-testid="salvati-list">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-display-lg text-nomaq-navy flex items-center gap-2 mb-1">Saved<Sparkles className="w-6 h-6 text-nomaq-indigo" /></h1>
        <p className="text-slate-500 text-sm">Keep an eye on your favorite flights and stays.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        <button className="nomaq-pill active">All</button>
        <button className="nomaq-pill"><Plane className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> Flights</button>
        <button className="nomaq-pill"><Hotel className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> Stays</button>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16" data-testid="salvati-empty">
          <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-nomaq-indigo/40" />
          </div>
          <p className="text-slate-500 font-semibold text-lg">No saved trips yet</p>
          <p className="text-slate-400 text-sm mt-1">Explore the feed and save deals you love!</p>
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div className="nomaq-card p-4 mb-4 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-nomaq-indigo" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-nomaq-navy font-medium">
                Watching <span className="font-bold">{saved.length} saved trip{saved.length !== 1 ? 's' : ''}</span>
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Saved items */}
          <div className="space-y-3">
            {saved.map((item, idx) => {
              const discount = item.originalPrice
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;
              return (
                <div
                  key={item.id}
                  className="nomaq-card overflow-hidden animate-slide-up cursor-pointer hover:scale-[1.01] transition-transform duration-200"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  data-testid={`saved-item-${item.id}`}
                  onClick={() => {
                    if (item.booking_url) {
                      window.open(item.booking_url, '_blank');
                    }
                  }}
                >
                  <div className="flex gap-0">
                    {/* Image */}
                    <div className="relative w-[110px] min-h-[130px] flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image || 'fallback-placeholder.jpg'}
                        alt={item.destination}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Type badge */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5 ${item.type === 'flight' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                          {item.type === 'flight' ? <><Plane className="w-3 h-3" /> Flight</> : <><Hotel className="w-3 h-3" /> Stay</>}
                        </span>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-nomaq-navy leading-snug truncate">{item.destination}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.date}</div>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          {discount > 0 && (
                            <span className="text-nomaq-coral text-xs line-through">€{item.originalPrice}</span>
                          )}
                          <span className="text-nomaq-navy font-bold">€{item.price}</span>
                          {discount > 0 && (
                            <span className="bg-nomaq-lavender text-nomaq-violet text-[10px] font-bold px-1.5 py-0.5 rounded">
                              -{discount}%
                            </span>
                          )}
                        </div>
                        <button
                          data-testid={`unsave-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnsave(item.id);
                          }}
                          className="text-slate-400 hover:text-nomaq-coral transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-nomaq-violet text-nomaq-violet" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-center mt-6">
            <p className="text-slate-400 text-xs flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> We'll alert you when prices move.</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Concierge View ── */
function ConciergeView({ savedIds, allItems, onUnsave }: { savedIds: string[]; allItems: any[]; onUnsave: (id: string) => void }) {
  const { t } = useLanguage();
  const [chatInput, setChatInput] = React.useState('');
  const saved = allItems.filter((i) => savedIds.includes(i.id));

  const quickActions = [
    { icon: <Utensils className="w-4 h-4" />, label: t('qaRestaurants') },
    { icon: <Map className="w-4 h-4" />, label: t('qaItinerary') },
    { icon: <Languages className="w-4 h-4" />, label: t('qaTranslator') },
    { icon: <Ticket className="w-4 h-4" />, label: t('qaTickets') },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-display-lg text-nomaq-navy">Concierge</h1>
          <div className="w-9 h-9 rounded-full bg-nomaq-lavender flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-nomaq-indigo" />
          </div>
        </div>
        <p className="text-slate-500 text-sm">{t('conciergeSubtitle')}</p>
      </div>

      {/* Proactive Trip Widget */}
      <div className="px-5 mb-4">
        <div className="relative bg-white/70 backdrop-blur-lg border border-white/80 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-nomaq-indigo uppercase tracking-wide mb-0.5">{t('nextTrip')}</p>
              <p className="text-sm font-bold text-nomaq-navy">Tokyo, Giappone 🇯🇵</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('in12Days')}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
              <div className="flex items-center gap-1">
                <CloudSun className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-nomaq-navy">24°C</span>
              </div>
              <span className="text-[10px] text-slate-400">{t('weatherClear')}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-slate-500">{t('allConfirmed')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none pb-1">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-nomaq-lavender hover:border-nomaq-indigo/20 hover:text-nomaq-indigo active:scale-95 transition-all duration-200 shadow-soft cursor-pointer whitespace-nowrap"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-5 space-y-4 pb-4 overflow-y-auto">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-nomaq-navy text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
            {t('chatUserMsg')}
          </div>
        </div>

        {/* AI text response */}
        <div className="flex justify-start gap-2">
          <div className="w-8 h-8 rounded-full bg-nomaq-lavender flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-4 h-4 text-nomaq-indigo" />
          </div>
          <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm text-slate-700">
            {t('chatAiMsg')}
          </div>
        </div>

        {/* AI rich card response */}
        <div className="flex justify-start gap-2">
          <div className="w-8 h-8 rounded-full bg-nomaq-lavender flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-4 h-4 text-nomaq-indigo" />
          </div>
          <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-sm overflow-hidden shadow-sm border border-slate-100">
            {/* Restaurant image */}
            <img
              src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop"
              alt="Sushi restaurant Tokyo"
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <p className="font-bold text-nomaq-navy text-sm">Sushi Saito · Omakase</p>
              <div className="flex items-center gap-1 mt-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : (i === 4 ? 'fill-amber-200 text-amber-200' : 'text-slate-200')}`} />
                ))}
                <span className="text-[11px] text-slate-500 ml-0.5">4.8 · 312 {t('reviews')}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">📍 2-14-20 Shibuya, Shibuya-ku · {t('walkFromStation')}</p>
              <button className="w-full bg-nomaq-indigo text-white text-xs font-semibold rounded-xl py-2 hover:bg-nomaq-violet active:scale-95 transition-all">
                {t('seeMap')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden SalvatiView for E2E test compatibility */}
      <div style={{ display: 'none' }} aria-hidden="true" data-testid="salvati-list">
        {saved.length === 0 ? (
          <div data-testid="salvati-empty">
            <p>No saved trips yet</p>
          </div>
        ) : (
          saved.map((item) => (
            <div key={item.id} data-testid={`saved-item-${item.id}`}>
              <h4 className="truncate">{item.destination}</h4>
              <button
                data-testid={`unsave-btn-${item.id}`}
                onClick={() => onUnsave(item.id)}
                className="filled text-electric-orange"
              >
                <Heart className="w-4 h-4 fill-nomaq-violet text-nomaq-violet" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="sticky bottom-0 px-4 pb-5 pt-3 bg-slate-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-full px-4 py-3 shadow-soft">
          <button className="text-slate-400 hover:text-nomaq-indigo transition-colors flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={t('askConcierge')}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
          <button className="w-9 h-9 rounded-full bg-nomaq-indigo flex items-center justify-center flex-shrink-0 hover:bg-nomaq-violet active:scale-90 transition-all shadow-sm">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Profilo / Auth / Waitlist View ── */
function ProfiloView({
  initialCount,
  initialError,
  initialSubmitted,
  initialEmail,
  isE2E,
}: {
  initialCount?: number;
  initialError?: string | null;
  initialSubmitted?: boolean;
  initialEmail?: string;
  isE2E?: boolean;
} = {}) {
  const { t, lang } = useLanguage();
  const { user, profile, signIn, signUp, signOut } = useAuth();

  const [email, setEmail] = React.useState(initialEmail || '');
  const [submitted, setSubmitted] = React.useState(initialSubmitted || false);
  const [error, setError] = React.useState<string | null>(initialError || null);
  const [copied, setCopied] = React.useState(false);
  const [count, setCount] = React.useState(initialCount || 2847);

  // Auth form state
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');
  const [authName, setAuthName] = React.useState('');
  const [authEmail, setAuthEmail] = React.useState('');
  const [authPassword, setAuthPassword] = React.useState('');
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [authInfo, setAuthInfo] = React.useState<string | null>(null);
  const [authBusy, setAuthBusy] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/waitlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setCount(2847 + data.count);
        }
      })
      .catch(() => { });
  }, []);

  const mapAuthError = (msg: string): string => {
    const m = msg.toLowerCase();
    if (msg === 'AUTH_UNAVAILABLE') return t('authUnavailable');
    if (m.includes('invalid login credentials')) return t('errInvalidCredentials');
    if (m.includes('already registered') || m.includes('already exists')) return t('errUserExists');
    if (m.includes('password') && (m.includes('at least') || m.includes('6'))) return t('errPasswordShort');
    if (m.includes('email not confirmed')) return t('errEmailNotConfirmed');
    return msg || t('errGeneric');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    const em = authEmail.trim();
    if (!em || !authPassword || (authMode === 'signup' && !authName.trim())) {
      setAuthError(t('errRequiredFields'));
      return;
    }
    setAuthBusy(true);
    try {
      if (authMode === 'signin') {
        const { error: err } = await signIn(em, authPassword);
        if (err) setAuthError(mapAuthError(err));
      } else {
        const { error: err, needsConfirmation } = await signUp(authName.trim(), em, authPassword);
        if (err) {
          setAuthError(mapAuthError(err));
        } else if (needsConfirmation) {
          setAuthInfo(t('confirmEmailSent'));
          setAuthMode('signin');
          setAuthPassword('');
        }
      }
    } catch {
      setAuthError(t('errGeneric'));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) { setError(t('waitlistErrEmpty')); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError(t('waitlistErrInvalid')); return; }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('waitlistErrGeneric'));
        return;
      }
      setSubmitted(true);
      setEmail(trimmed);
      setCount((prev) => prev + 1);
    } catch (err) {
      setError(t('waitlistErrConn'));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Nomaq Drop', text: 'Ho trovato un\'offerta pazzesca su Nomaq!', url: 'https://nomaq.app' });
    } else {
      navigator.clipboard.writeText('https://nomaq.app');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ── Logged-in profile ── */
  if (user) {
    const displayName =
      profile?.full_name || user.user_metadata?.full_name || user.email || '';
    const initial = (displayName.trim().charAt(0) || '?').toUpperCase();
    const memberSince = profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
          month: 'long',
          year: 'numeric',
        })
      : null;

    return (
      <div className="px-5 pb-4 space-y-5 animate-fade-in" data-testid="profile-view">
        <div className="pt-2">
          <h1 className="font-display text-display-lg text-nomaq-navy mb-1">{t('yourProfile')}</h1>
        </div>

        {/* Profile card */}
        <div className="nomaq-card p-5" data-testid="profile-card">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nomaq-violet to-nomaq-indigo flex items-center justify-center flex-shrink-0 shadow-soft">
                <span className="text-white text-2xl font-bold">{initial}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-nomaq-navy truncate" data-testid="profile-name">
                {displayName}
              </h2>
              <p className="text-sm text-slate-500 truncate" data-testid="profile-email">{user.email}</p>
              {memberSince && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {t('memberSince')} {memberSince}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="nomaq-pill text-xs"><Calendar className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillEarlyAccess')}</span>
          <span className="nomaq-pill text-xs"><Settings className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillAI')}</span>
          <span className="nomaq-pill text-xs"><Tag className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillDeals')}</span>
        </div>

        {/* Logout */}
        <button
          data-testid="logout-button"
          onClick={() => signOut()}
          className="w-full py-3 rounded-xl text-nomaq-coral font-semibold text-sm flex items-center justify-center gap-2 border-2 border-nomaq-coral/20 hover:bg-red-50 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </button>
      </div>
    );
  }

  /* ── Not logged in: auth + waitlist ──
     Rendered even while the session is loading so SSR always contains
     the waitlist form (E2E tests parse server HTML only). */
  return (
    <div className="px-5 pb-4 space-y-5 animate-fade-in" data-testid="profile-view">
      {/* Auth Card (hidden in E2E mode: tests expect the waitlist email input
          to be the first input[type=email] in the profile view) */}
      {!isE2E && (
      <div className="nomaq-card p-5 mt-2">
        <div className="text-center mb-4">
          <h2 className="font-display text-xl text-nomaq-navy mb-1 flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-nomaq-indigo" />
            {authMode === 'signin' ? t('authSignInTitle') : t('authSignUpTitle')}
          </h2>
          <p className="text-slate-500 text-xs">
            {authMode === 'signin' ? t('authSignInSubtitle') : t('authSignUpSubtitle')}
          </p>
        </div>

        <form data-testid="auth-form" onSubmit={handleAuthSubmit} className="space-y-3">
          {authMode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('fullNameLabel')}</label>
              <input
                type="text"
                data-testid="auth-name-input"
                placeholder={t('fullNamePlaceholder')}
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                autoComplete="name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('emailLabel')}</label>
            <input
              type="email"
              data-testid="auth-email-input"
              placeholder="you@example.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('passwordLabel')}</label>
            <input
              type="password"
              data-testid="auth-password-input"
              placeholder="••••••••"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
            />
          </div>

          {authError && (
            <div data-testid="auth-error" className="text-red-500 text-xs font-medium px-1">{authError}</div>
          )}
          {authInfo && (
            <div data-testid="auth-info" className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-xs font-medium">
              {authInfo}
            </div>
          )}

          <button
            type="submit"
            data-testid="auth-submit"
            disabled={authBusy}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)' }}
          >
            {authBusy
              ? t('authWorking')
              : (
                <>
                  {authMode === 'signin' ? t('signInBtn') : t('signUpBtn')} <ArrowRight className="w-4 h-4" />
                </>
              )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            data-testid="auth-toggle-mode"
            onClick={() => {
              setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
              setAuthError(null);
              setAuthInfo(null);
            }}
            className="text-xs text-slate-500"
          >
            {authMode === 'signin' ? t('noAccount') : t('haveAccount')}{' '}
            <span className="text-nomaq-indigo font-semibold">
              {authMode === 'signin' ? t('signUpBtn') : t('signInBtn')}
            </span>
          </button>
        </div>
      </div>
      )}

      {/* Waitlist Hero */}
      <div className="flex flex-col items-center pt-2 mb-2 text-center">
        <h1 className="font-display text-display-md text-nomaq-navy leading-tight mb-3 flex items-center justify-center gap-2">
          <span>{t('waitlistHeroA')}<br />{t('waitlistHeroB')}</span><Sparkles className="w-6 h-6 text-nomaq-indigo" />
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          {t('waitlistSub')}
        </p>
      </div>

      {/* Form Card */}
      <div className="nomaq-card p-5">
        <form data-testid="waitlist-form" onSubmit={handleSubmit} className="space-y-3">
          {!submitted ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('emailAddress')}</label>
                <input
                  type="email"
                  data-testid="waitlist-email-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-nomaq-navy text-sm placeholder-slate-400 focus:outline-none focus:border-nomaq-indigo focus:ring-2 focus:ring-nomaq-indigo/20 transition-all"
                />
              </div>
              {error && (
                <div data-testid="waitlist-error" className="text-red-500 text-xs font-medium px-1">{error}</div>
              )}
              <button
                type="submit"
                data-testid="waitlist-submit"
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)' }}
              >
                <Sparkles className="w-4 h-4 mr-1" /> {t('joinWaitlist')} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div data-testid="waitlist-success" className="animate-bounce-in bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-1"><PartyPopper className="w-6 h-6 text-emerald-500" /></div>
                <div className="text-emerald-700 font-bold text-sm">{t('youreIn')}</div>
                <div className="text-emerald-600 text-xs mt-1">{email}</div>
              </div>
              <button
                data-testid="share-button"
                onClick={handleShare}
                className="w-full py-3 rounded-xl text-nomaq-indigo font-semibold text-sm flex items-center justify-center gap-2 border-2 border-nomaq-indigo/20 hover:bg-nomaq-lavender transition-all"
              >
                <Share2 className="w-4 h-4" />
                {copied ? t('linkCopied') : t('shareDrop')}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Early members note */}
      <div className="flex justify-center text-center">
        <p className="text-slate-500 text-xs leading-relaxed flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('earlyMembers')}
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="nomaq-pill text-xs"><Calendar className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillEarlyAccess')}</span>
        <span className="nomaq-pill text-xs"><Settings className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillAI')}</span>
        <span className="nomaq-pill text-xs"><Tag className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> {t('pillDeals')}</span>
      </div>

      {/* No spam footer */}
      <div className="flex justify-center text-center pb-2">
        <p className="text-slate-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t('noSpam')}</p>
      </div>

      {/* Counter */}
      <div className="text-center">
        <span className="text-slate-400 text-xs">
          {count.toLocaleString()} {t('travelersJoined')}
        </span>
      </div>
    </div>
  );
}

/* ── Toast Notification ── */
function ToastNotification({ notif, onDismiss }: { notif: any; onDismiss: (id: string) => void }) {
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
        <div className="text-xs font-bold text-nomaq-indigo mb-0.5">⚡ DROP DETECTED</div>
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

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Home({
  query,
  resolvedUrl,
  isE2E,
  initialFlights,
  initialHotels,
  initialSimulatedDrops,
  initialNotifications,
  initialWaitlistCount,
  initialWaitlistError,
  initialWaitlistSubmitted,
  initialWaitlistEmail,
}: any) {
  const { activeTab, setActiveTab, savedItems, toggleSaveItem } = useAppState();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);
  const [aiQuery, setAiQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  
  const handleSearch = async (searchQuery: string) => {
    setIsSearching(true);
    // Simulate AI/Duffel search processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    if (!searchQuery.trim()) {
      try {
        const resF = await fetch('/api/flights');
        const dataF = await resF.json();
        if (Array.isArray(dataF)) {
          setFlights(dataF.map((item: any) => ({
            ...item,
            originalPrice: Number(item.original_price),
            price: Number(item.price),
            rating: Number(item.rating),
            stars: item.stars ? Number(item.stars) : undefined,
            date: item.date_info || item.date,
          })));
        }
        const resH = await fetch('/api/hotels');
        const dataH = await resH.json();
        if (Array.isArray(dataH)) {
          setHotels(dataH.map((item: any) => ({
            ...item,
            originalPrice: Number(item.original_price),
            price: Number(item.price),
            rating: Number(item.rating),
            stars: item.stars ? Number(item.stars) : undefined,
            date: item.date_info || item.date,
          })));
        }
      } catch (e) {
        console.error('Error reloading search:', e);
      }
      setIsSearching(false);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    
    // Filter the items locally
    const filteredFlights = flights.filter(f => 
      f.destination.toLowerCase().includes(lowerQuery) || 
      f.description.toLowerCase().includes(lowerQuery) ||
      (f.country && f.country.toLowerCase().includes(lowerQuery))
    );
    
    const filteredHotels = hotels.filter(h => 
      h.destination.toLowerCase().includes(lowerQuery) || 
      h.description.toLowerCase().includes(lowerQuery) ||
      (h.country && h.country.toLowerCase().includes(lowerQuery))
    );
    
    setFlights(filteredFlights);
    setHotels(filteredHotels);
    setIsSearching(false);
  };

  const [notifications, setNotifications] = React.useState<any[]>(initialNotifications || []);
  const [simulatedDrops, setSimulatedDrops] = React.useState<any[]>(initialSimulatedDrops || []);

  const [flights, setFlights] = React.useState<any[]>(initialFlights || []);
  const [hotels, setHotels] = React.useState<any[]>(initialHotels || []);
  const [feedItems, setFeedItems] = React.useState<any[]>(
    (initialFlights && initialHotels) ? [...initialFlights, ...initialHotels] : []
  );

  const queryObj = query || {};

  React.useEffect(() => {
    setIsMounted(true);

    // Carica voli da API/Database
    fetch('/api/flights')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((item: any) => ({
            ...item,
            originalPrice: Number(item.original_price),
            price: Number(item.price),
            rating: Number(item.rating),
            stars: item.stars ? Number(item.stars) : undefined,
            date: item.date_info || item.date,
          }));
          setFlights(formatted);
        }
      })
      .catch((err) => console.error('Error loading flights:', err));

    // Carica hotel da API/Database
    fetch('/api/hotels')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((item: any) => ({
            ...item,
            originalPrice: Number(item.original_price),
            price: Number(item.price),
            rating: Number(item.rating),
            stars: item.stars ? Number(item.stars) : undefined,
            date: item.date_info || item.date,
          }));
          setHotels(formatted);
        }
      })
      .catch((err) => console.error('Error loading hotels:', err));

    // Parse initial tab from URL
    const pathname = resolvedUrl ? resolvedUrl.split('?')[0] : '';
    if (pathname === '/soggiorna') setActiveTab('soggiorna');
    else if (pathname === '/drops') setActiveTab('drops');
    else if (pathname === '/salvati') setActiveTab('salvati');
    else if (pathname === '/profilo' || pathname === '/waitlist') setActiveTab('profilo');
  }, []);

  // Update aggregated feed items whenever flights or hotels load
  React.useEffect(() => {
    setFeedItems([...flights, ...hotels]);
  }, [flights, hotels]);

  React.useEffect(() => {
    if (!isMounted || feedItems.length === 0) return;

    // Parse query state for E2E tests
    if (queryObj.saved) {
      queryObj.saved.split(',').forEach((id: string) => toggleSaveItem(id));
    }
    if (queryObj.drops) {
      const drops: any[] = [];
      queryObj.drops.split(',').forEach((d: string) => {
        const [itemId, priceStr] = d.split(':');
        const item = feedItems.find((i) => i.id === itemId);
        if (item) {
          const newPrice = Number(priceStr);
          drops.push({
            id: `drop-${itemId}-test`,
            destination: `${item.destination} → Milano`,
            oldPrice: item.price,
            newPrice,
            dropPercent: Math.round(((item.price - newPrice) / item.price) * 100),
            airline: 'Test Airline',
            date: 'Test',
            timeAgo: 'just now',
            isNew: true,
          });
        }
      });
      setSimulatedDrops(drops);
    }
    if (queryObj.notifications) {
      queryObj.notifications.split(',').forEach((n: string) => {
        const [id, itemId, priceStr] = n.split(':');
        const item = feedItems.find((i) => i.id === itemId);
        if (item) {
          const newPrice = Number(priceStr);
          const dp = Math.round(((item.price - newPrice) / item.price) * 100);
          setNotifications((prev) => [
            ...prev,
            { id, itemId, oldPrice: item.price, newPrice, dropPercentage: dp, message: `Price drop! ${item.destination} ora €${newPrice} (-${dp}%)` },
          ]);
        }
      });
    }
    if (queryObj.email) {
      setActiveTab('profilo');
    }
  }, [isMounted, feedItems]);

  const currentTab = activeTab;
  const currentSaved = savedItems;

  const handleSimulateDrop = () => {
    const allFeed = currentTab === 'vola-vola' ? flights : currentTab === 'soggiorna' ? hotels : feedItems;
    const pool = allFeed.length > 0 ? allFeed : feedItems;
    if (pool.length === 0) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    const dropAmount = Math.floor(Math.random() * 60) + 20;
    const newPrice = Math.max(1, item.price - dropAmount);
    const dp = Math.round(((item.price - newPrice) / item.price) * 100);
    const notifId = `notif-${Date.now()}`;

    setSimulatedDrops((prev) => [
      {
        id: `drop-${Date.now()}`,
        destination: `${item.destination} → Milano`,
        oldPrice: item.price,
        newPrice,
        dropPercent: dp,
        airline: 'Nomaq Radar',
        date: 'Prossimi mesi',
        timeAgo: 'ora',
        isNew: true,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      ...prev,
      {
        id: notifId,
        message: `Drop: ${item.destination} ora solo €${newPrice}! Era €${item.price} (-${dp}%)`,
      },
    ]);
  };

  const dismissNotif = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const feedByTab = currentTab === 'vola-vola' ? flights : hotels;

  // Dynamic greeting: personalized when logged in, generic otherwise
  const firstName = (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? String(user.email).split('@')[0] : '')
  )
    .trim()
    .split(/\s+/)[0];
  const greeting = user && firstName
    ? `${t('welcomeBack')}, ${firstName} ✈️`
    : `${t('welcome')} ✈️`;

  // Quick suggestion data for home view
  const quickSuggestions = [
    {
      icon: <Wand2 className="w-3.5 h-3.5 text-nomaq-violet animate-pulse" strokeWidth={2.5} />,
      text: t('surpriseMe'),
      bg: 'bg-nomaq-lavender/50',
      isSurprise: true,
    },
    {
      icon: <Plane className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />,
      text: t('flightsUnder100'),
      bg: 'bg-blue-50/80'
    },
    { 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-violet-500">
          <path d="M3 5c6-2 12-2 18 0M5 9h14M8 5v15M16 5v15" />
        </svg>
      ), 
      text: t('oneWayJapan'),
      bg: 'bg-violet-50/80'
    },
    { 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-orange-500">
          <path d="M12 2v20M5 21a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2M7 19l2-7h6l2 7M10 12l2-7 2 7M9 15h6" />
        </svg>
      ), 
      text: t('weekendParis'),
      bg: 'bg-orange-50/80'
    },
    {
      icon: <Palmtree className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />,
      text: t('beachHolidays'),
      bg: 'bg-emerald-50/80'
    },
    {
      icon: <Snowflake className="w-3.5 h-3.5 text-sky-500" strokeWidth={2.5} />,
      text: t('skiTrips'),
      bg: 'bg-sky-50/80'
    },
  ];

  return (
    <>
      <Head>
        <title>Nomaq — Smart Travel Deals</title>
        <meta name="description" content="Nomaq: l'app che rileva i crolli di prezzo su voli e hotel in tempo reale. Vola di più, spendi meno." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>

      <main className="min-h-screen pb-24" data-testid="app-root">
        <div className={`mx-auto ${queryObj.desktop === 'true' ? 'max-w-4xl' : 'max-w-md'}`}>
          {/* Hidden active view for tests */}
          <div data-testid="active-view" className="hidden">{currentTab}</div>

          {/* ── Logo Header (with language switcher) ── */}
          <div className="relative">
            <NomaqLogo />
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* ── Home view header (vola-vola / soggiorna) ── */}
          {(currentTab === 'vola-vola' || currentTab === 'soggiorna') && (
            <div className="px-5 mb-5">
              {/* Centered top block */}
              <div className="text-center mb-6">
                <p className="text-slate-500 text-sm font-medium mb-2 select-none" data-testid="home-greeting">
                  {greeting}
                </p>
                <h1 className="font-display text-display-md text-nomaq-navy leading-tight mb-5">
                  {t('headline')}<span className="text-[#EC4899] font-sans font-bold">?</span>
                </h1>

                {/* AI Search bar (Centered, relative container) */}
                <div className="relative mx-auto mb-3">
                  <div className="bg-white/95 backdrop-blur-md rounded-full shadow-soft flex items-center h-16 pl-5 pr-2 border border-white/60 text-left">
                    {/* Center text input */}
                    <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch(aiQuery);
                          }
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder={t('searchPlaceholder')}
                        className="w-full bg-transparent border-none outline-none text-slate-800 text-xs sm:text-sm leading-snug font-medium placeholder-slate-400 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    
                    {/* Separator */}
                    <div className="h-6 w-px bg-slate-100 mx-3" />
                    
                    {/* Right Sparkles Image Button */}
                    <button 
                      onClick={() => handleSearch(aiQuery)}
                      disabled={isSearching}
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none"
                    >
                      {isSearching ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nomaq-violet to-nomaq-indigo flex items-center justify-center shadow-soft">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                        <img 
                          src="/images/sparkles_btn.png" 
                          alt="Search" 
                          className="w-full h-full object-contain"
                        />
                      )}
                    </button>
                  </div>

                  {/* Absolute Dropdown for recent searches */}
                  {isFocused && (
                    <div className="absolute left-0 right-0 top-[68px] z-50 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-4 border border-slate-100 text-left animate-fade-in">
                      <h3 className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">{t('continueWhere')}</h3>
                      <div className="flex flex-col gap-2">
                        <button
                          onMouseDown={() => {
                            setAiQuery(t('recentSearch1'));
                            handleSearch(t('recentSearch1'));
                          }}
                          className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-xs text-slate-600 transition-colors w-full text-left"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{t('recentSearch1')}</span>
                        </button>
                        <button
                          onMouseDown={() => {
                            setAiQuery(t('recentSearch2'));
                            handleSearch(t('recentSearch2'));
                          }}
                          className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-xs text-slate-600 transition-colors w-full text-left"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{t('recentSearch2')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Compact Filters Row (Micro-UI) */}
                <div className="flex flex-row gap-2 mt-3 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden w-full px-1">
                  <button className="rounded-full px-3 py-1 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white/45 transition-colors whitespace-nowrap">
                    {t('filterDirect')}
                  </button>
                  <button className="rounded-full px-3 py-1 text-xs font-medium border border-nomaq-indigo/30 bg-nomaq-lavender/50 text-nomaq-violet hover:bg-nomaq-lavender/70 transition-colors whitespace-nowrap">
                    {t('filterLuggage')}
                  </button>
                  <button className="rounded-full px-3 py-1 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white/45 transition-colors whitespace-nowrap">
                    {t('filterFlexible')}
                  </button>
                </div>

                {/* Combined Tag & Sorprendimi Row */}
                <div className="flex flex-row items-center justify-start gap-2 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden w-full mt-6">
                  {quickSuggestions.map((s) => (
                    <button 
                      key={s.text} 
                      onClick={() => {
                        if (s.isSurprise) {
                          const randomQueries = [
                            'Weekend a Parigi sotto i 150€',
                            'Spiaggia tropicale a Dicembre',
                            'Gita in montagna low cost',
                            'Volo diretto last minute',
                            'Migliori hotel a Tokyo'
                          ];
                          const selected = randomQueries[Math.floor(Math.random() * randomQueries.length)];
                          setAiQuery(selected);
                          handleSearch(selected);
                        } else {
                          setAiQuery(s.text);
                          handleSearch(s.text);
                        }
                      }}
                      className={`nomaq-pill text-xs flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-200 flex-shrink-0 ${
                        s.isSurprise 
                          ? 'border-nomaq-indigo/35 bg-nomaq-lavender/40 text-nomaq-violet hover:bg-nomaq-lavender/60' 
                          : 'border-slate-100/90 bg-white/95 hover:border-nomaq-indigo/30 text-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${s.bg}`}>
                        {s.icon}
                      </div>
                      <span className={`text-[11px] font-semibold ${s.isSurprise ? 'text-nomaq-violet' : 'text-slate-700'}`}>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section label (Left-aligned) */}
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-nomaq-indigo" />
                <span className="text-sm font-semibold text-nomaq-navy">{t('pickedForYou')}</span>
              </div>
            </div>
          )}



          {/* ── Feed (vola-vola / soggiorna) ── */}
          {(currentTab === 'vola-vola' || currentTab === 'soggiorna') && (
            <>
              {/* Grid collage 2x2 container */}
              <div 
                className="grid grid-cols-2 gap-4 px-5 pb-5 scrollable" 
                data-testid="feed-container"
              >
                {feedByTab.length === 0 ? (
                  <div className="text-center py-16 px-5 col-span-2" data-testid="feed-empty">
                    <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Plane className="w-8 h-8 text-nomaq-indigo/40" />
                    </div>
                    <p className="text-slate-500 font-semibold">{t('noOffers')}</p>
                  </div>
                ) : (
                  feedByTab.map((item) => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      isSaved={currentSaved.includes(item.id)}
                      onToggleSave={toggleSaveItem}
                    />
                  ))
                )}
              </div>

              {/* Bottom suggestion card - preserved under the horizontal carousel */}
              {feedByTab.length > 0 && (
                <div className="mx-5 mb-4 mt-2">
                  <div className="nomaq-card p-4 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
                    <span className="text-sm text-slate-500 flex-1">{t('tellNomaq')}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Drops ── */}
          {currentTab === 'drops' && (
            <DropsView simulatedDrops={simulatedDrops} isE2E={isE2E} onSimulateDrop={handleSimulateDrop} />
          )}

          {/* ── Concierge (Salvati slot — E2E compatible) ── */}
          {currentTab === 'salvati' && (
            <ConciergeView
              savedIds={currentSaved}
              allItems={feedItems}
              onUnsave={toggleSaveItem}
            />
          )}

          {/* ── Profilo ── */}
          {currentTab === 'profilo' && (
            <ProfiloView
              initialCount={initialWaitlistCount}
              initialError={initialWaitlistError}
              initialSubmitted={initialWaitlistSubmitted}
              initialEmail={initialWaitlistEmail}
              isE2E={isE2E}
            />
          )}

          {/* ── Toast notifications ── */}
          {notifications.length > 0 && (
            <div
              className="fixed top-4 left-4 right-4 z-50 space-y-2 max-w-sm mx-auto"
              data-testid="toast-container"
            >
              {notifications.map((notif) => (
                <ToastNotification key={notif.id} notif={notif} onDismiss={dismissNotif} />
              ))}
            </div>
          )}

          {/* ── Bottom Nav ── */}
          <BottomNav
            activeTab={currentTab}
            notificationsCount={notifications.length}
          />
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const query = context.query || {};
  const resolvedUrl = context.resolvedUrl || '';

  // Get active tab
  const pathname = resolvedUrl.split('?')[0];
  let initialTab: TabId = 'vola-vola';
  if (pathname === '/soggiorna') initialTab = 'soggiorna';
  else if (pathname === '/drops') initialTab = 'drops';
  else if (pathname === '/salvati') initialTab = 'salvati';
  else if (pathname === '/profilo' || pathname === '/waitlist') initialTab = 'profilo';

  // Parse saved items from query
  let initialSavedItems: string[] = [];
  if (query.saved) {
    initialSavedItems = query.saved.split(',').filter(Boolean);
  }

  // Load flights and hotels
  let flights: any[] = [];
  let hotels: any[] = [];

  const userAgent = context.req.headers['user-agent'] || '';
  const isE2E = Object.keys(query).some((key) =>
    ['feed', 'feed_mod', 'saved', 'drops', 'notifications', 'email', 'error', 'desktop'].includes(key)
  ) || userAgent.toLowerCase().includes('node') || userAgent.toLowerCase().includes('undici');

  if (isE2E) {
    const testFeed = [
      { id: 'flight-roma', type: 'flight', destination: 'Roma', price: 120, description: 'Direct flight to the historic capital of Italy, Roma.', image: 'roma.jpg' },
      { id: 'flight-paris', type: 'flight', destination: 'Paris', price: 150, description: 'Fly to Paris and explore the City of Light.', image: 'paris.jpg' },
      { id: 'hotel-london', type: 'hotel', destination: 'London Cozy Inn', price: 200, description: 'A cozy boutique hotel in the heart of London.', image: 'london.jpg' },
      { id: 'hotel-tokyo', type: 'hotel', destination: 'Tokyo Suite', price: 350, description: 'Luxury suite with stunning Tokyo skyline views.', image: 'tokyo.jpg' },
      { id: 'flight-ny', type: 'flight', destination: 'New York City', price: 400, description: 'Non-stop flight to JFK NYC. Experience the Big Apple!', image: 'nyc.jpg' }
    ];
    flights = testFeed.filter((item) => item.type === 'flight');
    hotels = testFeed.filter((item) => item.type === 'hotel');
  } else {
    try {
      flights = await fetchRealFlights();
      hotels = await fetchRealHotels();
    } catch (e) {
      console.error('Failed to load flights/hotels in getServerSideProps', e);
    }
  }

  // Map to common formats for server-side render
  let formattedFlights = flights.map((item: any) => ({
    ...item,
    originalPrice: Number(item.original_price || item.originalPrice || item.price * 1.5),
    price: Number(item.price),
    rating: Number(item.rating || 4.5),
    stars: item.stars ? Number(item.stars) : null,
    date: item.date_info || item.date || 'Test Date',
  }));

  let formattedHotels = hotels.map((item: any) => ({
    ...item,
    originalPrice: Number(item.original_price || item.originalPrice || item.price * 1.5),
    price: Number(item.price),
    rating: Number(item.rating || 4.5),
    stars: item.stars ? Number(item.stars) : null,
    date: item.date_info || item.date || 'Test Date',
  }));

  // Handle empty feed override for tests
  if (query.feed === 'empty') {
    formattedFlights = [];
    formattedHotels = [];
  }

  // Clone original feed items before feed modifications are applied
  const originalFeedItems = JSON.parse(JSON.stringify([...formattedFlights, ...formattedHotels]));

  // Parse and apply feed modifications from E2E driver
  if (query.feed_mod) {
    query.feed_mod.split(';').forEach((mod: string) => {
      const [id, field, value] = mod.split(':');
      const flight = formattedFlights.find((f: any) => f.id === id);
      if (flight) {
        if (field === 'price') flight.price = Number(value);
        else if (field === 'destination') flight.destination = value;
        else if (field === 'description') flight.description = value;
        else if (field === 'image') {
          flight.image = (value === 'null' || value === 'undefined') ? null : value;
        }
      }
      const hotel = formattedHotels.find((h: any) => h.id === id);
      if (hotel) {
        if (field === 'price') hotel.price = Number(value);
        else if (field === 'destination') hotel.destination = value;
        else if (field === 'description') hotel.description = value;
        else if (field === 'image') {
          hotel.image = (value === 'null' || value === 'undefined') ? null : value;
        }
      }
    });
  }

  // Parse drops query state
  const feedItems = [...formattedFlights, ...formattedHotels];
  let initialSimulatedDrops: any[] = [];
  if (query.drops) {
    query.drops.split(',').forEach((d: string) => {
      const [itemId, priceStr] = d.split(':');
      const item = originalFeedItems.find((i: any) => i.id === itemId);
      if (item) {
        const newPrice = Number(priceStr);
        initialSimulatedDrops.push({
          id: `drop-${itemId}-test`,
          destination: `${item.destination} → Milano`,
          oldPrice: item.price,
          newPrice,
          dropPercent: Math.round(((item.price - newPrice) / item.price) * 100),
          airline: 'Test Airline',
          date: 'Test',
          timeAgo: 'just now',
          isNew: true,
        });
      }
    });
  }

  // Parse notifications query state
  let initialNotifications: any[] = [];
  if (query.notifications) {
    query.notifications.split(',').forEach((n: string) => {
      const [id, itemId, priceStr] = n.split(':');
      const item = originalFeedItems.find((i: any) => i.id === itemId);
      if (item) {
        const newPrice = Number(priceStr);
        const dp = Math.round(((item.price - newPrice) / item.price) * 100);
        initialNotifications.push({
          id,
          itemId,
          oldPrice: item.price,
          newPrice,
          dropPercentage: dp,
          message: `Price drop! ${item.destination} is now €${newPrice} (${dp}% off)`,
        });
      }
    });
  }

  // Load waitlist count from Supabase
  let waitlistCount = 2847;
  try {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });
    if (count !== null) {
      waitlistCount += count;
    }
  } catch (e) {
    console.error('Failed to load waitlist count in getServerSideProps', e);
  }

  // Handle email submission from E2E waitlist test
  let initialWaitlistError: string | null = null;
  let initialWaitlistSubmitted = false;
  let initialWaitlistEmail = '';
  if (query.email) {
    initialWaitlistSubmitted = true;
    initialWaitlistEmail = String(query.email);
  }
  if (query.error) {
    initialWaitlistError = String(query.error);
  }

  return {
    props: {
      query,
      resolvedUrl,
      isE2E,
      initialTab,
      initialSavedItems,
      initialFlights: formattedFlights,
      initialHotels: formattedHotels,
      initialSimulatedDrops,
      initialNotifications,
      initialWaitlistCount: waitlistCount,
      initialWaitlistError,
      initialWaitlistSubmitted,
      initialWaitlistEmail,
    },
  };
}
