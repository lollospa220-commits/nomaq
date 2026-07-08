import React from 'react';
import { ArrowRight, Calendar, Heart, Hotel, Map, MapPin, Search, ShieldCheck, Smartphone, Sparkles, Star, Tag, User, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/i18n/translations';
import SmartImage from '@/components/SmartImage';
import ThreeSparklesIcon from '@/components/ThreeSparklesIcon';
import { getDestinationImage } from '@/utils/destinationImages';

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
                    <span className="text-sm text-slate-400 font-medium self-center">{t('fromPrice')}</span>
                    <span className="text-3xl font-extrabold text-nomaq-navy leading-none">€ {featured.price}</span>
                    <span className="text-xs text-slate-400 mb-0.5">{t('perNight')}</span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-nomaq-navy leading-none">{t('searchNow')}</span>
                )}
              </div>
              {/* Trasparenza per-card: il prezzo è indicativo, conferma sul partner */}
              {featured.price != null && (
                <p className="text-[11px] text-slate-400">{t('indicativeShort')}</p>
              )}
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
                <span className="text-[10px] text-slate-400 font-medium mr-0.5">{t('fromPrice')}</span>
                <span className="font-extrabold text-nomaq-indigo">€{price}</span>{' '}
                <span className="text-[10px] text-slate-400">{t('perNight')}</span>
                {/* Trasparenza per-card: prezzo indicativo, conferma sul partner */}
                <span className="block text-[9px] text-slate-400 font-medium">{t('indicativeShort')}</span>
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


export default StaysView;
