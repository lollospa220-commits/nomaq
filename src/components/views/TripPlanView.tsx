import React from 'react';
import { Calendar, CheckCircle2, ChevronDown, Hotel, Landmark, Map, MapPin, Music, Plane, ShoppingBag, Sparkles, Star, Sun, Sunset, Tag, Utensils, Wand2, Wine, X, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import SmartImage from '@/components/SmartImage';
import ThreeSparklesIcon from '@/components/ThreeSparklesIcon';
import { getDestinationImage } from '@/utils/destinationImages';

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

export default TripPlanView;
