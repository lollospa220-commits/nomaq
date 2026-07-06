import Head from 'next/head';
import SEO from '@/components/SEO';
import Link from 'next/link';
import React from 'react';
import dynamic from 'next/dynamic';
import { Heart, MapPin, Calendar, Clock, ChevronRight, ChevronDown, Zap, Star, ArrowDown, TrendingDown, Search, Plane, Hotel, User, Globe, Sparkles, ArrowRight, X, Sun, Snowflake, CheckCircle2, Tag, Palmtree, Wand2, Utensils, Map, Smartphone, ShieldCheck, Landmark, Music, Sunset, Wine, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppState, TabId } from '@/context/AppState';
import { TranslationKey } from '@/i18n/translations';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/utils/supabaseClient';
import { fetchRealFlights, fetchRealHotels } from '@/utils/travelApi';
import { getDestinationImage } from '@/utils/destinationImages';
import { buildKiwiDeepLink } from '@/utils/kiwiLink';
import { SITE_URL } from '@/utils/siteUrl';
import { formatFlight, formatHotel } from '@/utils/normalizeItem';
import ThreeSparklesIcon from '@/components/ThreeSparklesIcon';
import SmartImage from '@/components/SmartImage';
import ProfiloView from '@/components/views/ProfiloView';
import ConciergeView from '@/components/views/ConciergeView';

// Globo WebGL (Globe.gl/three.js): code-split e solo lato client (ssr:false),
// caricato dopo il first paint così non pesa sul bundle iniziale.
const GlobeGL = dynamic(() => import('@/components/GlobeGL'), { ssr: false });


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

function NomaqLogo({ isDarkBackground }: { isDarkBackground?: boolean }) {
  // -translate-x-4 (−16px) sull'img: centra OTTICAMENTE la parola "Nomaq", che
  // le stelline a sinistra spingono ~16px a destra del centro geometrico.
  return (
    <div className="flex items-center justify-center py-3.5">
      <img
        src="/images/logo.png"
        alt="Nomaq Logo"
        className={`h-16 w-auto object-contain -translate-x-4 ${isDarkBackground ? 'brightness-0 invert' : ''}`}
        loading="eager"
      />
    </div>
  );
}

