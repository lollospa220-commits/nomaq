import React from 'react';
import { ArrowRight, Calendar, ChevronDown, ChevronRight, Clock, MapPin, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import SmartImage from '@/components/SmartImage';
import ThreeSparklesIcon from '@/components/ThreeSparklesIcon';
import { getDestinationImage } from '@/utils/destinationImages';
import type { FeedItem } from '@/types/domain';

/* ── Radar: voli reali (stesso fetch del feed home, vedi computeRealFlights)
   con drop tracking genuino. Niente più RADAR_PICKS/LAST_MINUTE/TODAY finti:
   ogni prezzo, ogni link, ogni "Drop €X" qui è ciò che il backend ha
   realmente osservato in questo ciclo di cache. ── */

// Origine reale delle tariffe (vedi fetchTravelpayoutsFlights/Duffel in
// travelApi.ts: origin è sempre 'MXP'). Il selettore città sotto resta
// decorativo finché non esiste una ricerca per-origine reale — non lo si
// finge funzionante mostrando una città diversa da quella davvero cercata.
const REAL_ORIGIN_LABEL = 'Milano';

function RadarBadges({ item, small = false }: { item: FeedItem; small?: boolean }) {
  const drop = item.dropAmount ?? 0;
  if (drop <= 0 || !item.originalPrice) return null;
  const pct = Math.round((drop / item.originalPrice) * 100);
  const cls = small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <div className={`absolute z-10 flex gap-1.5 ${small ? 'top-2 left-2' : 'top-3 left-3'}`}>
      <span className={`bg-white/90 backdrop-blur-sm text-nomaq-indigo font-bold rounded-lg shadow-sm ${cls}`}>Drop €{drop}</span>
      <span className={`bg-nomaq-navy/85 backdrop-blur-sm text-white font-bold rounded-lg shadow-sm ${cls}`}>-{pct}%</span>
    </div>
  );
}

// "Aggiornato X min fa": calcolato SOLO dopo il mount (nowTick parte da null)
// per non disallineare markup server/client sull'orario corrente, e mostrato
// SOLO quando observedAt esiste davvero — mai una freschezza inventata sulle
// righe servite dalla sola cache Supabase (nessun fetch avvenuto ora).
function FreshnessBadge({ observedAt, nowTick, small }: { observedAt?: number | null; nowTick: number | null; small?: boolean }) {
  const { t } = useLanguage();
  if (!nowTick || observedAt == null) return null;
  const mins = Math.max(0, Math.round((nowTick - observedAt) / 60000));
  return (
    <span className={`inline-flex items-center gap-1 text-slate-400 ${small ? 'text-[10px]' : 'text-[11px]'}`}>
      <Clock className={small ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2} />
      {mins < 1 ? t('minAgo').replace(/^/, '<1 ') : `${mins} ${t('minAgo')}`}
    </span>
  );
}

