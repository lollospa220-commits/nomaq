import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Selettore di intervallo date (Andata → Ritorno) con calendario a tendina,
 * al posto dei due <input type="date"> nativi. Trigger scuro coerente con la
 * toolbar, popover chiaro come l'autocomplete origine. Le date sono stringhe
 * ISO 'YYYY-MM-DD'; il confronto lessicografico è sicuro su questo formato.
 * onChange scatta solo quando l'intervallo è completo (andata + ritorno).
 */

// ISO 'YYYY-MM-DD' ↔ Date LOCALE (mai toISOString: sfaserebbe di un giorno
// vicino alla mezzanotte per via del fuso UTC).
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const fmtShort = (iso: string | undefined | null, localeTag: string) =>
  iso ? fromISO(iso).toLocaleDateString(localeTag, { day: 'numeric', month: 'short' }) : null;

export default function DateRangePicker({
  departure,
  returnDate,
  minDate,
  onChange,
}: {
  departure: string;
  returnDate: string;
  minDate?: string;
  onChange: (departure: string, returnDate: string) => void;
}) {
  const { t, lang } = useLanguage();
  const localeTag = lang === 'en' ? 'en-GB' : 'it-IT';
  const fmt = (iso?: string | null) => fmtShort(iso, localeTag);
  // Iniziali dei giorni (lun→dom) localizzate via Intl: nessun hardcoding IT/EN.
  const WEEKDAYS = React.useMemo(() => {
    const monday = new Date(2024, 0, 1); // 1 gen 2024 = lunedì
    const fmtW = new Intl.DateTimeFormat(localeTag, { weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return fmtW.format(d);
    });
  }, [localeTag]);
  const [open, setOpen] = React.useState(false);
  const [start, setStart] = React.useState<string | null>(departure || null);
  const [end, setEnd] = React.useState<string | null>(returnDate || null);
  const [hover, setHover] = React.useState<string | null>(null);
  // Mese visualizzato (primo giorno del mese).
  const [view, setView] = React.useState<Date>(() => {
    const base = departure ? fromISO(departure) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const ref = React.useRef<HTMLDivElement>(null);

  // Riallinea il draft interno quando le props cambiano da fuori (es. reset).
  React.useEffect(() => {
    setStart(departure || null);
    setEnd(returnDate || null);
  }, [departure, returnDate]);

  // Chiusura su click fuori / Escape (senza applicare: il draft resta com'è).
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openPicker = () => {
    setStart(departure || null);
    setEnd(returnDate || null);
    const base = departure ? fromISO(departure) : new Date();
    setView(new Date(base.getFullYear(), base.getMonth(), 1));
    setOpen(true);
  };

  const todayIso = minDate || toISO(new Date());

  const pickDay = (iso: string) => {
    if (iso < todayIso) return; // giorni passati non selezionabili
    // Nessun inizio, oppure intervallo già completo → riparte da questo giorno.
    if (!start || (start && end)) {
      setStart(iso);
      setEnd(null);
      return;
    }
    // Inizio presente, fine mancante.
    if (iso < start) {
      setStart(iso); // scelto un giorno prima → diventa la nuova andata
      return;
    }
    // Intervallo completo → applica e chiudi.
    setEnd(iso);
    onChange(start, iso);
    setOpen(false);
  };

  const monthLabel = view
    .toLocaleDateString(localeTag, { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());

  // Griglia del mese (settimana da lunedì).
  const y = view.getFullYear();
  const m = view.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const leading = (new Date(y, m, 1).getDay() + 6) % 7; // 0 = lunedì
  const cells: (string | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(y, m, d)));
  while (cells.length % 7 !== 0) cells.push(null);

  // Il mese "precedente" è disabilitato se già al mese corrente/minimo.
  const minMonth = fromISO(todayIso);
  const atMinMonth = y < minMonth.getFullYear() || (y === minMonth.getFullYear() && m <= minMonth.getMonth());

  const depLabel = fmt(departure) || t('dateDepartureShort');
  const retLabel = fmt(returnDate) || t('dateReturnShort');

  // Fine "effettiva" per l'anteprima range durante l'hover.
  const previewEnd = end || (start && hover && hover > start ? hover : null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-label={t('datePickerAria')}
        data-testid="date-range-trigger"
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full px-3.5 py-1.5 border border-white/20 backdrop-blur-md outline-none transition-colors"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-white/70 flex-shrink-0" strokeWidth={1.75} />
        <span className={fmt(departure) ? '' : 'text-white/50'}>{depLabel}</span>
        <span className="text-white/40">→</span>
        <span className={fmt(returnDate) ? '' : 'text-white/50'}>{retLabel}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 z-50 w-[300px] rounded-2xl bg-white shadow-xl border border-slate-100 p-3 text-left"
          data-testid="date-range-popover"
        >
          {/* Header mese con navigazione */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => !atMinMonth && setView(new Date(y, m - 1, 1))}
              disabled={atMinMonth}
              aria-label={t('prevMonthAria')}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-nomaq-navy" />
            </button>
            <span className="text-sm font-semibold text-nomaq-navy select-none">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setView(new Date(y, m + 1, 1))}
              aria-label={t('nextMonthAria')}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-nomaq-navy" />
            </button>
          </div>

          {/* Intestazioni giorni */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="text-[10px] font-semibold text-slate-400 text-center py-1 uppercase">{w}</div>
            ))}
          </div>

          {/* Griglia giorni */}
          <div className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => setHover(null)}>
            {cells.map((iso, i) => {
              if (!iso) return <div key={i} />;
              const disabled = iso < todayIso;
              const isStart = iso === start;
              const isEnd = iso === end;
              const inRange = start && previewEnd && iso > start && iso < previewEnd;
              const isEdge = isStart || isEnd;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onMouseEnter={() => setHover(iso)}
                  onClick={() => pickDay(iso)}
                  data-testid={`day-${iso}`}
                  className={[
                    'h-9 text-xs font-medium relative transition-colors',
                    disabled ? 'text-slate-300 cursor-not-allowed' : 'text-nomaq-navy hover:bg-nomaq-lavender/60',
                    inRange ? 'bg-nomaq-lavender/60' : '',
                    isStart && !end ? 'rounded-full' : '',
                    isStart && end ? 'rounded-l-full' : '',
                    isEnd ? 'rounded-r-full' : '',
                    isEdge ? '!bg-nomaq-indigo !text-white' : '',
                  ].join(' ')}
                >
                  {fromISO(iso).getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer: riepilogo + azioni */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              {start ? (
                end ? `${fmt(start)} → ${fmt(end)}`
                    : `${fmt(start)} → ${t('datePickChooseReturn')}`
              ) : t('datePickChooseDeparture')}
            </span>
            <button
              type="button"
              onClick={() => { setStart(null); setEnd(null); setHover(null); }}
              className="text-[11px] font-semibold text-nomaq-indigo hover:underline"
            >
              {t('dateResetBtn')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
