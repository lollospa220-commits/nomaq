import React from 'react';
import { ArrowRight, Calendar, ChevronDown, ChevronRight, Clock, MapPin, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import SmartImage from '@/components/SmartImage';
import ThreeSparklesIcon from '@/components/ThreeSparklesIcon';
import { buildKiwiDeepLink } from '@/utils/kiwiLink';

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

export default RadarView;