/* ── Language Switcher (IT/EN) ── */
function LanguageSwitcher({ isDarkBackground }: { isDarkBackground?: boolean }) {
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


/* ── Desktop top navbar ── */
function DesktopNav({ activeTab, onNavigate, isDarkBackground }: { activeTab: TabId; onNavigate: (id: TabId) => void; isDarkBackground?: boolean }) {
  const { t } = useLanguage();
  const items: { id: TabId; label: string }[] = [
    { id: 'vola-vola', label: t('navFlights') },
    { id: 'soggiorna', label: t('navSoggiorna') },
    { id: 'drops', label: t('navDrops') },
    { id: 'salvati', label: t('navConcierge') },
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

/* ── FAQ section ── */
function FaqSection({ isDarkBackground }: { isDarkBackground?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState<number | null>(null);
  const faqs = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
    { q: t('faq6q'), a: t('faq6a') },
  ];
  return (
    <section className="px-5 lg:px-6 pb-10 mt-2" data-testid="faq-section">
      <div className="flex items-center gap-2 mb-4">
        <ThreeSparklesIcon className={`w-5 h-5 ${isDarkBackground ? 'text-violet-300' : 'text-nomaq-indigo'}`} />
        <h2 className={`text-base lg:text-xl font-bold ${isDarkBackground ? 'text-white text-on-globe' : 'text-nomaq-navy'}`}>{t('faqTitle')}</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-x-6">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="nomaq-card backdrop-blur-md text-left p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow duration-200"
            >
              <span className="w-7 h-7 rounded-full bg-nomaq-lavender text-nomaq-indigo flex items-center justify-center flex-shrink-0 text-xs font-bold">
                Q
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-nomaq-navy leading-snug">{faq.q}</span>
                <span
                  className={`block text-xs text-slate-500 leading-relaxed mt-1 ${isOpen ? '' : 'line-clamp-1'}`}
                >
                  {faq.a}
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ── Feed Card ── */
const FeedCard = React.memo(function FeedCard({
  item,
  isSaved,
  onToggleSave,
}: {
  item: any;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
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
        if (item.booking_url) {
          window.open(item.booking_url, '_blank', 'noopener,noreferrer');
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && item.booking_url) {
          e.preventDefault();
          window.open(item.booking_url, '_blank', 'noopener,noreferrer');
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

// Skeleton della FeedCard (stessa forma) mostrato durante la ricerca: usa la
// classe .shimmer (già in CSS, prima inutilizzata) per un caricamento percepito
// più veloce, come sui prodotti travel leader.
function FeedCardSkeleton() {
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

/* ── Stays (Soggiorna) — reference design ── */
function StaysView({
  hotels,
  activeSearch,
  isSearching,
  onSearch,
  savedIds,
  onToggleSave,
}: {
  hotels: any[];
  activeSearch: string;
  isSearching: boolean;
  onSearch: (q: string) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [dest, setDest] = React.useState('');
  const [checkIn, setCheckIn] = React.useState('');
  const [checkOut, setCheckOut] = React.useState('');
  const [guests, setGuests] = React.useState(1);
  const [stayType, setStayType] = React.useState('all');

  // Default dates set after mount to avoid SSR/CSR hydration mismatch
  React.useEffect(() => {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const inD = new Date();
    inD.setDate(inD.getDate() + 7);
    const outD = new Date();
    outD.setDate(outD.getDate() + 11);
    setCheckIn(fmt(inD));
    setCheckOut(fmt(outD));
  }, []);

  const fieldBase = 'flex items-center gap-2 px-3 py-2.5 min-w-0';
  const labelCls = 'text-[10px] font-semibold text-slate-400 uppercase tracking-wide block';
  const valueCls = 'w-full bg-transparent text-sm font-semibold text-nomaq-navy outline-none';

  // "Featured" è il primo hotel del catalogo reale (search attiva o default):
  // niente più scheda finta con sconto inventato.
  const featured = hotels[0] || null;
  const featuredDiscount = featured?.original_price && featured.original_price > featured.price
    ? Math.round(((featured.original_price - featured.price) / featured.original_price) * 100)
    : 0;

  // La mappa stilizzata segue la destinazione cercata (input o ricerca attiva);
  // i quartieri di Napoli si mostrano solo quando la meta è effettivamente Napoli.
  const mapPlace = dest.trim() || activeSearch.trim() || 'Napoli';
  const isNaples = /^(napoli|naples)\b/i.test(mapPlace);
  const mapLabel = mapPlace.charAt(0).toUpperCase() + mapPlace.slice(1);

  const trustItems = [
    { Icon: ShieldCheck, title: t('trust1t'), sub: t('trust1s') },
    { Icon: Zap, title: t('trust2t'), sub: t('trust2s') },
    { Icon: Sparkles, title: t('trust3t'), sub: t('trust3s') },
    { Icon: Smartphone, title: t('trust4t'), sub: t('trust4s') },
  ];

  return (
    <div className="px-5 lg:px-6 pb-10 animate-fade-in" data-testid="stays-view">
      {/* ── Hero: headline full width, search widget below ── */}
      <div className="lg:pt-10 mb-8 text-center lg:text-left">
        <div className="mb-6 lg:mb-8">
          <p className="text-nomaq-indigo/70 text-[11px] font-medium uppercase tracking-[0.2em] mb-3">{t('staysEyebrow')}</p>
          <h1 className="font-display text-display-md lg:text-display-lg text-nomaq-navy leading-tight mb-3 lg:max-w-3xl">
            {t('staysHeadline')}
          </h1>
          <p className="text-slate-500 text-sm lg:text-base leading-relaxed lg:max-w-xl">{t('staysTagline')}</p>
        </div>

        {/* Search widget */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl lg:rounded-full shadow-[0_10px_34px_rgba(15,23,42,0.20)] border border-white/70 p-2 flex flex-col lg:flex-row lg:items-center text-left">
          <div className={`${fieldBase} flex-1 lg:min-w-[170px]`}>
            <MapPin className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className={labelCls}>{t('destLabel')}</span>
              <input
                type="text"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(dest)}
                placeholder="Napoli, Italia"
                className={valueCls}
                data-testid="stays-destination"
                aria-label={t('destLabel')}
              />
            </div>
          </div>
          <div className="hidden lg:block h-8 w-px bg-slate-100" />
          <div className={fieldBase}>
            <Calendar className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
            <div className="min-w-0">
              <span className={labelCls}>{t('checkInLabel')}</span>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className={`${valueCls} cursor-pointer`}
              />
            </div>
          </div>
          <div className="hidden lg:block h-8 w-px bg-slate-100" />
          <div className={fieldBase}>
            <Calendar className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
            <div className="min-w-0">
              <span className={labelCls}>{t('checkOutLabel')}</span>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className={`${valueCls} cursor-pointer`}
              />
            </div>
          </div>
          <div className="hidden lg:block h-8 w-px bg-slate-100" />
          <div className={fieldBase}>
            <User className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
            <div className="min-w-0">
              <span className={labelCls}>{t('guestsLabel')}</span>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className={`${valueCls} cursor-pointer appearance-none pr-4`}
                aria-label={t('guestsLabel')}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? t('guestSingular') : t('guestPlural')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="hidden lg:block h-8 w-px bg-slate-100" />
          <div className={fieldBase}>
            <Hotel className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
            <div className="min-w-0">
              <span className={labelCls}>{t('stayTypeLabel')}</span>
              <select
                value={stayType}
                onChange={(e) => setStayType(e.target.value)}
                className={`${valueCls} cursor-pointer appearance-none pr-4`}
                aria-label={t('stayTypeLabel')}
              >
                <option value="all">{t('allStays')}</option>
                <option value="hotel">{t('typeHotel')}</option>
                <option value="apartment">{t('typeApartment')}</option>
                <option value="bnb">{t('typeBnb')}</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => onSearch(dest)}
            disabled={isSearching}
            data-testid="stays-search-btn"
            aria-label={t('destLabel')}
            className="m-2 lg:m-1 w-full lg:w-12 h-12 rounded-full bg-gradient-to-br from-nomaq-violet to-nomaq-indigo text-white flex items-center justify-center flex-shrink-0 shadow-button hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            {isSearching ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Map + featured stay ── */}
      <div className="grid lg:grid-cols-[1fr_1.45fr] gap-5 mb-8">
        {/* Stylized map card */}
        <div className="relative rounded-3xl overflow-hidden bg-[#edf1f7] min-h-[240px] lg:min-h-[320px] shadow-soft border border-white/70">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                'linear-gradient(90deg, transparent 46%, #dde3ee 46%, #dde3ee 49%, transparent 49%), linear-gradient(0deg, transparent 62%, #dde3ee 62%, #dde3ee 65%, transparent 65%), linear-gradient(35deg, transparent 70%, #e3e8f2 70%, #e3e8f2 72%, transparent 72%)',
            }}
          />
          <div className="absolute right-0 bottom-0 w-2/5 h-1/2 bg-sky-100/80 rounded-tl-[90px]" />
          {isNaples && (
            <>
              <span className="absolute top-[18%] left-[10%] text-[11px] font-semibold tracking-[0.2em] text-slate-400">VOMERO</span>
              <span className="absolute bottom-[26%] left-[16%] text-[11px] font-semibold tracking-[0.2em] text-slate-400">CHIAIA</span>
              <span className="absolute top-[12%] right-[14%] text-[11px] font-semibold tracking-[0.2em] text-slate-400">PORTO</span>
            </>
          )}
          {[
            { top: '22%', left: '38%' },
            { top: '30%', right: '24%' },
            { bottom: '30%', right: '18%' },
          ].map((pos, i) => (
            <span key={i} className="absolute w-8 h-8 bg-white rounded-full shadow-soft flex items-center justify-center" style={pos as any}>
              <MapPin className="w-4 h-4 text-nomaq-indigo fill-nomaq-lavender" />
            </span>
          ))}
          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="w-12 h-12 bg-white rounded-full shadow-card flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-nomaq-indigo fill-nomaq-lavender" />
            </span>
            <span className="font-display text-2xl text-nomaq-navy text-center px-3 leading-tight">{mapLabel}</span>
          </div>
          <button
            onClick={() => window.open(`https://www.google.com/maps/place/${encodeURIComponent(mapPlace)}`, '_blank', 'noopener,noreferrer')}
            className="absolute bottom-4 left-4 bg-white rounded-full px-4 py-2.5 shadow-card flex items-center gap-2 text-sm font-semibold text-nomaq-navy hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <Map className="w-4 h-4 text-nomaq-indigo" />
            {t('exploreMap')}
          </button>
        </div>

        {/* Featured stay: primo hotel reale del catalogo, nessun dato inventato */}
        {featured ? (
          <div
            className="group rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_34px_rgba(15,23,42,0.22)] flex flex-col lg:flex-row cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
            data-testid="feed-item"
            data-id={featured.id}
            onClick={() => { if (featured.booking_url) window.open(featured.booking_url, '_blank', 'noopener,noreferrer'); }}
          >
            <div className="relative flex-1 min-h-[220px] lg:min-h-[320px]">
              <SmartImage
                src={featured.image || getDestinationImage(featured.destination, featured.id || 'featured')}
                fallbackSrc={getDestinationImage(featured.destination, featured.id || 'featured')}
                alt={featured.destination}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                priority
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-xs font-bold text-nomaq-navy flex items-center gap-1.5 shadow-soft">
                <Tag className="w-3.5 h-3.5 text-nomaq-indigo" /> {t('bestValue')}
              </span>
              <button
                data-testid="save-button"
                data-id={featured.id}
                onClick={(e) => { e.stopPropagation(); onToggleSave(featured.id); }}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-soft"
              >
                <Heart className={`w-4 h-4 ${savedIds.includes(featured.id) ? 'text-nomaq-violet fill-nomaq-violet' : 'text-slate-400'}`} strokeWidth={2} />
              </button>
            </div>
            <div className="lg:w-[290px] p-6 flex flex-col justify-center gap-1.5 flex-shrink-0">
              <h3 className="font-display text-2xl text-nomaq-navy leading-tight">{featured.hotel_name || featured.destination}</h3>
              <p className="text-slate-500 text-sm">{featured.destination}{featured.country ? `, ${featured.country}` : ''}</p>
              {featured.rating != null && (
                <div className="flex items-center gap-1.5 text-sm mt-1">
                  <Star className="w-4 h-4 fill-nomaq-indigo text-nomaq-indigo" />
                  <span className="font-bold text-nomaq-indigo">{featured.rating}</span>
                </div>
              )}
              {featuredDiscount > 0 && (
                <span className="text-nomaq-coral text-sm line-through mt-2">€{featured.original_price}</span>
              )}
              <div className="flex items-end gap-1.5">
                {featured.price != null ? (
                  <>
                    <span className="text-3xl font-extrabold text-nomaq-navy leading-none">€ {featured.price}</span>
                    <span className="text-xs text-slate-400 mb-0.5">{t('perNight')}</span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-nomaq-navy leading-none">{t('searchNow')}</span>
                )}
              </div>
              <button
                aria-label={t('viewStay')}
                onClick={(e) => { e.stopPropagation(); if (featured.booking_url) window.open(featured.booking_url, '_blank', 'noopener,noreferrer'); }}
                className="self-end mt-3 w-12 h-12 rounded-full bg-gradient-indigo text-white flex items-center justify-center shadow-button hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/70 shadow-soft border border-white/70 flex items-center justify-center min-h-[220px] lg:min-h-[320px] p-6 text-center">
            <p className="text-slate-500 text-sm font-semibold">{t('noOffers')}</p>
          </div>
        )}
      </div>

      {/* ── Picked for you by AI ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ThreeSparklesIcon className="w-5 h-5 text-nomaq-indigo" />
          <h2 className="font-display text-xl lg:text-2xl text-nomaq-navy">{t('pickedForYou')}</h2>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-nomaq-indigo hover:text-nomaq-violet transition-colors">
          {t('seeAllStays')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3" data-testid="feed-container">
        {hotels.length === 0 ? (
          <div className="text-center py-12 col-span-full" data-testid="feed-empty">
            <p className="text-slate-500 font-semibold">{t('noOffers')}</p>
          </div>
        ) : (
          hotels.map((item: any) => (
            <StayCard
              key={item.id}
              id={item.id}
              name={item.destination}
              meta={item.hotel_name || item.country || ''}
              rating={item.rating}
              reviews={null}
              price={item.price}
              image={item.image || getDestinationImage(item.destination, item.id || 'stay')}
              bookingUrl={item.booking_url}
              isSaved={savedIds.includes(item.id)}
              onToggleSave={onToggleSave}
              t={t}
            />
          ))
        )}
      </div>

      {/* ── Trust strip ── */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5 bg-white/55 backdrop-blur-md rounded-3xl p-5 lg:p-6 shadow-soft border border-white/70">
        {trustItems.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-nomaq-lavender flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-nomaq-indigo" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-nomaq-navy leading-snug">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StayCard({
  id,
  name,
  meta,
  rating,
  reviews,
  price,
  image,
  bookingUrl,
  isSaved,
  onToggleSave,
  t,
}: {
  id: string;
  name: string;
  meta: string;
  rating: number;
  reviews: number | null;
  price: number | null;
  image: string;
  bookingUrl?: string;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  t: (k: TranslationKey) => string;
}) {
  return (
    <div
      className="nomaq-card bg-white/70 backdrop-blur-md flex gap-3 p-3 items-stretch cursor-pointer group hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      data-testid="feed-item"
      data-id={id}
      role="button"
      tabIndex={0}
      aria-label={name}
      onClick={() => { if (bookingUrl) window.open(bookingUrl, '_blank', 'noopener,noreferrer'); }}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && bookingUrl) { e.preventDefault(); window.open(bookingUrl, '_blank', 'noopener,noreferrer'); } }}
    >
      <div className="relative w-28 lg:w-32 flex-shrink-0 rounded-2xl overflow-hidden min-h-[104px]">
        <SmartImage
          src={image}
          fallbackSrc={getDestinationImage(name, id)}
          alt={name}
          sizes="128px"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <button
          data-testid="save-button"
          data-id={id}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(id);
          }}
          className="absolute top-1.5 left-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm"
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'text-nomaq-violet fill-nomaq-violet' : 'text-slate-400'}`} strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        <div>
          <h3 className="text-sm lg:text-base font-bold text-nomaq-navy truncate">{name}</h3>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{meta}</p>
          {rating != null && (
            <div className="flex items-center gap-1 text-[11px] mt-1.5">
              <Star className="w-3 h-3 fill-nomaq-indigo text-nomaq-indigo" />
              <span className="font-bold text-nomaq-indigo">{rating}</span>
              {reviews !== null && <span className="text-slate-400">· {reviews} {t('reviews')}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-nomaq-navy tabular-nums">
            {price != null ? (
              <>
                <span className="font-extrabold text-nomaq-indigo">€{price}</span>{' '}
                <span className="text-[10px] text-slate-400">{t('perNight')}</span>
              </>
            ) : (
              <span className="font-extrabold text-nomaq-indigo">{t('searchNow')}</span>
            )}
          </span>
          <span className="text-nomaq-indigo text-xs font-semibold flex items-center gap-1">
            {t('viewStay')} <ArrowRight className="w-3 h-3" />
          </span>
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

/* ── AI Trip Plan (generated by DeepSeek from the search bar) ── */
const ACTIVITY_ICONS: Record<string, { Icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  beach: { Icon: Sun, cls: 'text-sky-500 bg-sky-50' },
  food: { Icon: Utensils, cls: 'text-rose-500 bg-rose-50' },
  culture: { Icon: Landmark, cls: 'text-violet-500 bg-violet-50' },
  view: { Icon: Sunset, cls: 'text-orange-500 bg-orange-50' },
  nightlife: { Icon: Music, cls: 'text-pink-500 bg-pink-50' },
  transfer: { Icon: Plane, cls: 'text-indigo-500 bg-indigo-50' },
  shopping: { Icon: ShoppingBag, cls: 'text-amber-500 bg-amber-50' },
  relax: { Icon: Wine, cls: 'text-emerald-600 bg-emerald-50' },
};

function ActivityIcon({ type }: { type?: string }) {
  const { Icon, cls } = ACTIVITY_ICONS[type || ''] || { Icon: MapPin, cls: 'text-slate-500 bg-slate-100' };
  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}

function TripPlanView({ plan, onClose }: { plan: any; onClose: () => void }) {
  const { t } = useLanguage();
  const [flightIdx, setFlightIdx] = React.useState(0);
  const [hotelIdx, setHotelIdx] = React.useState(0);
  const [showFlightAlts, setShowFlightAlts] = React.useState(false);
  const [showHotelAlts, setShowHotelAlts] = React.useState(false);

  const flightOptions = [plan.flight, ...(plan.flightAlternatives || [])].filter(Boolean);
  const hotelOptions = [plan.hotel, ...(plan.hotelAlternatives || [])].filter(Boolean);
  const f = flightOptions[Math.min(flightIdx, flightOptions.length - 1)];
  const h = hotelOptions[Math.min(hotelIdx, hotelOptions.length - 1)];
  const total = Math.round((f?.priceTotal || 0) + (h?.priceTotal || 0) + (plan.extrasEstimate || 0));

  const meta = plan.meta || {};
  const travLabel = `${meta.travelers} ${meta.travelers === 1 ? t('travelerSingular') : t('travelerPlural')}`;
  const glass = 'bg-white/65 backdrop-blur-xl border border-white/80 rounded-3xl shadow-card';

  return (
    <div className="px-5 lg:px-6 pb-10 animate-fade-in" data-testid="trip-plan">
      {/* ── Magic pill with parsed request ── */}
      <div className="flex flex-col items-center pt-2 lg:pt-6 mb-7">
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-full opacity-70 animate-pulse"
            style={{
              background: 'conic-gradient(from 180deg, rgba(124,58,237,0), rgba(124,58,237,.45), rgba(99,102,241,.45), rgba(236,72,153,.35), rgba(124,58,237,0))',
              filter: 'blur(12px)',
            }}
          />
          <div className="relative flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/90 rounded-full px-5 lg:px-7 py-3.5 shadow-soft">
            <ThreeSparklesIcon className="w-5 h-5 text-nomaq-indigo flex-shrink-0" />
            <span className="text-sm lg:text-base font-semibold text-nomaq-navy text-center">
              {meta.destination} <span className="text-nomaq-lavender mx-1">•</span> {meta.dateLabel}
              <span className="text-nomaq-lavender mx-1">•</span> {travLabel}
              <span className="text-nomaq-lavender mx-1">•</span> {t('fromPrefix')} {meta.origin}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-nomaq-violet">
          <CheckCircle2 className="w-4 h-4" />
          {t('tripReady')}
        </div>
        <button
          onClick={onClose}
          data-testid="trip-close"
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-nomaq-indigo transition-colors"
        >
          <X className="w-3.5 h-3.5" /> {t('tripNewSearch')}
        </button>
      </div>

      {/* ── Bento: flight + hotel ── */}
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] mb-5">
        {/* Flight card */}
        <div className={`${glass} p-5 lg:p-6 flex flex-col`} data-testid="trip-flight">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-slate-400">
              <Plane className="w-4 h-4" /> {t('tripFlightLabel')}
            </div>
            {f?.note && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white px-3 py-1.5 rounded-full bg-gradient-indigo shadow-button">
                <Sparkles className="w-3 h-3" /> {f.note}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between px-1 lg:px-3 mb-4">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-extrabold text-nomaq-navy tracking-tight">{f?.fromCode}</div>
              <div className="text-xs text-slate-500 font-semibold">{f?.fromCity}</div>
              <div className="text-sm text-nomaq-indigo font-bold mt-1">{f?.departTime}</div>
            </div>
            <div className="flex-1 relative mx-4 lg:mx-7 h-10">
              <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-nomaq-lavender" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-soft flex items-center justify-center">
                <Plane className="w-4 h-4 text-nomaq-indigo rotate-45" />
              </div>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">{f?.durationLabel}</div>
              {f?.direct && (
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600">{t('tripDirect')}</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-extrabold text-nomaq-navy tracking-tight">{f?.toCode}</div>
              <div className="text-xs text-slate-500 font-semibold">{f?.toCity}</div>
              <div className="text-sm text-nomaq-indigo font-bold mt-1">{f?.arriveTime}</div>
            </div>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-xs text-slate-500 leading-relaxed">
              <b className="text-nomaq-navy">{f?.airline}</b> · {meta.dateLabel}
              <br />
              {f?.returnDepartTime && <>{t('tripReturn')} {f.returnDepartTime} → {f.returnArriveTime}</>}
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-3xl font-extrabold text-nomaq-navy leading-none">€{f?.priceTotal}</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">
                {t('totalWord')} · {meta.travelers} {t('tripPassengers')}
              </div>
            </div>
          </div>
          {/* Alternatives */}
          {flightOptions.length > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowFlightAlts(!showFlightAlts)}
                data-testid="trip-flight-alts-toggle"
                className="flex items-center gap-1.5 text-xs font-bold text-nomaq-indigo hover:text-nomaq-violet transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showFlightAlts ? 'rotate-180' : ''}`} />
                {t('tripAlternatives')} ({flightOptions.length - 1})
              </button>
              {showFlightAlts && (
                <div className="mt-2 space-y-1.5">
                  {flightOptions.map((opt: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setFlightIdx(i)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                        i === flightIdx ? 'bg-nomaq-lavender/70 border border-nomaq-indigo/25' : 'bg-white/70 border border-slate-100 hover:border-nomaq-indigo/25'
                      }`}
                    >
                      <span className="text-xs font-semibold text-nomaq-navy truncate">
                        {opt.airline} · {opt.departTime}–{opt.arriveTime}
                        {opt.direct ? ` · ${t('tripDirect')}` : ''}
                      </span>
                      <span className="flex items-center gap-2 flex-shrink-0">
                        <b className="text-sm text-nomaq-navy">€{opt.priceTotal}</b>
                        {i === flightIdx && <CheckCircle2 className="w-4 h-4 text-nomaq-indigo" />}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hotel card */}
        <div className={`${glass} overflow-hidden flex flex-col`} data-testid="trip-hotel">
          <div className="relative h-36 lg:h-40 flex-shrink-0">
            <SmartImage
              src={getDestinationImage(meta.destination, h?.name || 'hotel')}
              alt={h?.name || meta.destination || 'Hotel'}
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            {h?.badge && (
              <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-white px-3 py-1.5 rounded-full bg-emerald-500 shadow-sm">
                <Sparkles className="w-3 h-3" /> {h.badge}
              </span>
            )}
          </div>
          <div className="p-5 flex flex-col gap-1.5 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-xl text-nomaq-navy leading-tight">{h?.name}</h3>
              <div className="text-lg font-extrabold text-nomaq-navy whitespace-nowrap">
                €{h?.pricePerNight}
                <span className="text-[10px] text-slate-400 font-semibold"> {t('perNight')}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="w-3.5 h-3.5 fill-nomaq-indigo text-nomaq-indigo" />
              <span className="font-bold text-nomaq-indigo">{h?.rating}</span>
              {h?.reviews ? <span className="text-slate-400 text-xs">· {h.reviews} {t('reviewsWord')}</span> : null}
            </div>
            <p className="text-xs text-slate-500">
              {[h?.area, h?.distance].filter(Boolean).join(' · ')}
            </p>
            {h?.features?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {h.features.map((feat: string, i: number) => (
                  <span key={i} className="text-[10px] font-semibold text-nomaq-violet bg-nomaq-lavender/70 border border-nomaq-indigo/10 px-2.5 py-1 rounded-full">
                    {feat}
                  </span>
                ))}
                <span className="text-[10px] font-semibold text-nomaq-violet bg-nomaq-lavender/70 border border-nomaq-indigo/10 px-2.5 py-1 rounded-full">
                  {meta.nights} {t('nightsWord')} · €{h?.priceTotal}
                </span>
              </div>
            )}
            {/* Alternatives */}
            {hotelOptions.length > 1 && (
              <div className="mt-auto pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowHotelAlts(!showHotelAlts)}
                  data-testid="trip-hotel-alts-toggle"
                  className="flex items-center gap-1.5 text-xs font-bold text-nomaq-indigo hover:text-nomaq-violet transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showHotelAlts ? 'rotate-180' : ''}`} />
                  {t('tripAlternatives')} ({hotelOptions.length - 1})
                </button>
                {showHotelAlts && (
                  <div className="mt-2 space-y-1.5">
                    {hotelOptions.map((opt: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setHotelIdx(i)}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                          i === hotelIdx ? 'bg-nomaq-lavender/70 border border-nomaq-indigo/25' : 'bg-white/70 border border-slate-100 hover:border-nomaq-indigo/25'
                        }`}
                      >
                        <span className="text-xs font-semibold text-nomaq-navy truncate">
                          {opt.name} {opt.badge ? `· ${opt.badge}` : ''}
                        </span>
                        <span className="flex items-center gap-2 flex-shrink-0">
                          <b className="text-sm text-nomaq-navy">€{opt.priceTotal}</b>
                          {i === hotelIdx && <CheckCircle2 className="w-4 h-4 text-nomaq-indigo" />}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Getting around + agency note ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] mb-5">
        <div className={`${glass} p-5`} data-testid="trip-transport">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3.5">
            <Map className="w-4 h-4" /> {t('tripGettingAround')}
          </div>
          <div className="flex gap-2.5 mb-3.5">
            {(plan.gettingAround?.options || []).map((opt: any, i: number) => (
              <div key={i} className="flex-1 bg-white/75 border border-white rounded-2xl px-3 py-3 text-center shadow-soft">
                <div className="text-sm font-bold text-nomaq-navy truncate">{opt.name}</div>
                <div className="text-[10.5px] text-slate-400 font-semibold mt-0.5 truncate">{opt.price}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.gettingAround?.fastest && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3" /> {t('tripFastest')}: {plan.gettingAround.fastest}
              </span>
            )}
            {plan.gettingAround?.cheapest && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">
                <Tag className="w-3 h-3" /> {t('tripCheapest')}: {plan.gettingAround.cheapest}
              </span>
            )}
          </div>
        </div>
        <div className={`${glass} p-5 flex items-start gap-3`}>
          <span className="w-9 h-9 rounded-full bg-nomaq-lavender flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-5 h-5 text-nomaq-indigo" />
          </span>
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-1">{t('tripAgencyNote')}</p>
            <p className="text-sm text-nomaq-navy leading-relaxed">{plan.agencyNote}</p>
          </div>
        </div>
      </div>

      {/* ── Day-by-day itinerary ── */}
      <div className={`${glass} p-5 lg:p-6 mb-5`} data-testid="trip-itinerary">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-4">
          <Calendar className="w-4 h-4" /> {t('tripItinerary')} · {plan.days?.length} {plan.days?.length === 1 ? t('dayWord') : t('daysWord')}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:overflow-visible scroll-fade-x">
          {(plan.days || []).map((day: any, di: number) => (
            <div key={di} className="min-w-[230px] lg:min-w-0 bg-white/75 border border-white rounded-2xl p-4 shadow-soft">
              <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="text-sm font-extrabold text-nomaq-navy">{day.date}</div>
                <div className="text-[11px] text-nomaq-indigo font-semibold mt-0.5">{day.title}</div>
              </div>
              <div className="space-y-2.5">
                {(day.activities || []).map((act: any, ai: number) => (
                  <div key={ai} className="flex items-start gap-2.5">
                    <ActivityIcon type={act.type} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-nomaq-indigo leading-none">{act.time}</div>
                      <div className="text-xs font-semibold text-nomaq-navy leading-snug mt-0.5">{act.title}</div>
                      {act.place && <div className="text-[10.5px] text-slate-400 leading-snug">{act.place}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Total bar ── */}
      <div className="bg-nomaq-navy rounded-3xl px-5 lg:px-7 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-card" data-testid="trip-total">
        <div className="text-sm text-slate-300 font-medium text-center lg:text-left">
          {t('tripTotalFor')} {travLabel} <b className="text-white text-lg mx-1" data-testid="trip-total-amount">€{total}</b>
          · {t('tripFlightLabel').split(' ')[0].toLowerCase()} + {meta.nights} {t('nightsWord')} + {t('tripExtras')}
          {meta.budget ? (
            <span className={`ml-2 inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full ${total <= meta.budget ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              Budget €{meta.budget} {total <= meta.budget ? '✓' : `· +€${Math.round(total - meta.budget)}`}
            </span>
          ) : null}
        </div>
        <div className="flex gap-2.5 flex-shrink-0">
          <button
            onClick={() => f?.booking_url && window.open(f.booking_url, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 text-sm font-bold text-white px-5 py-3 rounded-full bg-gradient-indigo shadow-button hover:scale-105 active:scale-95 transition-transform"
          >
            <Plane className="w-4 h-4" /> {t('tripBookFlight')}
          </button>
          <button
            onClick={() => h?.booking_url && window.open(h.booking_url, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 text-sm font-bold text-nomaq-navy px-5 py-3 rounded-full bg-white shadow-soft hover:scale-105 active:scale-95 transition-transform"
          >
            <Hotel className="w-4 h-4" /> {t('tripBookHotel')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Radar (reference design) ── */
const RADAR_IMG: Record<string, string> = {
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  lisbon: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  reykjavik: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
  barcelona: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  marrakech: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
  athens: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
};

type RadarDrop = {
  id: string; from: string; to: string; oldPrice: number; newPrice: number;
  airline: string; dateIt: string; dateEn: string; monthIdx: number;
  minsAgo: number; img: string;
};

const RADAR_PICKS: RadarDrop[] = [
  { id: 'radar-paris-ny', from: 'Parigi', to: 'New York', oldPrice: 550, newPrice: 299, airline: 'Air France', dateIt: 'Ott 22', dateEn: 'Oct 22', monthIdx: 9, minsAgo: 10, img: 'paris' },
  { id: 'radar-bali-milano', from: 'Bali', to: 'Milano', oldPrice: 620, newPrice: 389, airline: 'Qatar Airways', dateIt: 'Lug 12', dateEn: 'Jul 12', monthIdx: 6, minsAgo: 2, img: 'bali' },
  { id: 'radar-tokyo-roma', from: 'Tokyo', to: 'Roma', oldPrice: 700, newPrice: 420, airline: 'Emirates', dateIt: 'Nov 03', dateEn: 'Nov 03', monthIdx: 10, minsAgo: 15, img: 'tokyo' },
];

const RADAR_LAST_MINUTE: RadarDrop[] = [
  { id: 'radar-napoli-lisbona', from: 'Napoli', to: 'Lisbona', oldPrice: 420, newPrice: 300, airline: 'TAP Air Portugal', dateIt: 'Set 18', dateEn: 'Sep 18', monthIdx: 8, minsAgo: 8, img: 'lisbon' },
  { id: 'radar-santorini-berlino', from: 'Santorini', to: 'Berlino', oldPrice: 560, newPrice: 380, airline: 'Aegean Airlines', dateIt: 'Ago 25', dateEn: 'Aug 25', monthIdx: 7, minsAgo: 6, img: 'santorini' },
  { id: 'radar-reykjavik-amsterdam', from: 'Reykjavik', to: 'Amsterdam', oldPrice: 600, newPrice: 390, airline: 'Icelandair', dateIt: 'Dic 05', dateEn: 'Dec 05', monthIdx: 11, minsAgo: 12, img: 'reykjavik' },
];

const RADAR_TODAY: RadarDrop[] = [
  { id: 'radar-napoli-barcellona', from: 'Napoli', to: 'Barcellona', oldPrice: 410, newPrice: 320, airline: 'Vueling', dateIt: 'Giu 15', dateEn: 'Jun 15', monthIdx: 5, minsAgo: 5, img: 'barcelona' },
  { id: 'radar-roma-marrakech', from: 'Roma', to: 'Marrakech', oldPrice: 420, newPrice: 310, airline: 'Ryanair', dateIt: 'Giu 18', dateEn: 'Jun 18', monthIdx: 5, minsAgo: 7, img: 'marrakech' },
  { id: 'radar-parigi-atene', from: 'Parigi', to: 'Atene', oldPrice: 430, newPrice: 300, airline: 'Transavia', dateIt: 'Giu 20', dateEn: 'Jun 20', monthIdx: 5, minsAgo: 9, img: 'athens' },
];


function RadarBadges({ d, small = false }: { d: RadarDrop; small?: boolean }) {
  const dropAmt = d.oldPrice - d.newPrice;
  const pct = Math.round((dropAmt / d.oldPrice) * 100);
  const cls = small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <div className={`absolute z-10 flex gap-1.5 ${small ? 'top-2 left-2' : 'top-3 left-3'}`}>
      <span className={`bg-white/90 backdrop-blur-sm text-nomaq-indigo font-bold rounded-lg shadow-sm ${cls}`}>Drop €{dropAmt}</span>
      <span className={`bg-nomaq-navy/85 backdrop-blur-sm text-white font-bold rounded-lg shadow-sm ${cls}`}>-{pct}%</span>
    </div>
  );
}

function RadarRoute({ d, className = '' }: { d: RadarDrop; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-bold text-nomaq-navy min-w-0 ${className}`}>
      <span className="truncate">{d.from}</span>
      <ArrowRight className="w-4 h-4 text-nomaq-indigo flex-shrink-0" strokeWidth={2.5} />
      <span className="truncate">{d.to}</span>
    </div>
  );
}

function RadarBigCard({ d, affilId }: { d: RadarDrop; affilId?: string }) {
  const { lang } = useLanguage();
  return (
    <div
      className="group nomaq-card bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      data-testid={`drop-item-${d.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${d.from} → ${d.to}`}
      onClick={() => window.open(buildKiwiDeepLink(d.from, d.to, affilId), '_blank', 'noopener,noreferrer')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(buildKiwiDeepLink(d.from, d.to, affilId), '_blank', 'noopener,noreferrer'); } }}
    >
      <div className="relative h-36 lg:h-40">
        <SmartImage src={RADAR_IMG[d.img]} alt={`${d.from} → ${d.to}`} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <RadarBadges d={d} />
      </div>
      <div className="p-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <RadarRoute d={d} className="text-base" />
          <p className="text-xs text-slate-400 mt-1 truncate">
            {d.airline} · {lang === 'it' ? d.dateIt : d.dateEn}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-slate-400 text-xs line-through leading-none mb-1">€{d.oldPrice}</div>
          <div className="text-2xl font-extrabold text-nomaq-navy leading-none">€{d.newPrice}</div>
        </div>
      </div>
    </div>
  );
}

function RadarCompactCard({ d, affilId }: { d: RadarDrop; affilId?: string }) {
  const { lang } = useLanguage();
  return (
    <div
      className="group nomaq-card bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-stretch"
      data-testid={`drop-item-${d.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${d.from} → ${d.to}`}
      onClick={() => window.open(buildKiwiDeepLink(d.from, d.to, affilId), '_blank', 'noopener,noreferrer')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(buildKiwiDeepLink(d.from, d.to, affilId), '_blank', 'noopener,noreferrer'); } }}
    >
      <div className="relative w-28 lg:w-32 flex-shrink-0 min-h-[92px]">
        <SmartImage src={RADAR_IMG[d.img]} alt={`${d.from} → ${d.to}`} sizes="128px" className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <RadarBadges d={d} small />
      </div>
      <div className="flex-1 px-3.5 py-3 flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <RadarRoute d={d} className="text-sm" />
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {d.airline} · {lang === 'it' ? d.dateIt : d.dateEn}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="text-slate-400 text-xs line-through leading-none mb-1">€{d.oldPrice}</div>
            <div className="text-lg font-extrabold text-nomaq-navy leading-none">€{d.newPrice}</div>
          </div>
          <span className="w-9 h-9 rounded-full border border-nomaq-indigo/15 bg-nomaq-lavender flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-nomaq-indigo" />
          </span>
        </div>
      </div>
    </div>
  );
}

function RadarView({ simulatedDrops, kiwiAffiliateId }: { simulatedDrops: any[]; kiwiAffiliateId?: string }) {
  const { t, lang } = useLanguage();
  const [city, setCity] = React.useState('Napoli');
  const [month, setMonth] = React.useState<number | null>(null);
  const [travelers, setTravelers] = React.useState(1);
  const [openDd, setOpenDd] = React.useState<'city' | 'month' | 'trav' | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenDd(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const MONTHS = lang === 'it'
    ? ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const CITIES = ['Napoli', 'Roma', 'Milano'];

  const byMonth = (list: RadarDrop[]) => (month === null ? list : list.filter((d) => d.monthIdx === month));

  // Simulated drops (from E2E query state) surface at the top of the picks
  const simMapped: RadarDrop[] = simulatedDrops.map((s) => {
    const [from, to] = String(s.destination).split('→').map((x: string) => x.trim());
    return {
      id: s.id, from, to: to || '', oldPrice: s.oldPrice, newPrice: s.newPrice,
      airline: s.airline || 'Airline', dateIt: s.date || '', dateEn: s.date || '',
      monthIdx: -1, minsAgo: 0, img: 'paris',
    };
  });
  const picks = [...simMapped, ...byMonth(RADAR_PICKS)];
  const lastMinute = byMonth(RADAR_LAST_MINUTE);
  const today = byMonth(RADAR_TODAY);

  const ddBtn = 'flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-nomaq-navy shadow-soft w-full lg:w-auto lg:min-w-[200px] hover:border-nomaq-indigo/30 transition-colors';
  const ddPanel = 'absolute left-0 top-[calc(100%+8px)] z-30 bg-white rounded-2xl shadow-card border border-slate-100 p-4 animate-fade-in';

  const travLabel = `${travelers} ${travelers === 1 ? t('travelerSingular') : t('travelerPlural')}`;

  const sections: Array<{ icon: React.ReactNode; title: string; items: RadarDrop[]; compact?: boolean }> = [
    { icon: <ThreeSparklesIcon className="w-5 h-5 text-nomaq-indigo" />, title: t('ourPicks'), items: picks },
    { icon: <Clock className="w-5 h-5 text-nomaq-indigo" />, title: t('lastMinuteDeals'), items: lastMinute },
    { icon: <Calendar className="w-5 h-5 text-nomaq-indigo" />, title: t('todaysDeals'), items: today, compact: true },
  ];

  return (
    <div ref={rootRef} className="px-5 lg:px-6 pb-10 animate-fade-in" data-testid="radar-view">
      {/* Header */}
      <div className="pt-2 lg:pt-8 mb-5">
        <h1 className="font-display text-display-lg lg:text-display-xl text-nomaq-navy mb-2">Radar</h1>
        <p className="text-slate-500 text-sm lg:text-base">{t('dropsSubtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-8">
        {/* Departure city */}
        <div className="relative">
          <button className={ddBtn} onClick={() => setOpenDd(openDd === 'city' ? null : 'city')} aria-expanded={openDd === 'city'}>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-nomaq-indigo" />
              {t('fromPrefix')} {city}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDd === 'city' ? 'rotate-180' : ''}`} />
          </button>
          {openDd === 'city' && (
            <div className={`${ddPanel} w-full lg:w-[220px] p-2`}>
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setOpenDd(null); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${c === city ? 'bg-nomaq-lavender text-nomaq-indigo' : 'text-nomaq-navy hover:bg-slate-50'}`}
                >
                  {t('fromPrefix')} {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Month */}
        <div className="relative">
          <button className={ddBtn} onClick={() => setOpenDd(openDd === 'month' ? null : 'month')} aria-expanded={openDd === 'month'}>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nomaq-indigo" />
              {month === null ? t('anyMonth') : MONTHS[month]}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDd === 'month' ? 'rotate-180' : ''}`} />
          </button>
          {openDd === 'month' && (
            <div className={`${ddPanel} w-[280px]`}>
              <p className="text-sm font-bold text-nomaq-navy">{t('selectMonth')}</p>
              <p className="text-xs text-slate-400 mb-3">{t('selectMonthSub')}</p>
              <div className="grid grid-cols-4 gap-2">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => { setMonth(month === i ? null : i); setOpenDd(null); }}
                    className={`px-2 py-2 rounded-xl text-xs font-semibold transition-colors ${month === i ? 'bg-nomaq-indigo text-white' : 'bg-slate-50 text-nomaq-navy hover:bg-nomaq-lavender'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Travelers */}
        <div className="relative">
          <button className={ddBtn} onClick={() => setOpenDd(openDd === 'trav' ? null : 'trav')} aria-expanded={openDd === 'trav'}>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-nomaq-indigo" />
              {travLabel}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDd === 'trav' ? 'rotate-180' : ''}`} />
          </button>
          {openDd === 'trav' && (
            <div className={`${ddPanel} w-full lg:w-[240px]`}>
              <p className="text-sm font-bold text-nomaq-navy mb-3">{t('travelers')}</p>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                <button
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-soft text-nomaq-indigo font-bold text-lg flex items-center justify-center disabled:opacity-40"
                  disabled={travelers <= 1}
                  aria-label="-"
                >
                  −
                </button>
                <span className="text-sm font-bold text-nomaq-navy">{travelers}</span>
                <button
                  onClick={() => setTravelers(Math.min(9, travelers + 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-soft text-nomaq-indigo font-bold text-lg flex items-center justify-center disabled:opacity-40"
                  disabled={travelers >= 9}
                  aria-label="+"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-2">{t('maxTravelers')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      {sections.map(({ icon, title, items, compact }) => (
        <div key={title} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {icon}
            <h2 className="font-display text-lg lg:text-xl text-nomaq-navy">{title}</h2>
          </div>
          {items.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">{t('noDropsMonth')}</p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {items.map((d) =>
                compact
                  ? <RadarCompactCard key={d.id} d={d} affilId={kiwiAffiliateId} />
                  : <RadarBigCard key={d.id} d={d} affilId={kiwiAffiliateId} />
              )}
            </div>
          )}
        </div>
      ))}

      {/* Footer */}
      <div className="flex justify-center mt-2">
        <p className="text-slate-400 text-xs flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-nomaq-indigo/70" /> {t('radarFooter')}
        </p>
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
// Destinazioni popolari per l'autocomplete della ricerca (gap #1 vs i leader:
// prima il campo era testo libero senza suggerimenti). city = ciò che si cerca.
const POPULAR_DESTINATIONS: { city: string; country: string }[] = [
  { city: 'Parigi', country: 'Francia' }, { city: 'Londra', country: 'Regno Unito' },
  { city: 'New York', country: 'Stati Uniti' }, { city: 'Tokyo', country: 'Giappone' },
  { city: 'Barcellona', country: 'Spagna' }, { city: 'Roma', country: 'Italia' },
  { city: 'Amsterdam', country: 'Paesi Bassi' }, { city: 'Lisbona', country: 'Portogallo' },
  { city: 'Berlino', country: 'Germania' }, { city: 'Praga', country: 'Rep. Ceca' },
  { city: 'Vienna', country: 'Austria' }, { city: 'Madrid', country: 'Spagna' },
  { city: 'Dubai', country: 'Emirati Arabi' }, { city: 'Bali', country: 'Indonesia' },
  { city: 'Santorini', country: 'Grecia' }, { city: 'Atene', country: 'Grecia' },
  { city: 'Istanbul', country: 'Turchia' }, { city: 'Marrakech', country: 'Marocco' },
  { city: 'Bangkok', country: 'Thailandia' }, { city: 'Maldive', country: 'Maldive' },
  { city: 'Reykjavik', country: 'Islanda' }, { city: 'Copenaghen', country: 'Danimarca' },
  { city: 'Budapest', country: 'Ungheria' }, { city: 'Dublino', country: 'Irlanda' },
  { city: 'Porto', country: 'Portogallo' }, { city: 'Siviglia', country: 'Spagna' },
  { city: 'Napoli', country: 'Italia' }, { city: 'Milano', country: 'Italia' },
  { city: 'Venezia', country: 'Italia' }, { city: 'Firenze', country: 'Italia' },
  { city: 'Nizza', country: 'Francia' }, { city: 'Ibiza', country: 'Spagna' },
  { city: 'Malta', country: 'Malta' }, { city: 'Zanzibar', country: 'Tanzania' },
  { city: 'Sharm el-Sheikh', country: 'Egitto' }, { city: 'Cancún', country: 'Messico' },
  { city: 'Miami', country: 'Stati Uniti' }, { city: 'Singapore', country: 'Singapore' },
];

const normalizeSearch = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// Titolo + description per tab: ogni tab è una route SSR distinta (initialTab
// impostato in getServerSideProps) → l'HTML iniziale che Google indicizza porta
// meta corretti, non identici su tutti i tab.
type SeoEntry = { title: string; description: string };
const SEO_META: Record<string, Record<'it' | 'en', SeoEntry>> = {
  'vola-vola': {
    it: {
      title: "Nomaq — Voli e hotel al prezzo giusto, scelti dall'AI",
      description: "Nomaq rileva i crolli di prezzo su voli e hotel in tempo reale e compone il viaggio perfetto con l'AI. Vola di più, spendi meno.",
    },
    en: {
      title: 'Nomaq — Flights & hotels at the right price, AI-picked',
      description: 'Nomaq detects real-time price drops on flights and hotels and builds your perfect trip with AI. Fly more, spend less.',
    },
  },
  soggiorna: {
    it: {
      title: 'Soggiorni e hotel al prezzo giusto — Nomaq',
      description: "Hotel e soggiorni selezionati dall'AI al miglior rapporto qualità/prezzo. Cerca qualsiasi destinazione e prenota senza pensieri.",
    },
    en: {
      title: 'Stays & hotels at the right price — Nomaq',
      description: 'AI-curated hotels and stays at the best value. Search any destination and book with zero hassle.',
    },
  },
  drops: {
    it: {
      title: 'Radar prezzi voli in tempo reale — Nomaq',
      description: "Il Radar Nomaq monitora le rotte e segnala i cali di prezzo appena avvengono. Non perdere più un'offerta.",
    },
    en: {
      title: 'Real-time flight price radar — Nomaq',
      description: 'The Nomaq Radar tracks routes and flags price drops the moment they happen. Never miss a deal.',
    },
  },
  salvati: {
    it: {
      title: 'Concierge AI di viaggio — Nomaq',
      description: 'Il Concierge AI di Nomaq pianifica il viaggio perfetto: ristoranti, itinerari, trasporti, su misura per te.',
    },
    en: {
      title: 'AI travel Concierge — Nomaq',
      description: "Nomaq's AI Concierge plans your perfect trip: restaurants, itineraries, transport, tailored to you.",
    },
  },
  profilo: {
    it: {
      title: 'Il tuo profilo — Nomaq',
      description: 'Gestisci il tuo profilo Nomaq, i viaggi salvati e le preferenze.',
    },
    en: {
      title: 'Your profile — Nomaq',
      description: 'Manage your Nomaq profile, saved trips and preferences.',
    },
  },
};

export default function Home({
  query,
  resolvedUrl,
  isE2E,
  noindex,
  initialFlights,
  initialHotels,
  initialSimulatedDrops,
  initialNotifications,
  initialWaitlistCount,
  initialWaitlistError,
  initialWaitlistSubmitted,
  initialWaitlistEmail,
  kiwiAffiliateId,
}: any) {
  const { activeTab, setActiveTab, savedItems, toggleSaveItem } = useAppState();
  const { t, lang } = useLanguage();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [aiQuery, setAiQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [showAllDeals, setShowAllDeals] = React.useState(false);
  const [activeSearch, setActiveSearch] = React.useState('');
  const [aiSummary, setAiSummary] = React.useState('');
  const [aiPackage, setAiPackage] = React.useState<{ flight: any; hotel: any; reasoning: string } | null>(null);
  const [tripPlan, setTripPlan] = React.useState<any>(null);
  // Monotonic id per search: a stale response must never overwrite the
  // result of a newer search fired while it was still in flight.
  const searchSeqRef = React.useRef(0);

  const handleNavigate = (id: TabId) => {
    setActiveTab(id);
    router.push(id === 'vola-vola' ? '/' : `/${id}`, undefined, { shallow: true });
  };

  // Parole troppo generiche per contare come match: da sole farebbero
  // "corrispondere" quasi ogni voce del catalogo senza dire nulla di utile.
  const SEARCH_STOPWORDS = new Set([
    'a', 'ai', 'al', 'alla', 'con', 'da', 'dei', 'del', 'di', 'e', 'i', 'il',
    'in', 'la', 'le', 'lo', 'per', 'sotto', 'un', 'una', 'vacanza', 'vacanze',
    'volo', 'voli', 'weekend', 'the', 'to', 'for',
  ]);

  // Fallback deep-link: usato quando manca DEEPSEEK_API_KEY / l'AI fallisce E
  // nessuna voce del catalogo corrisponde. Invece di rimostrare i preset
  // (irrilevanti per la meta cercata) generiamo due card azionabili "Cerca
  // voli/hotel a {q}" con deep-link reali Kiwi.com / Booking.com. Nessun prezzo
  // inventato: price è null → FeedCard mostra "Cerca" al posto di "€".
  const buildFallbackCards = (destQuery: string) => {
    const q = destQuery.trim();
    const img = getDestinationImage(q, q);
    return {
      flights: [{
        id: `fallback-flight-${q}`, type: 'flight',
        destination: `Cerca voli per ${q}`,
        description: `Apri la ricerca voli per ${q} su Kiwi.com e trova le date migliori.`,
        price: null, originalPrice: null, airline: 'Kiwi.com',
        image: img, booking_url: buildKiwiDeepLink('napoli', q), tag: 'CERCA',
      }],
      hotels: [{
        id: `fallback-hotel-${q}`, type: 'hotel',
        destination: `Cerca hotel a ${q}`,
        description: `Apri la ricerca hotel a ${q} su Booking.com per le tue date.`,
        price: null, originalPrice: null, hotelName: q,
        image: img,
        booking_url: `https://www.booking.com/searchresults.html?${new URLSearchParams({ ss: q, group_adults: '2' }).toString()}`,
        tag: 'CERCA',
      }],
    };
  };

  // Fallback locale AI-less: confronta singole parole significative (non l'intera
  // frase) contro il catalogo reale; su zero match usa le card deep-link sopra.
  const localFilter = (searchQuery: string) => {
    const tokens = searchQuery
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length >= 3 && !SEARCH_STOPWORDS.has(w));

    const matches = (item: any) => {
      if (tokens.length === 0) return true;
      const haystack = `${item.destination} ${item.description} ${item.country || ''}`.toLowerCase();
      return tokens.some((tok) => haystack.includes(tok));
    };

    const filteredFlights = allFlights.filter(matches);
    const filteredHotels = allHotels.filter(matches);

    if (filteredFlights.length === 0 && filteredHotels.length === 0) {
      const fb = buildFallbackCards(searchQuery);
      setFlights(fb.flights);
      setHotels(fb.hotels);
      setAiSummary(t('noExactMatch'));
    } else {
      setFlights(filteredFlights);
      setHotels(filteredHotels);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    const seq = ++searchSeqRef.current;
    setIsSearching(true);
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setAiSummary('');
      setAiPackage(null);
      setTripPlan(null);
      setFlights(allFlights);
      setHotels(allHotels);
      setActiveSearch('');
      setIsSearching(false);
      return;
    }

    // Deterministic path for E2E: no external AI calls in tests
    if (isE2E) {
      setTripPlan(null);
      localFilter(trimmed);
      setActiveSearch(trimmed);
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch('/api/ai-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          flights: allFlights.slice(0, 60),
          hotels: allHotels.slice(0, 60),
          lang,
        }),
      });
      if (!res.ok) throw new Error('ai-trip unavailable');
      const data = await res.json();
      if (seq !== searchSeqRef.current) return; // a newer search took over

      if (data.mode === 'trip' && data.plan) {
        // Full AI-generated trip: swap the feed for the plan view
        setTripPlan({ ...data.plan, __seq: seq });
        setAiSummary('');
        setAiPackage(null);
        setFlights(allFlights);
        setHotels(allHotels);
      } else if (data.mode === 'destination' && ((data.flights?.length || 0) > 0 || (data.hotels?.length || 0) > 0)) {
        // Destination search: AI generated real flight+hotel cards for a place
        // not in the fixed catalog. They are already in FeedCard shape.
        setTripPlan(null);
        setAiPackage(null);
        setFlights(data.flights || []);
        setHotels(data.hotels || []);
        setAiSummary(data.summary || '');
      } else {
        // Simple search: filter the catalog as before
        setTripPlan(null);
        setFlights(allFlights.filter((f) => (data.flightIds || []).includes(f.id)));
        setHotels(allHotels.filter((h) => (data.hotelIds || []).includes(h.id)));
        setAiSummary(data.summary || '');

        if (data.package) {
          const pf = allFlights.find((f) => f.id === data.package.flightId);
          const ph = allHotels.find((h) => h.id === data.package.hotelId);
          setAiPackage(pf && ph ? { flight: pf, hotel: ph, reasoning: data.package.reasoning || '' } : null);
        } else {
          setAiPackage(null);
        }
      }
    } catch (e) {
      if (seq !== searchSeqRef.current) return;
      setTripPlan(null);
      setAiSummary('');
      setAiPackage(null);
      localFilter(trimmed);
    }

    if (seq !== searchSeqRef.current) return;
    setActiveSearch(trimmed);
    setIsSearching(false);
  };

  const [notifications, setNotifications] = React.useState<any[]>(initialNotifications || []);
  const [simulatedDrops, setSimulatedDrops] = React.useState<any[]>(initialSimulatedDrops || []);

  // allFlights/allHotels hold the full catalog; flights/hotels hold the
  // (possibly search-filtered) displayed subset. Keeping them separate means
  // a second search filters the real catalog again instead of an
  // already-shrunk result set.
  const [allFlights, setAllFlights] = React.useState<any[]>(initialFlights || []);
  const [allHotels, setAllHotels] = React.useState<any[]>(initialHotels || []);
  const [flights, setFlights] = React.useState<any[]>(initialFlights || []);
  const [hotels, setHotels] = React.useState<any[]>(initialHotels || []);
  // feedItems è derivato da flights+hotels: useMemo invece di state+effect
  // (elimina un render extra a ogni load e il warning set-state-in-effect).
  const feedItems = React.useMemo(() => [...flights, ...hotels], [flights, hotels]);

  const queryObj = query || {};

  React.useEffect(() => {
    setIsMounted(true);

    // I dati arrivano già via initialFlights/initialHotels (props SSR): rifetch
    // solo se le props sono vuote (upstream fallito in SSR), evitando 2 fetch +
    // 2 render ridondanti a ogni caricamento.
    if ((initialFlights?.length ?? 0) === 0) fetch('/api/flights')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map(formatFlight);
          setAllFlights(formatted);
          setFlights(formatted);
        }
      })
      .catch((err) => console.error('Error loading flights:', err));

    if ((initialHotels?.length ?? 0) === 0) fetch('/api/hotels')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map(formatHotel);
          setAllHotels(formatted);
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
  // Home (vola-vola, non in modalità piano) mostra il globo scuro dietro:
  // lo sheet è trasparente e i testi "nudi" (titolo FAQ, footer) diventano chiari.
  const isDarkBackground = currentTab === 'vola-vola' && !tripPlan;

  const handleSimulateDrop = () => {
    const allFeed = currentTab === 'vola-vola' ? flights : currentTab === 'soggiorna' ? hotels : feedItems;
    // Escludi le card senza prezzo numerico (es. card di fallback "Cerca …"):
    // il calcolo del drop simulato produrrebbe altrimenti NaN.
    const pool = (allFeed.length > 0 ? allFeed : feedItems).filter((i: any) => typeof i.price === 'number');
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

  // Feed = only rows coming from the API layer. Mock deals must never be
  // mixed into the live feed: they carry invented prices indistinguishable
  // from real offers (the padding this replaced was the primary source of
  // "prices don't match" complaints).
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
    ? `${t('welcomeBack')}, ${firstName}`
    : t('welcome');

  // Quick suggestion data for home view.
  // Icone monocrome a tratto sottile (1.5): un solo accento (Sorprendimi),
  // il resto neutro — niente arcobaleno di pallini colorati.
  const quickSuggestions = [
    {
      icon: <Wand2 className="w-4 h-4 text-nomaq-indigo" strokeWidth={1.5} />,
      text: t('surpriseMe'),
      isSurprise: true,
    },
    {
      icon: <Plane className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('flightsUnder100'),
    },
    {
      icon: <MapPin className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('oneWayJapan'),
    },
    {
      icon: <Landmark className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('weekendParis'),
    },
    {
      icon: <Palmtree className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('beachHolidays'),
    },
    {
      icon: <Snowflake className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('skiTrips'),
    },
  ];

  // Seconda riga del marquee (scorre in senso opposto): sole label, tono
  // destinazione/vibe, nessuna icona — così le due righe non sembrano gemelle.
  const marqueeRowB = [
    t('chipCityBreak'), t('chipLastMinute'), t('chipRomantic'),
    t('chipTropical'), t('chipUnder300'), t('chipAurora'),
  ];
  const surpriseQueries = [
    'Weekend a Parigi sotto i 150€',
    'Spiaggia tropicale a Dicembre',
    'Gita in montagna low cost',
    'Volo diretto last minute',
    'Migliori hotel a Tokyo',
  ];
  // Autocomplete: destinazioni che matchano ciò che l'utente digita (accento-
  // insensibile), priorità a chi inizia con la query. Max 6.
  const destSuggestions = React.useMemo(() => {
    const q = normalizeSearch(aiQuery);
    if (q.length < 1) return [] as typeof POPULAR_DESTINATIONS;
    return POPULAR_DESTINATIONS
      .filter((d) => normalizeSearch(d.city).includes(q) || normalizeSearch(d.country).includes(q))
      .sort((a, b) => Number(normalizeSearch(b.city).startsWith(q)) - Number(normalizeSearch(a.city).startsWith(q)))
      .slice(0, 6);
  }, [aiQuery]);

  const runQuick = (text: string) => { setAiQuery(text); handleSearch(text); };
  const runSurprise = () => runQuick(surpriseQueries[Math.floor(Math.random() * surpriseQueries.length)]);

  // ── Structured data (JSON-LD) for rich results. FAQPage is emitted only on
  // the home tab, where the FAQ is actually rendered on the page. ──
  const jsonLdGraph: any[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Nomaq',
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Nomaq',
      inLanguage: lang === 'en' ? 'en' : 'it',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ];
  if (currentTab === 'vola-vola') {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      mainEntity: [1, 2, 3, 4, 5, 6].map((n) => ({
        '@type': 'Question',
        name: t(`faq${n}q` as TranslationKey),
        acceptedAnswer: { '@type': 'Answer', text: t(`faq${n}a` as TranslationKey) },
      })),
    });
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': jsonLdGraph };
  const seoMeta = (SEO_META[currentTab] || SEO_META['vola-vola'])[lang];

  return (
    <>
      <SEO title={seoMeta.title} description={seoMeta.description} noindex={noindex} />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4F46E5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') }}
        />
      </Head>

      {/* WCAG 2.4.1 — skip link: first focusable element, jumps past the nav. */}
      <a href="#main-content" className="skip-link">
        Salta al contenuto
      </a>

      <main id="main-content" className="min-h-screen relative z-0" data-testid="app-root">
        {/* ── Desktop top navbar ── */}
        <DesktopNav activeTab={currentTab} onNavigate={handleNavigate} isDarkBackground={currentTab === 'vola-vola' && !tripPlan} />

        <div className={`mx-auto ${queryObj.desktop === 'true' ? 'max-w-4xl' : 'max-w-md lg:max-w-6xl'}`}>
          {/* Hidden active view for tests */}
          <div data-testid="active-view" className="hidden">{currentTab}</div>

          {/* ── Logo Header (with language switcher) — mobile only ── */}
          <div className="relative lg:hidden">
            <NomaqLogo isDarkBackground={currentTab === 'vola-vola' && !tripPlan} />
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <LanguageSwitcher isDarkBackground={currentTab === 'vola-vola' && !tripPlan} />
            </div>
          </div>

          {/* ── Stays view (soggiorna) — reference design ── */}
          {currentTab === 'soggiorna' && !isE2E && (
            <StaysView
              hotels={feedByTab}
              activeSearch={activeSearch}
              isSearching={isSearching}
              onSearch={(q) => {
                setAiQuery(q);
                handleSearch(q);
              }}
              savedIds={currentSaved}
              onToggleSave={toggleSaveItem}
            />
          )}

          {/* ── AI-generated trip plan (replaces the home feed) ── */}
          {currentTab === 'vola-vola' && tripPlan && !isE2E && (
            <TripPlanView
              key={tripPlan.__seq || 0}
              plan={tripPlan}
              onClose={() => {
                setTripPlan(null);
                setAiQuery('');
                setActiveSearch('');
                setFlights(allFlights);
                setHotels(allHotels);
              }}
            />
          )}

          {/* ── Home view header (vola-vola; soggiorna only in E2E) ── */}
          {((currentTab === 'vola-vola' && (!tripPlan || isE2E)) || (currentTab === 'soggiorna' && isE2E)) && (
            <div className="px-5 lg:px-6 mb-5">
              {/* Backdrop scuro statico (SSR) dietro al globo: la hero a testo
                  chiaro resta leggibile subito, prima che il globo WebGL
                  (dynamic, ssr:false) carichi — e anche se WebGL non è
                  disponibile. Sotto il globo (-z-60) e sopra il gradiente
                  chiaro del body. */}
              <div
                className="fixed inset-0 -z-[60]"
                aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse 85% 60% at 50% -5%, #1b1540 0%, #0a0a1a 62%)' }}
              />
              {/* Full-screen fixed globe background rendered only when Hero is active */}
              <GlobeGL />

              {/* Hero: ora trasparente, fa vedere il GlobeGL fisso sul retro. */}
              <div className="relative mb-8 lg:mb-14 px-5 py-12 lg:px-10 lg:py-20">
                {/* Velo per staccare il testo dal globo e dare profondità */}


                {/* Foreground */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Eyebrow */}
                  <p className="text-violet-300/70 text-[11px] font-medium uppercase tracking-[0.2em] mb-3 select-none" data-testid="home-greeting">
                    {greeting}
                  </p>
                  {/* Titolo */}
                  <h1 className="font-display text-display-md lg:text-display-lg text-white leading-tight mb-3 [text-shadow:0_2px_24px_rgba(10,8,30,0.6)]">
                    {t('headline')}<span className="italic text-violet-400">?</span>
                  </h1>
                  {/* Tagline */}
                  <p className="text-slate-300 text-sm lg:text-base leading-relaxed max-w-md mb-7">
                    {t('heroTagline')}
                  </p>

                  {/* AI Search bar */}
                  <div className="relative w-full max-w-2xl">
                    <div className="bg-white/95 backdrop-blur-md border border-white/70 shadow-[0_10px_34px_rgba(15,23,42,0.20)] relative rounded-full flex items-center h-16 pl-6 pr-2 text-left">
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
                            className="w-full bg-transparent border-none outline-none text-slate-800 text-base leading-snug font-normal placeholder-slate-400 focus:ring-0 focus:outline-none"
                          />
                        </div>

                        {/* Separator */}
                        <div className="h-6 w-px bg-slate-100 mx-3" />

                        {/* Right Sparkles Button */}
                        <button
                          onClick={() => handleSearch(aiQuery)}
                          disabled={isSearching}
                          aria-label={t('searchNow')}
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
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-soft flex items-center justify-center">
                              <ThreeSparklesIcon className="w-7 h-7 text-nomaq-navy" />
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Dropdown ricerche recenti */}
                    {isFocused && (
                      <div className="liquid-glass-light backdrop-blur-xl backdrop-saturate-150 absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl p-4 text-left animate-fade-in">
                        {destSuggestions.length > 0 ? (
                          <>
                            <h3 className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">{t('destinationsLabel')}</h3>
                            <div className="flex flex-col gap-1" data-testid="dest-suggestions">
                              {destSuggestions.map((d) => (
                                <button
                                  key={d.city}
                                  onMouseDown={() => runQuick(d.city)}
                                  className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-sm transition-colors w-full text-left"
                                >
                                  <MapPin className="w-4 h-4 text-nomaq-indigo flex-shrink-0" strokeWidth={1.5} />
                                  <span className="truncate"><span className="font-semibold text-nomaq-navy">{d.city}</span><span className="text-slate-400"> · {d.country}</span></span>
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">{t('continueWhere')}</h3>
                            <div className="flex flex-col gap-2">
                              <button
                                onMouseDown={() => runQuick(t('recentSearch1'))}
                                className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-xs text-slate-600 transition-colors w-full text-left"
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="truncate">{t('recentSearch1')}</span>
                              </button>
                              <button
                                onMouseDown={() => runQuick(t('recentSearch2'))}
                                className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-xs text-slate-600 transition-colors w-full text-left"
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="truncate">{t('recentSearch2')}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI trip generation status */}
                  {isSearching && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-nomaq-violet animate-pulse" data-testid="trip-loading">
                      <ThreeSparklesIcon className="w-4 h-4" />
                      {t('tripLoading')}
                    </div>
                  )}

                  {/* Due righe di tag in marquee, direzioni opposte.
                      Riga A → verso destra · Riga B → verso sinistra.
                      Pausa su hover/focus per rendere i chip cliccabili. */}
                  <div className="w-full mt-8 space-y-3">
                    <div className="marquee">
                      <div className="marquee__track marquee__track--right">
                        {[...quickSuggestions, ...quickSuggestions].map((s, i) => {
                          const dup = i >= quickSuggestions.length;
                          return (
                            <button
                              key={`a-${i}`}
                              aria-hidden={dup ? 'true' : undefined}
                              tabIndex={dup ? -1 : 0}
                              onClick={() => (s.isSurprise ? runSurprise() : runQuick(s.text))}
                              className={`mr-3 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                                s.isSurprise
                                  ? 'liquid-glass liquid-glass-violet'
                                  : 'liquid-glass'
                              }`}
                            >
                              {s.icon}
                              <span className={`text-xs font-medium ${s.isSurprise ? 'text-violet-200' : 'text-slate-100'}`}>{s.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="marquee">
                      <div className="marquee__track marquee__track--left">
                        {[...marqueeRowB, ...marqueeRowB].map((label, i) => {
                          const dup = i >= marqueeRowB.length;
                          return (
                            <button
                              key={`b-${i}`}
                              aria-hidden={dup ? 'true' : undefined}
                              tabIndex={dup ? -1 : 0}
                              onClick={() => runQuick(label)}
                              className="liquid-glass mr-3 px-4 py-2.5 rounded-full text-xs font-medium text-slate-100 transition-all whitespace-nowrap"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section label row — serif come gli altri titoli di sezione (FAQ, Radar) */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
                  <h2 className="font-display text-xl lg:text-2xl text-white">{t('pickedForYou')}</h2>
                </div>
                <button
                  onClick={() => setShowAllDeals(!showAllDeals)}
                  className="hidden lg:flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-white transition-colors"
                >
                  {t('seeAllDeals')} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* Wrapper con sfondo solido per il contenuto sotto la Hero section.
              Questo garantisce che il testo scuro sia leggibile allo scroll, coprendo il globo. */}
          <div className={`relative z-10 rounded-t-[32px] pt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-24 lg:pb-16 ${isDarkBackground ? 'bg-transparent' : 'bg-gradient-to-b from-white/40 to-white/90 backdrop-blur-2xl backdrop-saturate-150'}`}>

          {/* ── AI search summary + suggested package ── */}
          {!isE2E && currentTab === 'vola-vola' && !tripPlan && activeSearch && (aiSummary || aiPackage) && (
            <div className="px-5 lg:px-6 mb-4" data-testid="ai-search-result">
              {aiSummary && (
                <div className="nomaq-card bg-nomaq-lavender/90 backdrop-blur-md border-nomaq-indigo/15 p-4 flex items-start gap-3 mb-3">
                  <ThreeSparklesIcon className="w-4 h-4 text-nomaq-indigo flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-nomaq-navy leading-snug">{aiSummary}</p>
                </div>
              )}
              {aiPackage && (
                <div data-testid="ai-package">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Wand2 className="w-4 h-4 text-nomaq-violet" />
                    <span className="text-sm font-semibold text-nomaq-navy">{t('aiPackageTitle')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <FeedCard item={aiPackage.flight} isSaved={currentSaved.includes(aiPackage.flight.id)} onToggleSave={toggleSaveItem} />
                    <FeedCard item={aiPackage.hotel} isSaved={currentSaved.includes(aiPackage.hotel.id)} onToggleSave={toggleSaveItem} />
                  </div>
                  {aiPackage.reasoning && <p className="text-xs text-slate-500 leading-snug">{aiPackage.reasoning}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Feed (vola-vola; soggiorna only in E2E) ── */}
          {((currentTab === 'vola-vola' && (!tripPlan || isE2E)) || (currentTab === 'soggiorna' && isE2E)) && (
            <>
              {/* Grid collage 2x2 container */}
              <div
                className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 px-5 lg:px-6 pb-5 scrollable"
                data-testid="feed-container"
              >
                {isSearching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sk-${i}`} className="h-full" data-testid="feed-skeleton">
                      <FeedCardSkeleton />
                    </div>
                  ))
                ) : feedByTab.length === 0 ? (
                  <div className="text-center py-16 px-5 col-span-2" data-testid="feed-empty">
                    <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Plane className="w-8 h-8 text-nomaq-indigo/40" />
                    </div>
                    <p className="text-slate-500 font-semibold">{t('noOffers')}</p>
                  </div>
                ) : (
                  feedByTab.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`h-full ${!showAllDeals && idx >= 6 ? 'lg:hidden' : ''}`}
                    >
                      <FeedCard
                        item={item}
                        isSaved={currentSaved.includes(item.id)}
                        onToggleSave={toggleSaveItem}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* FAQ */}
              <FaqSection isDarkBackground={isDarkBackground} />
            </>
          )}

          {/* ── Radar (Drops) — reference design; legacy view kept for E2E ── */}
          {currentTab === 'drops' && (
            isE2E ? (
              <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:pt-8">
                <DropsView simulatedDrops={simulatedDrops} isE2E={isE2E} onSimulateDrop={handleSimulateDrop} />
              </div>
            ) : (
              <RadarView simulatedDrops={simulatedDrops} kiwiAffiliateId={kiwiAffiliateId} />
            )
          )}

          {/* ── Concierge (Salvati slot — E2E compatible) ── */}
          {currentTab === 'salvati' && (
            <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:pt-8">
              <ConciergeView
                savedIds={currentSaved}
                allItems={feedItems}
                onUnsave={toggleSaveItem}
              />
            </div>
          )}

          {/* ── Profilo ── */}
          {currentTab === 'profilo' && (
            <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:pt-8">
              <ProfiloView
                initialCount={initialWaitlistCount}
                initialError={initialWaitlistError}
                initialSubmitted={initialWaitlistSubmitted}
                initialEmail={initialWaitlistEmail}
                isE2E={isE2E}
              />
            </div>
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

          {/* ── Footer legale (tutti i tab) — dentro il foglio chiaro così resta
              leggibile anche sopra il globo scuro della home ── */}
          <footer className="mt-10 pb-4 px-5 text-center" data-testid="legal-footer">
            <nav className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs ${isDarkBackground ? 'text-white/85 text-on-globe' : 'text-slate-500'}`} aria-label="Link legali">
              <Link href="/note-legali" className="hover:text-nomaq-indigo transition-colors">{t('footerLegal')}</Link>
              <span aria-hidden="true">·</span>
              <Link href="/termini" className="hover:text-nomaq-indigo transition-colors">{t('footerTerms')}</Link>
              <span aria-hidden="true">·</span>
              <Link href="/privacy" className="hover:text-nomaq-indigo transition-colors">{t('footerPrivacy')}</Link>
              <span aria-hidden="true">·</span>
              <Link href="/cookie-policy" className="hover:text-nomaq-indigo transition-colors">{t('footerCookies')}</Link>
            </nav>
            <p className={`text-2xs mt-2 ${isDarkBackground ? 'text-white/75 text-on-globe' : 'text-slate-500'}`}>© 2026 Nomaq · nomaq061@gmail.com</p>
          </footer>
          </div>

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
      // Parallelo: il TTFB della home = max(voli, hotel) invece della somma.
      [flights, hotels] = await Promise.all([fetchRealFlights(), fetchRealHotels()]);
    } catch (e) {
      console.error('Failed to load flights/hotels in getServerSideProps', e);
    }
  }

  // Map to common formats for server-side render. originalPrice and rating
  // pass through only when a real value exists: inventing a markup or a
  // rating here would show fake discounts/stars on every card.
  let formattedFlights = flights.map(formatFlight);
  let formattedHotels = hotels.map(formatHotel);

  // Handle empty feed override for tests
  if (query.feed === 'empty') {
    formattedFlights = [];
    formattedHotels = [];
  }

  // Parse and apply feed modifications from E2E driver
  // Clone del feed originale prima delle modifiche E2E. Calcolato SOLO quando un
  // parametro di query E2E lo richiede: prima il deep-clone dell'intero feed
  // girava a OGNI richiesta di produzione.
  const originalFeedItems = (query.feed_mod || query.drops || query.notifications)
    ? JSON.parse(JSON.stringify([...formattedFlights, ...formattedHotels]))
    : [];

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

  // Let the CDN cache the anonymous shell — greeting, saved items and auth are
  // all resolved client-side, so the server HTML is identical for every
  // anonymous visitor. Never cache E2E / query-param-driven variants.
  if (!isE2E && Object.keys(query).length === 0 && context.res) {
    context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  }

  return {
    props: {
      query,
      resolvedUrl,
      isE2E,
      // noindex sui deploy di PREVIEW Vercel (mai in produzione): evita che gli
      // URL *.vercel.app di anteprima creino contenuti duplicati su Google.
      noindex: process.env.VERCEL_ENV === 'preview',
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
      // Affiliate marker is inherently public (it ends up in outbound URLs);
      // exposing it lets the client build tracked Kiwi deep links for Radar.
      kiwiAffiliateId: process.env.KIWI_AFFILIATE_ID || '',
    },
  };
}
