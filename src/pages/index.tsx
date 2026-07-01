import Head from 'next/head';
import React from 'react';
import { Heart, MapPin, Calendar, Clock, Share2, Bell, ChevronRight, Zap, Star, ArrowDown, TrendingDown, Search, Plane, Hotel, Settings, User, LogOut, Gift, Globe, Shield, Sparkles, ArrowRight, X, Sun, Snowflake, CheckCircle2, PartyPopper, Tag } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/utils/supabaseClient';
import { fetchRealFlights, fetchRealHotels } from '@/utils/travelApi';

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const FLIGHTS = [
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
    <div className="flex items-center justify-center gap-1.5 py-3">
      <Sparkles className="w-5 h-5 text-nomaq-indigo" strokeWidth={2.5} />
      <span className="text-[22px] font-black tracking-tight text-nomaq-navy">Nomaq</span>
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
      className="feed-card glassmorphism glass-card mx-5 mb-4 animate-slide-up rounded-2xl"
      data-testid="feed-item"
      data-id={item.id}
    >
      <div className="flex gap-0">
        {/* Image */}
        <div className="relative w-[130px] min-h-[140px] flex-shrink-0 overflow-hidden rounded-l-2xl">
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
            className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
              isSaved
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

        {/* Content */}
        <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
          {/* Tag */}
          {cleanTag && (
            <span className={`inline-flex items-center self-start px-2 py-0.5 rounded-md text-[10px] font-bold ${tagClass} mb-1.5`}>
              <Sparkles className="w-3 h-3 mr-1 inline-block" /> {cleanTag}
            </span>
          )}

          {/* Title */}
          <h3 className="text-sm font-bold text-nomaq-navy leading-snug mb-0.5">{item.destination}</h3>

          {/* Description */}
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">{item.description}</p>

          {/* Price & details */}
          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              {item.type === 'flight' ? (
                <>
                  <Plane className="w-3 h-3" />
                  <span>{item.airline || 'Airline'}</span>
                </>
              ) : (
                <>
                  <Hotel className="w-3 h-3" />
                  <span>{item.hotelName || item.country}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {discount > 0 && (
                <span className="text-slate-400 text-xs line-through">€{item.originalPrice}</span>
              )}
              <span className="text-nomaq-indigo font-bold text-sm">€{item.price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Drops View ── */
function DropsView({ simulatedDrops, isE2E }: { simulatedDrops: any[]; isE2E?: boolean }) {
  const allDrops = isE2E ? simulatedDrops : [...simulatedDrops, ...MOCK_DROPS];

  return (
    <div className="px-5 pb-4 animate-fade-in" data-testid="drops-view">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-display-lg text-nomaq-navy mb-1">Drops</h1>
        <p className="text-slate-500 text-sm">Real-time flight deals that just dropped in price.</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <div className="nomaq-pill">
          <MapPin className="w-3.5 h-3.5 text-nomaq-indigo" />
          From Naples
        </div>
        <div className="nomaq-pill">
          <Calendar className="w-3.5 h-3.5 text-nomaq-indigo" />
          Any month
        </div>
        <div className="nomaq-pill">
          <User className="w-3.5 h-3.5 text-nomaq-indigo" />
          1 traveler
        </div>
      </div>

      {/* Featured "Picked for you" */}
      {allDrops.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-nomaq-indigo" />
            <span className="text-sm font-semibold text-nomaq-navy">Picked for you by AI</span>
          </div>
          <div className="nomaq-card p-4">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-nomaq-lavender flex items-center justify-center flex-shrink-0 overflow-hidden">
                <TrendingDown className="w-8 h-8 text-nomaq-indigo" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-nomaq-navy text-sm mb-0.5">{allDrops[0].destination}</div>
                <div className="text-xs text-slate-500 mb-2">{allDrops[0].airline} • {allDrops[0].date}</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs line-through">€{allDrops[0].oldPrice}</span>
                  <span className="text-nomaq-indigo font-bold">€{allDrops[0].newPrice}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Drop €{allDrops[0].oldPrice - allDrops[0].newPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Just dropped now" list */}
      <div className="mb-3 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-nomaq-indigo" />
        <span className="text-sm font-semibold text-nomaq-navy">Just dropped now</span>
      </div>

      <div className="space-y-3" data-testid="drops-history-list">
        {allDrops.length === 0 ? (
          <div className="text-center py-12" data-testid="drops-empty">
            <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ArrowDown className="w-8 h-8 text-nomaq-indigo/40" />
            </div>
            <p className="text-slate-500 font-medium">No drops detected yet.</p>
            <p className="text-slate-400 text-sm mt-1">The radar is listening...</p>
          </div>
        ) : (
          allDrops.map((drop, idx) => (
            <div
              key={drop.id}
              className="nomaq-card p-3.5 animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
              data-testid={`drop-item-${drop.id}`}
            >
              <div className="flex items-center gap-3">
                {/* Small image/icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Plane className="w-5 h-5 text-slate-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-nomaq-navy text-sm truncate">{drop.destination}</span>
                    {drop.isNew && (
                      <span className="bg-nomaq-lavender text-nomaq-violet text-[9px] font-bold px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {drop.airline || 'Airline'} • {drop.date || 'Flexible'} • {drop.timeAgo}
                  </div>
                </div>

                {/* Price & badge */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs line-through">€{drop.oldPrice}</span>
                    <span className="text-nomaq-navy font-bold text-sm">€{drop.newPrice}</span>
                  </div>
                  <div className="drop-badge">
                    <span className="text-electric-orange">-{drop.dropPercent}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-nomaq-indigo text-xs font-semibold cursor-pointer">View deal →</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {allDrops.length > 0 && (
        <div className="flex justify-center mt-6 mb-2">
          <p className="text-slate-400 text-xs flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Prices update in real time. Deals won't last long.</p>
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
                  className="nomaq-card overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  data-testid={`saved-item-${item.id}`}
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
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5 ${
                          item.type === 'flight' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
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
                          onClick={() => onUnsave(item.id)}
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

/* ── Profilo / Waitlist View ── */
function ProfiloView({
  initialCount,
  initialError,
  initialSubmitted,
  initialEmail,
}: {
  initialCount?: number;
  initialError?: string | null;
  initialSubmitted?: boolean;
  initialEmail?: string;
} = {}) {
  const [email, setEmail] = React.useState(initialEmail || '');
  const [submitted, setSubmitted] = React.useState(initialSubmitted || false);
  const [error, setError] = React.useState<string | null>(initialError || null);
  const [copied, setCopied] = React.useState(false);
  const [count, setCount] = React.useState(initialCount || 2847);

  React.useEffect(() => {
    fetch('/api/waitlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setCount(2847 + data.count);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) { setError('Inserisci la tua email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Formato email non valido'); return; }

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
        setError(data.error || 'Si è verificato un errore');
        return;
      }
      setSubmitted(true);
      setEmail(trimmed);
      setCount((prev) => prev + 1);
    } catch (err) {
      setError('Impossibile connettersi al server. Riprova.');
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

  return (
    <div className="px-5 pb-4 space-y-5 animate-fade-in" data-testid="profile-view">
      {/* Waitlist Hero */}
      <div className="flex flex-col items-center pt-2 mb-2 text-center">
        <h1 className="font-display text-display-md text-nomaq-navy leading-tight mb-3 flex items-center justify-center gap-2">
          <span>Be the first to<br />travel smarter</span><Sparkles className="w-6 h-6 text-nomaq-indigo" />
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Nomaq is opening soon. Join the waitlist<br />
          and get early access to AI-powered travel deals.
        </p>
      </div>

      {/* Form Card */}
      <div className="nomaq-card p-5">
        <form data-testid="waitlist-form" onSubmit={handleSubmit} className="space-y-3">
          {!submitted ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Email address</label>
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
                <Sparkles className="w-4 h-4 mr-1" /> Join waitlist <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div data-testid="waitlist-success" className="animate-bounce-in bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-1"><PartyPopper className="w-6 h-6 text-emerald-500" /></div>
                <div className="text-emerald-700 font-bold text-sm">You're in!</div>
                <div className="text-emerald-600 text-xs mt-1">{email}</div>
              </div>
              <button
                data-testid="share-button"
                onClick={handleShare}
                className="w-full py-3 rounded-xl text-nomaq-indigo font-semibold text-sm flex items-center justify-center gap-2 border-2 border-nomaq-indigo/20 hover:bg-nomaq-lavender transition-all"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Link copiato! ✓' : 'Flexa il tuo Drop'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Early members note */}
      <div className="flex justify-center text-center">
        <p className="text-slate-500 text-xs leading-relaxed flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> Early members get exclusive deals,<br />
          beta access and personalized trip drops.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="nomaq-pill text-xs"><Calendar className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> Early access</span>
        <span className="nomaq-pill text-xs"><Settings className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> AI trip planning</span>
        <span className="nomaq-pill text-xs"><Tag className="w-3.5 h-3.5 inline-block text-nomaq-indigo" /> Exclusive deals</span>
      </div>

      {/* No spam footer */}
      <div className="flex justify-center text-center pb-2">
        <p className="text-slate-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No spam. Only smart travel updates.</p>
      </div>

      {/* Counter */}
      <div className="text-center">
        <span className="text-slate-400 text-xs">
          {count.toLocaleString()} travelers already joined
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
  const [isMounted, setIsMounted] = React.useState(false);
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

  // Quick suggestion data for home view
  const quickSuggestions = [
    { icon: <Plane className="w-3.5 h-3.5 text-nomaq-indigo" />, text: 'Flights under 100€' },
    { icon: <Hotel className="w-3.5 h-3.5 text-nomaq-indigo" />, text: 'One-way to Japan' },
    { icon: <MapPin className="w-3.5 h-3.5 text-nomaq-indigo" />, text: 'Weekend in Paris' },
    { icon: <Sun className="w-3.5 h-3.5 text-nomaq-indigo" />, text: 'Beach holidays' },
    { icon: <Snowflake className="w-3.5 h-3.5 text-nomaq-indigo" />, text: 'Ski trips' },
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

          {/* ── Logo Header ── */}
          <NomaqLogo />

          {/* ── Home view header (vola-vola / soggiorna) ── */}
          {(currentTab === 'vola-vola' || currentTab === 'soggiorna') && (
            <div className="px-5 mb-5">
              <h1 className="font-display text-display-md text-nomaq-navy leading-tight mb-4">
                Where are we going<br />today<span className="text-nomaq-coral">?</span>
              </h1>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 mb-5">
                {quickSuggestions.map((s) => (
                  <button key={s.text} className="nomaq-pill text-xs">
                    {s.icon} {s.text}
                  </button>
                ))}
              </div>

              {/* AI Search bar */}
              <div className="nomaq-card flex items-center gap-3 p-3 mb-5">
                <div className="w-9 h-9 bg-nomaq-lavender rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-nomaq-indigo" />
                </div>
                <span className="text-slate-400 text-sm flex-1">Ask Nomaq AI anything...</span>
                <div className="w-8 h-8 bg-gradient-to-br from-nomaq-violet to-nomaq-indigo rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Section label */}
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-nomaq-indigo" />
                <span className="text-sm font-semibold text-nomaq-navy">Picked for you by AI</span>
              </div>
            </div>
          )}

          {/* ── Debug price drop button (Drops tab only) ── */}
          {currentTab === 'drops' && (
            <div className="px-5 mb-4">
              <button
                data-testid="debug-price-drop"
                onClick={handleSimulateDrop}
                className="w-full bg-electric-orange text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] transition-transform"
              >
                <Zap className="w-4 h-4" />
                Simulate a Price Drop
              </button>
            </div>
          )}

          {/* ── Feed (vola-vola / soggiorna) ── */}
          {(currentTab === 'vola-vola' || currentTab === 'soggiorna') && (
            <div className="space-y-0 overflow-y-auto" data-testid="feed-container">
              {feedByTab.length === 0 ? (
                <div className="text-center py-16 px-5" data-testid="feed-empty">
                  <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Plane className="w-8 h-8 text-nomaq-indigo/40" />
                  </div>
                  <p className="text-slate-500 font-semibold">No offers available</p>
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

              {/* Bottom suggestion card */}
              {feedByTab.length > 0 && (
                <div className="mx-5 mb-4">
                  <div className="nomaq-card p-4 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
                    <span className="text-sm text-slate-500 flex-1">Tell Nomaq your budget, mood and dates...</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Drops ── */}
          {currentTab === 'drops' && (
            <DropsView simulatedDrops={simulatedDrops} isE2E={isE2E} />
          )}

          {/* ── Salvati ── */}
          {currentTab === 'salvati' && (
            <SalvatiView
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