function RadarRoute({ to, className = '' }: { to: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-bold text-nomaq-navy min-w-0 ${className}`}>
      <span className="truncate">{REAL_ORIGIN_LABEL}</span>
      <ArrowRight className="w-4 h-4 text-nomaq-indigo flex-shrink-0" strokeWidth={2.5} />
      <span className="truncate">{to}</span>
    </div>
  );
}

function openBooking(item: FeedItem) {
  if (item.booking_url) window.open(item.booking_url, '_blank', 'noopener,noreferrer');
}

function RadarBigCard({ item, nowTick }: { item: FeedItem; nowTick: number | null }) {
  return (
    <div
      className="group nomaq-card bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      data-testid={`drop-item-${item.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${REAL_ORIGIN_LABEL} → ${item.destination}`}
      onClick={() => openBooking(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBooking(item); } }}
    >
      <div className="relative h-36 lg:h-40">
        <SmartImage
          src={item.image || getDestinationImage(item.destination, item.id)}
          fallbackSrc={getDestinationImage(item.destination, item.id)}
          alt={item.destination}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <RadarBadges item={item} />
      </div>
      <div className="p-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <RadarRoute to={item.destination} className="text-base" />
          <p className="text-xs text-slate-400 mt-1 truncate">
            {item.airline} · {item.date}
          </p>
          <FreshnessBadge observedAt={item.observedAt} nowTick={nowTick} />
        </div>
        <div className="text-right flex-shrink-0">
          {!!item.dropAmount && item.originalPrice && (
            <div className="text-slate-400 text-xs line-through leading-none mb-1">€{item.originalPrice}</div>
          )}
          <div className="text-2xl font-extrabold text-nomaq-navy leading-none">€{item.price}</div>
        </div>
      </div>
    </div>
  );
}

function RadarCompactCard({ item, nowTick }: { item: FeedItem; nowTick: number | null }) {
  return (
    <div
      className="group nomaq-card bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-stretch"
      data-testid={`drop-item-${item.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${REAL_ORIGIN_LABEL} → ${item.destination}`}
      onClick={() => openBooking(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBooking(item); } }}
    >
      <div className="relative w-28 lg:w-32 flex-shrink-0 min-h-[92px]">
        <SmartImage
          src={item.image || getDestinationImage(item.destination, item.id)}
          fallbackSrc={getDestinationImage(item.destination, item.id)}
          alt={item.destination}
          sizes="128px"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <RadarBadges item={item} small />
      </div>
      <div className="flex-1 px-3.5 py-3 flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <RadarRoute to={item.destination} className="text-sm" />
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {item.airline} · {item.date}
          </p>
          <FreshnessBadge observedAt={item.observedAt} nowTick={nowTick} small />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            {!!item.dropAmount && item.originalPrice && (
              <div className="text-slate-400 text-xs line-through leading-none mb-1">€{item.originalPrice}</div>
            )}
            <div className="text-lg font-extrabold text-nomaq-navy leading-none">€{item.price}</div>
          </div>
          <span className="w-9 h-9 rounded-full border border-nomaq-indigo/15 bg-nomaq-lavender flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-nomaq-indigo" />
          </span>
        </div>
      </div>
    </div>
  );
}

function RadarView({ flights, simulatedDrops }: { flights: FeedItem[]; simulatedDrops: any[] }) {
  const { t } = useLanguage();
  const [city, setCity] = React.useState('Napoli');
  const [travelers, setTravelers] = React.useState(1);
  const [openDd, setOpenDd] = React.useState<'city' | 'trav' | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // "Aggiornato X min fa" parte da null e si popola dopo il mount: evita un
  // mismatch SSR/client sull'orario e si aggiorna da solo ogni minuto.
  const [nowTick, setNowTick] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNowTick(Date.now());
    const id = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenDd(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const CITIES = ['Napoli', 'Roma', 'Milano'];

  // Drop simulati da E2E (?drops=id:prezzo): mappati sulla stessa forma
  // FeedItem delle righe reali, così condividono le card e i testid.
  const simMapped: FeedItem[] = simulatedDrops.map((s) => {
    const to = String(s.destination || '').split('→')[0].trim() || s.destination;
    const drop = Math.max(0, (s.oldPrice ?? 0) - (s.newPrice ?? 0));
    return {
      id: s.id, type: 'flight', destination: to, price: s.newPrice, originalPrice: s.oldPrice,
      dropAmount: drop, airline: s.airline || 'Airline', date: s.date || '',
      image: null, booking_url: '#', observedAt: Date.now(),
    };
  });

  const onlyFlights = flights.filter((f) => f.type === 'flight' && f.price != null);
  const dropped = [...simMapped, ...onlyFlights.filter((f) => (f.dropAmount ?? 0) > 0)]
    .sort((a, b) => (b.dropAmount ?? 0) - (a.dropAmount ?? 0));
  const droppedIds = new Set(dropped.map((f) => f.id));
  // Il catalogo reale ha poche destinazioni fisse: le due sezioni sotto
  // ripartiscono ciò che resta (nessun drop questo ciclo) per data/prezzo,
  // non duplicano "ourPicks" — ogni card mostra comunque il SUO prezzo reale.
  const remaining = onlyFlights.filter((f) => !droppedIds.has(f.id));
  const upcoming = [...remaining].sort((a, b) => (a.price ?? 0) - (b.price ?? 0)).slice(0, 3);
  const upcomingIds = new Set(upcoming.map((f) => f.id));
  const today = remaining.filter((f) => !upcomingIds.has(f.id)).slice(0, 3);

  const ddBtn = 'flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-nomaq-navy shadow-soft w-full lg:w-auto lg:min-w-[200px] hover:border-nomaq-indigo/30 transition-colors';
  const ddPanel = 'absolute left-0 top-[calc(100%+8px)] z-30 bg-white rounded-2xl shadow-card border border-slate-100 p-4 animate-fade-in';

  const travLabel = `${travelers} ${travelers === 1 ? t('travelerSingular') : t('travelerPlural')}`;

  const sections: Array<{ icon: React.ReactNode; title: string; items: FeedItem[]; compact?: boolean }> = [
    { icon: <ThreeSparklesIcon className="w-5 h-5 text-nomaq-indigo" />, title: t('ourPicks'), items: dropped },
    { icon: <Clock className="w-5 h-5 text-nomaq-indigo" />, title: t('lastMinuteDeals'), items: upcoming },
    { icon: <Calendar className="w-5 h-5 text-nomaq-indigo" />, title: t('todaysDeals'), items: today, compact: true },
  ];

  return (
    <div ref={rootRef} className="px-5 lg:px-6 pb-10 animate-fade-in" data-testid="radar-view">
      {/* Header */}
      <div className="pt-2 lg:pt-8 mb-5">
        <h1 className="font-display text-display-lg lg:text-display-xl text-nomaq-navy mb-2">Radar</h1>
        <p className="text-slate-500 text-sm lg:text-base">{t('dropsSubtitle')}</p>
      </div>

      {/* Filters. Nota: la ricerca reale parte sempre da MXP (vedi
          REAL_ORIGIN_LABEL) — città e viaggiatori restano preferenze UI non
          ancora collegate a una ricerca per-origine/passeggeri reale. */}
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
            <p className="text-slate-400 text-sm py-4">{compact || title === t('lastMinuteDeals') ? t('noOffers') : t('noDropsMonth')}</p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {items.map((item) =>
                compact
                  ? <RadarCompactCard key={item.id} item={item} nowTick={nowTick} />
                  : <RadarBigCard key={item.id} item={item} nowTick={nowTick} />
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

export default RadarView;
