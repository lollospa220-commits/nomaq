import Head from 'next/head';
import React from 'react';
import { Heart, MapPin, Calendar, Clock, Share2, Bell, ChevronRight, Zap, Star, ArrowDown, TrendingDown } from 'lucide-react';
import { useAppState, TabId } from '@/context/AppState';
import BottomNav from '@/components/BottomNav';

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
    tag: '🔥 HOT DEAL',
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
    tag: '✈️ TOP PICK',
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
    tag: '💸 BEST PRICE',
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
    tag: '⚡ FLASH DEAL',
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
    tag: '🇵🇹 WEEKEND',
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
    tag: '🌅 SUNSET VIEW',
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
    tag: '🐠 PARADISE',
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
    tag: '🗼 CITY VIEW',
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
   COMPONENTS INTERNI
───────────────────────────────────────────── */

function HeroHeader({ activeTab }: { activeTab: TabId }) {
  const titles: Record<TabId, { title: string; sub: string }> = {
    'vola-vola': { title: 'Vola Vola ✈️', sub: 'I migliori voli selezionati per te' },
    'soggiorna': { title: 'Soggiorna 🏨', sub: 'Hotel e resort da sogno' },
    'drops': { title: 'Radar Drops ⚡', sub: 'Prezzi in caduta libera in tempo reale' },
    'salvati': { title: 'Salvati ❤️', sub: 'Le tue rotte preferite' },
    'profilo': { title: 'Il tuo Profilo 👤', sub: 'Impostazioni e waitlist' },
  };
  const { title, sub } = titles[activeTab];

  return (
    <div className="px-5 pt-14 pb-4 bg-hero-gradient">
      {/* Logo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-orange flex items-center justify-center shadow-orange-glow">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-anthracite-grey tracking-tight">nomaq</span>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 glass rounded-xl flex items-center justify-center shadow-card">
            <Bell className="w-4 h-4 text-anthracite-grey" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black text-anthracite-grey leading-tight">{title}</h1>
        <p className="text-sm text-anthracite-grey/60 mt-1 font-medium">{sub}</p>
      </div>
    </div>
  );
}

function FeedCard({
  item,
  isSaved,
  onToggleSave,
}: {
  item: typeof FLIGHTS[0] | typeof HOTELS[0];
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

  return (
    <div className="feed-card mx-5 mb-5 animate-slide-up" data-testid="feed-item" data-id={item.id}>
      {/* Immagine hero */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={item.image}
          alt={item.destination}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-card" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="glass-dark text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {item.tag}
          </span>
          <button
            data-testid="save-button"
            data-id={item.id}
            onClick={() => onToggleSave(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
              isSaved
                ? 'bg-electric-orange shadow-orange-glow scale-110'
                : 'glass-dark'
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-all ${isSaved ? 'text-white fill-white' : 'text-white'}`}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white text-2xl font-black leading-tight">{item.destination}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-white/70" />
                <span className="text-white/70 text-xs font-medium">{item.country}</span>
                <span className="text-white/40 text-xs">•</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white/80 text-xs font-semibold">{item.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-xs line-through">€{item.originalPrice}</div>
              <div className="text-white text-2xl font-black">€{item.price}</div>
              <div className="drop-badge mt-1 inline-block">-{discount}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white p-4">
        <p className="text-anthracite-grey/70 text-sm leading-relaxed line-clamp-2 mb-3">{item.description}</p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-anthracite-grey/60 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{'date' in item ? item.date : item.date}</span>
          </div>
          {('duration' in item) ? (
            <div className="flex items-center gap-1.5 text-anthracite-grey/60 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{(item as typeof FLIGHTS[0]).duration}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-anthracite-grey/60 text-xs">
              <Star className="w-3.5 h-3.5" />
              <span>{'stars' in item ? '★'.repeat((item as typeof HOTELS[0]).stars) : ''}</span>
            </div>
          )}
        </div>

        <button className="btn-primary w-full text-sm py-3">
          Scopri questa offerta →
        </button>
      </div>
    </div>
  );
}

function DropsView({ simulatedDrops }: { simulatedDrops: any[] }) {
  const allDrops = [...simulatedDrops, ...MOCK_DROPS];

  return (
    <div className="px-5 pb-4 animate-fade-in" data-testid="drops-view">
      {/* Alert Banner */}
      <div className="glass-card rounded-2xl p-4 mb-5 border-l-4 border-electric-orange">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-orange rounded-xl flex items-center justify-center flex-shrink-0 shadow-orange-glow pulse-orange">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold text-anthracite-grey">Radar attivo</div>
            <div className="text-xs text-anthracite-grey/60">Monitorando 847 rotte in tempo reale</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-electric-orange text-lg font-black">{allDrops.length}</div>
            <div className="text-xs text-anthracite-grey/50">drops oggi</div>
          </div>
        </div>
      </div>

      {/* Lista drops */}
      <div className="space-y-3" data-testid="drops-history-list">
        {allDrops.length === 0 ? (
          <div className="text-center py-12" data-testid="drops-empty">
            <ArrowDown className="w-12 h-12 text-anthracite-grey/20 mx-auto mb-3" />
            <p className="text-anthracite-grey/40 font-medium">Nessun drop rilevato ancora.</p>
            <p className="text-anthracite-grey/30 text-sm">Il radar è in ascolto...</p>
          </div>
        ) : (
          allDrops.map((drop, idx) => (
            <div
              key={drop.id}
              className="glass-card rounded-2xl p-4 animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
              data-testid={`drop-item-${drop.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {drop.isNew && (
                      <span className="bg-electric-orange/10 text-electric-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
                        NUOVO
                      </span>
                    )}
                    <span className="text-anthracite-grey/40 text-xs">{drop.timeAgo}</span>
                  </div>
                  <div className="font-bold text-anthracite-grey text-sm truncate">{drop.destination}</div>
                  <div className="text-xs text-anthracite-grey/50 mt-0.5">
                    {drop.airline || 'Compagnia aerea'} • {drop.date || 'Data flessibile'}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-anthracite-grey/40 text-sm line-through">€{drop.oldPrice}</span>
                    <span className="text-anthracite-grey font-black text-lg">€{drop.newPrice}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="drop-badge">-{drop.dropPercent}%</div>
                  <button className="text-xs text-electric-orange font-semibold">
                    Prenota →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SalvatiView({ savedIds, allItems, onUnsave }: { savedIds: string[]; allItems: any[]; onUnsave: (id: string) => void }) {
  const saved = allItems.filter((i) => savedIds.includes(i.id));

  return (
    <div className="px-5 pb-4 animate-fade-in" data-testid="salvati-list">
      {saved.length === 0 ? (
        <div className="text-center py-16" data-testid="salvati-empty">
          <Heart className="w-16 h-16 text-anthracite-grey/15 mx-auto mb-4" />
          <p className="text-anthracite-grey/50 font-semibold text-lg">Nessun viaggio salvato</p>
          <p className="text-anthracite-grey/30 text-sm mt-1">Esplora il feed e salva le offerte che ti interessano!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {saved.map((item, idx) => {
            const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 60}ms` }}
                data-testid={`saved-item-${item.id}`}
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={item.image} alt={item.destination} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-card" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <div className="text-white font-black text-lg">{item.destination}</div>
                      <div className="text-white/70 text-xs">{item.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-black text-xl">€{item.price}</div>
                      <div className="drop-badge">-{discount}%</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-anthracite-grey/60 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <button
                    data-testid={`unsave-btn-${item.id}`}
                    onClick={() => onUnsave(item.id)}
                    className="text-anthracite-grey/40 hover:text-electric-orange transition-colors text-xs font-medium"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfiloView() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) { setError('Inserisci la tua email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { setError('Formato email non valido'); return; }
    setSubmitted(true);
    setEmail(trimmed);
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
      {/* Waitlist Card */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="bg-gradient-orange p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-white font-black text-lg leading-tight">Entra in lista d'attesa</div>
              <div className="text-white/70 text-xs">Sii il primo a ricevere i Drop</div>
            </div>
          </div>
          <div className="text-white/80 text-sm">
            Unisciti a <span className="font-bold text-white">2.847 viaggiatori</span> già in lista. Quando il prezzo crolla, tu sei il primo a saperlo.
          </div>
        </div>

        <form data-testid="waitlist-form" onSubmit={handleSubmit} className="p-5 space-y-3">
          {!submitted ? (
            <>
              <input
                type="email"
                data-testid="waitlist-email-input"
                placeholder="la.tua@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-off-white border border-anthracite-grey/10 rounded-2xl px-4 py-3.5 text-anthracite-grey text-sm placeholder-anthracite-grey/30 focus:outline-none focus:border-electric-orange focus:ring-2 focus:ring-electric-orange/20 transition-all"
              />
              {error && (
                <div data-testid="waitlist-error" className="text-red-500 text-xs font-medium px-1">{error}</div>
              )}
              <button
                type="submit"
                data-testid="waitlist-submit"
                className="btn-primary w-full text-sm"
              >
                Attiva il mio Radar →
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div data-testid="waitlist-success" className="animate-bounce-in bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">🎉</div>
                <div className="text-green-700 font-bold text-sm">Sei dentro!</div>
                <div className="text-green-600 text-xs mt-1">{email}</div>
              </div>
              <button
                data-testid="share-button"
                onClick={handleShare}
                className="btn-outline w-full text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Link copiato! ✓' : 'Flexa il tuo Drop'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-3xl p-5">
        <h3 className="font-black text-anthracite-grey mb-4">Le tue statistiche</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '✈️', value: '0', label: 'Voli trovati' },
            { icon: '❤️', value: '0', label: 'Salvati' },
            { icon: '⚡', value: '0', label: 'Drop ricevuti' },
          ].map((stat) => (
            <div key={stat.label} className="bg-off-white rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="font-black text-anthracite-grey text-lg">{stat.value}</div>
              <div className="text-anthracite-grey/50 text-[10px] font-medium leading-tight mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-5 pb-2">
          <h3 className="font-black text-anthracite-grey">Impostazioni</h3>
        </div>
        {[
          { icon: Bell, label: 'Notifiche Drop', sub: 'Alert per prezzi in calo' },
          { icon: MapPin, label: 'Destinazioni preferite', sub: 'Gestisci le tue rotte' },
          { icon: Share2, label: 'Invita amici', sub: 'Guadagna crediti viaggio' },
        ].map(({ icon: Icon, label, sub }, idx) => (
          <div key={label} className={`flex items-center gap-4 px-5 py-4 ${idx < 2 ? 'border-b border-anthracite-grey/5' : ''}`}>
            <div className="w-9 h-9 bg-off-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-anthracite-grey/60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-anthracite-grey">{label}</div>
              <div className="text-xs text-anthracite-grey/50">{sub}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-anthracite-grey/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* BottomNav è importato da @/components/BottomNav */

/* ─────────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────────── */
function ToastNotification({ notif, onDismiss }: { notif: any; onDismiss: (id: string) => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(notif.id), 5000);
    return () => clearTimeout(timer);
  }, [notif.id, onDismiss]);

  return (
    <div
      className="glass-card border-l-4 border-electric-orange rounded-2xl p-4 flex items-start gap-3 animate-slide-up shadow-card-hover"
      data-testid="notification-toast"
      data-id={notif.id}
    >
      <div className="w-9 h-9 bg-gradient-orange rounded-xl flex items-center justify-center flex-shrink-0">
        <TrendingDown className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-electric-orange mb-0.5">⚡ DROP RILEVATO</div>
        <div className="text-sm text-anthracite-grey font-medium leading-tight">{notif.message}</div>
      </div>
      <button
        data-testid={`toast-dismiss-${notif.id}`}
        onClick={() => onDismiss(notif.id)}
        className="text-anthracite-grey/30 hover:text-anthracite-grey transition-colors text-xs mt-0.5"
      >
        ✕
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Home({ query, resolvedUrl }: any) {
  const { activeTab, setActiveTab, savedItems, toggleSaveItem } = useAppState();
  const [isMounted, setIsMounted] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [simulatedDrops, setSimulatedDrops] = React.useState<any[]>([]);
  const [feedItems] = React.useState([...FLIGHTS, ...HOTELS]);

  const queryObj = query || {};

  React.useEffect(() => {
    setIsMounted(true);
    // Parse initial tab from URL
    const pathname = resolvedUrl ? resolvedUrl.split('?')[0] : '';
    if (pathname === '/soggiorna') setActiveTab('soggiorna');
    else if (pathname === '/drops') setActiveTab('drops');
    else if (pathname === '/salvati') setActiveTab('salvati');
    else if (pathname === '/profilo' || pathname === '/waitlist') setActiveTab('profilo');

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
  }, []);

  const currentTab = isMounted ? activeTab : 'vola-vola';
  const currentSaved = isMounted ? savedItems : [];

  const handleSimulateDrop = () => {
    const allFeed = currentTab === 'vola-vola' ? FLIGHTS : currentTab === 'soggiorna' ? HOTELS : feedItems;
    const pool = allFeed.length > 0 ? allFeed : feedItems;
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
        message: `⚡ ${item.destination} ora solo €${newPrice}! Era €${item.price} (-${dp}%)`,
      },
    ]);
  };

  const dismissNotif = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const feedByTab = currentTab === 'vola-vola' ? FLIGHTS : HOTELS;

  return (
    <>
      <Head>
        <title>Nomaq — Vola al Prezzo Giusto</title>
        <meta name="description" content="Nomaq: l'app che rileva i crolli di prezzo su voli e hotel in tempo reale. Vola di più, spendi meno." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
        <meta name="theme-color" content="#FF6B00" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>

      <main className="min-h-screen bg-off-white pb-24" data-testid="app-root">
        {/* Barra active view per i test */}
        <div data-testid="active-view" className="hidden">{currentTab}</div>

        {/* Header */}
        <HeroHeader activeTab={currentTab} />

        {/* Debug price drop button — visible solo nella tab Drops */}
        {currentTab === 'drops' && (
          <div className="px-5 mb-4">
            <button
              data-testid="debug-price-drop"
              onClick={handleSimulateDrop}
              className="w-full glass-card rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold text-electric-orange border border-electric-orange/20 active:scale-98"
            >
              <Zap className="w-4 h-4" />
              Simula un Price Drop
            </button>
          </div>
        )}

        {/* Contenuto per tab */}
        {(currentTab === 'vola-vola' || currentTab === 'soggiorna') && (
          <div className="space-y-0" data-testid="feed-container">
            {feedByTab.length === 0 ? (
              <div className="text-center py-16 px-5" data-testid="feed-empty">
                <p className="text-anthracite-grey/40 font-semibold">Nessuna offerta disponibile</p>
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
        )}

        {currentTab === 'drops' && (
          <DropsView simulatedDrops={simulatedDrops} />
        )}

        {currentTab === 'salvati' && (
          <SalvatiView
            savedIds={currentSaved}
            allItems={feedItems}
            onUnsave={toggleSaveItem}
          />
        )}

        {currentTab === 'profilo' && <ProfiloView />}

        {/* Toast notifications */}
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

        {/* Bottom Nav */}
        <BottomNav
          activeTab={currentTab}
          notificationsCount={simulatedDrops.length + notifications.length}
        />
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      query: context.query || {},
      resolvedUrl: context.resolvedUrl || '',
    },
  };
}
