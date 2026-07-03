/**
 * DeepSeek-powered trip planner: given a natural-language request, either
 * builds a complete trip plan (flight + hotel with swappable alternatives,
 * transport comparison, full hour-by-hour daily itinerary) like a travel
 * agency optimizing quality/price, or falls back to filtering the catalog
 * for simple keyword-style queries.
 */

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export type TripOption = {
  airline?: string;
  fromCode?: string;
  fromCity?: string;
  toCode?: string;
  toCity?: string;
  departTime?: string;
  arriveTime?: string;
  returnDepartTime?: string;
  returnArriveTime?: string;
  durationLabel?: string;
  direct?: boolean;
  priceTotal: number;
  note?: string;
  booking_url?: string;
};

export type HotelOption = {
  name: string;
  area?: string;
  rating?: number;
  reviews?: number;
  distance?: string;
  pricePerNight?: number;
  priceTotal: number;
  features?: string[];
  badge?: string;
  booking_url?: string;
};

export type TripPlan = {
  meta: {
    destination: string;
    origin: string;
    startDate?: string;
    endDate?: string;
    dateLabel: string;
    nights: number;
    days: number;
    travelers: number;
    budget?: number | null;
  };
  flight: TripOption;
  flightAlternatives: TripOption[];
  hotel: HotelOption;
  hotelAlternatives: HotelOption[];
  gettingAround: {
    options: Array<{ name: string; price: string }>;
    fastest: string;
    cheapest: string;
  };
  days: Array<{
    date: string;
    title: string;
    activities: Array<{ time: string; title: string; place?: string; type?: string }>;
  }>;
  extrasEstimate: number;
  totalEstimate: number;
  agencyNote: string;
};

export type AiTripResult =
  | { mode: 'trip'; plan: TripPlan }
  | {
      mode: 'filter';
      summary: string;
      flightIds: string[];
      hotelIds: string[];
      package: { flightId: string; hotelId: string; reasoning: string } | null;
    };

function compact(items: any[]) {
  return items.map((i) => ({
    id: i.id,
    destination: i.destination,
    country: i.country,
    price: i.price,
    description: i.description,
    airline: i.airline,
    hotel_name: i.hotelName || i.hotel_name,
    rating: i.rating,
  }));
}

/* ── Affiliate booking links, built server-side from the plan data ── */

function flightBookingUrl(opt: TripOption, meta: TripPlan['meta']): string {
  // Kiwi.com per tutti i voli — nessun network russo (Aviasales/Jetradar).
  const isIata = (c?: string) => /^[A-Z]{3}$/.test(c || '');
  const toDDMMYYYY = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return y && m && d ? `${d}-${m}-${y}` : '';
  };
  const params = new URLSearchParams({
    from: isIata(opt.fromCode) ? (opt.fromCode as string) : 'NAP',
    lang: 'it',
  });
  if (isIata(opt.toCode)) params.set('to', opt.toCode as string);
  const depart = toDDMMYYYY(meta.startDate);
  if (depart) params.set('departure', depart);
  const ret = toDDMMYYYY(meta.endDate);
  if (ret) params.set('return', ret);
  const kiwiAffilId = process.env.KIWI_AFFILIATE_ID;
  if (kiwiAffilId) params.set('affilid', kiwiAffilId);
  return `https://www.kiwi.com/deep?${params.toString()}`;
}

function hotelBookingUrl(h: HotelOption, meta: TripPlan['meta']): string {
  const marker = process.env.AFFILIATE_MARKER || 'demo_marker_12345';
  const params = new URLSearchParams({
    ss: `${h.name} ${meta.destination}`,
    aid: marker,
    group_adults: String(meta.travelers || 1),
  });
  if (meta.startDate) params.set('checkin', meta.startDate);
  if (meta.endDate) params.set('checkout', meta.endDate);
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

const num = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export async function planTrip({
  query,
  flights,
  hotels,
  lang,
}: {
  query: string;
  flights: any[];
  hotels: any[];
  lang?: string;
}): Promise<AiTripResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const today = new Date().toISOString().slice(0, 10);
  const replyLang = lang === 'en' ? 'inglese' : 'italiano';

  const systemPrompt = `Sei il motore AI di Nomaq, un'agenzia di viaggi digitale d'élite. Oggi è ${today}.

PASSO 1 — DECIDI LA MODALITÀ (questa decisione viene PRIMA di ogni altra considerazione):
- Modalità "trip" se la richiesta contiene ALMENO UNO di questi elementi: date o periodo, durata del viaggio, numero di persone, budget, città di partenza, oppure chiede un viaggio/vacanza/pacchetto/itinerario da organizzare.
  Esempi che DEVONO dare "trip": "5 giorni a Barcellona dal 10 al 14 luglio, 2 persone, budget 600€, da Napoli" · "organizzami un weekend romantico a Parigi" · "vacanza a settembre per 4 amici".
- Modalità "filter" SOLO per ricerche a parola chiave senza quegli elementi. Esempi: "bali" · "voli economici" · "hotel con piscina".
IMPORTANTE: il catalogo fornito serve SOLO per la modalità "filter". In modalità "trip" IGNORALO COMPLETAMENTE: non deve mai influenzare la decisione né i contenuti del piano. Un budget stretto NON è mai un motivo per scegliere "filter".

MODALITÀ "trip":
Costruisci il MIGLIOR viaggio in assoluto per rapporto qualità/prezzo, come farebbe un agente di viaggio esperto della destinazione. Usa la tua conoscenza del mondo reale:
- Voli: compagnie che operano DAVVERO quella rotta, orari plausibili, prezzi realistici di mercato per il periodo. Proponi 1 scelta ottimale + 2 alternative reali (es. orario migliore vs prezzo migliore).
- Hotel: strutture REALI ed esistenti della destinazione (nome vero, zona vera, prezzi/notte realistici, valutazioni plausibili). 1 scelta best-value + 2 alternative reali di fascia diversa.
- Come muoversi: 3 opzioni di trasporto locali reali con prezzi reali; indica la più veloce e la più economica.
- Itinerario: per OGNI giorno del viaggio una giornata COMPLETA dalla mattina alla notte con 5-7 attività con orario preciso (es. "10:00", "14:00", "16:00", "19:00", "20:30", "23:00") e LUOGHI VERI e specifici (nome del locale/spiaggia/attrazione/ristorante/discoteca). Varia i giorni: mare/relax, cultura, food, vita notturna. Primo giorno considera l'orario di arrivo del volo, ultimo giorno l'orario di partenza.
- Rispetta rigorosamente il budget totale se indicato: la somma volo+hotel+extra deve starci dentro. Se il budget è stretto NON rinunciare mai: scegli voli low-cost, ostelli di design o hotel economici ma validi e REALI (a Barcellona esistono ottime doppie sotto i 90€/notte), attività gratuite. Trova comunque la soluzione migliore possibile; se proprio impossibile, avvicinati il più possibile e spiegalo in agencyNote.
Rispondi in JSON con questo schema ESATTO (testi nella lingua del cliente, default ${replyLang}):
{"mode":"trip","plan":{
"meta":{"destination":str,"origin":str,"startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","dateLabel":str breve es "10–14 Luglio","nights":int,"days":int,"travelers":int,"budget":int|null},
"flight":{"airline":str,"fromCode":IATA,"fromCity":str,"toCode":IATA,"toCity":str,"departTime":"HH:MM","arriveTime":"HH:MM","returnDepartTime":"HH:MM","returnArriveTime":"HH:MM","durationLabel":"1h 45m","direct":bool,"priceTotal":int per TUTTI i viaggiatori,"note":str breve perché è la scelta ottimale},
"flightAlternatives":[2 oggetti stesso schema],
"hotel":{"name":str,"area":str,"rating":float,"reviews":int,"distance":"550 m dal centro","pricePerNight":int,"priceTotal":int,"features":[3 str brevi],"badge":"Best Value"},
"hotelAlternatives":[2 oggetti stesso schema con badge diverso es "Più economico"/"Lusso"],
"gettingAround":{"options":[{"name":str,"price":str}x3],"fastest":str,"cheapest":str},
"days":[{"date":"Ven 10 Lug","title":str breve,"activities":[{"time":"10:00","title":str max 8 parole,"place":str nome vero,"type":"beach|food|culture|view|nightlife|transfer|shopping|relax"}x5-7]} per OGNI giorno],
"extrasEstimate":int stima trasporti+attività,
"totalEstimate":int volo+hotel+extra,
"agencyNote":str 1-2 frasi sul perché questo è il miglior rapporto qualità/prezzo}}

MODALITÀ "filter" — quando è solo una ricerca semplice (parola chiave, destinazione generica senza dettagli di viaggio):
Filtra il catalogo fornito usando SOLO id esistenti.
Rispondi: {"mode":"filter","summary":str 1-2 frasi,"flightIds":[...],"hotelIds":[...],"package":{"flightId":str,"hotelId":str,"reasoning":str}|null}

Rispondi SOLO con l'oggetto JSON, nessun altro testo.`;

  const userPrompt = JSON.stringify({
    richiesta: query,
    catalogo: { flights: compact(flights.slice(0, 60)), hotels: compact(hotels.slice(0, 60)) },
  });

  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    // Node fetch has no default timeout: without this an unresponsive
    // DeepSeek would hang the API route worker indefinitely.
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: 'deepseek-chat',
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 6000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`DeepSeek API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty DeepSeek response');

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON from DeepSeek');
  }

  if (parsed.mode === 'trip' && parsed.plan) {
    return normalizeTripPlan(parsed.plan);
  }

  /* ── filter mode: clamp ids to the real catalog ── */
  const validFlightIds = new Set(flights.map((f) => f.id));
  const validHotelIds = new Set(hotels.map((h) => h.id));

  const flightIds: string[] = Array.isArray(parsed.flightIds)
    ? parsed.flightIds.filter((id: string) => validFlightIds.has(id))
    : [];
  const hotelIds: string[] = Array.isArray(parsed.hotelIds)
    ? parsed.hotelIds.filter((id: string) => validHotelIds.has(id))
    : [];

  let pkg: { flightId: string; hotelId: string; reasoning: string } | null = null;
  if (
    parsed.package &&
    validFlightIds.has(parsed.package.flightId) &&
    validHotelIds.has(parsed.package.hotelId)
  ) {
    pkg = {
      flightId: parsed.package.flightId,
      hotelId: parsed.package.hotelId,
      reasoning: String(parsed.package.reasoning || ''),
    };
  }

  return {
    mode: 'filter',
    summary: String(parsed.summary || ''),
    flightIds,
    hotelIds,
    package: pkg,
  };
}

/** Validate + coerce the model output so a missing field can never crash the UI. */
function normalizeTripPlan(plan: any): AiTripResult {
  // `{}` is truthy: require the fields the UI actually renders, not just
  // non-null objects, so a degenerate plan falls back to filter/local search.
  const usableFlight =
    plan.flight && typeof plan.flight === 'object' && plan.flight.priceTotal != null && plan.flight.airline;
  const usableHotel = plan.hotel && typeof plan.hotel === 'object' && plan.hotel.name;
  if (!plan.meta || typeof plan.meta !== 'object' || !plan.meta.destination || !usableFlight || !usableHotel || !Array.isArray(plan.days) || plan.days.length === 0) {
    throw new Error('Incomplete trip plan from model');
  }

  const meta: TripPlan['meta'] = {
    destination: String(plan.meta.destination || ''),
    origin: String(plan.meta.origin || ''),
    startDate: plan.meta.startDate || undefined,
    endDate: plan.meta.endDate || undefined,
    dateLabel: String(plan.meta.dateLabel || ''),
    nights: num(plan.meta.nights, Math.max(1, (plan.days?.length || 2) - 1)),
    days: num(plan.meta.days, plan.days?.length || 1),
    travelers: num(plan.meta.travelers, 1) || 1,
    budget: plan.meta.budget != null ? num(plan.meta.budget) : null,
  };

  const normFlight = (f: any): TripOption => ({
    airline: String(f?.airline || 'Airline'),
    fromCode: String(f?.fromCode || '').trim().toUpperCase().slice(0, 3),
    fromCity: String(f?.fromCity || meta.origin),
    toCode: String(f?.toCode || '').trim().toUpperCase().slice(0, 3),
    toCity: String(f?.toCity || meta.destination),
    departTime: String(f?.departTime || ''),
    arriveTime: String(f?.arriveTime || ''),
    returnDepartTime: String(f?.returnDepartTime || ''),
    returnArriveTime: String(f?.returnArriveTime || ''),
    durationLabel: String(f?.durationLabel || ''),
    direct: Boolean(f?.direct ?? true),
    priceTotal: num(f?.priceTotal),
    note: String(f?.note || ''),
  });

  const normHotel = (h: any): HotelOption => ({
    name: String(h?.name || 'Hotel'),
    area: String(h?.area || ''),
    rating: num(h?.rating, 4.5),
    reviews: num(h?.reviews, 0),
    distance: String(h?.distance || ''),
    pricePerNight: num(h?.pricePerNight),
    priceTotal: num(h?.priceTotal, num(h?.pricePerNight) * meta.nights),
    features: Array.isArray(h?.features) ? h.features.slice(0, 4).map(String) : [],
    badge: String(h?.badge || ''),
  });

  const flight = normFlight(plan.flight);
  const flightAlternatives = (Array.isArray(plan.flightAlternatives) ? plan.flightAlternatives : [])
    .slice(0, 3)
    .map(normFlight);
  const hotel = normHotel(plan.hotel);
  const hotelAlternatives = (Array.isArray(plan.hotelAlternatives) ? plan.hotelAlternatives : [])
    .slice(0, 3)
    .map(normHotel);

  flight.booking_url = flightBookingUrl(flight, meta);
  flightAlternatives.forEach((f: TripOption) => (f.booking_url = flightBookingUrl(f, meta)));
  hotel.booking_url = hotelBookingUrl(hotel, meta);
  hotelAlternatives.forEach((h: HotelOption) => (h.booking_url = hotelBookingUrl(h, meta)));

  const days: TripPlan['days'] = plan.days.map((d: any) => ({
    date: String(d?.date || ''),
    title: String(d?.title || ''),
    activities: (Array.isArray(d?.activities) ? d.activities : []).map((a: any) => ({
      time: String(a?.time || ''),
      title: String(a?.title || ''),
      place: a?.place ? String(a.place) : undefined,
      type: a?.type ? String(a.type) : undefined,
    })),
  }));

  const extrasEstimate = num(plan.extrasEstimate);
  const totalEstimate = num(plan.totalEstimate, flight.priceTotal + hotel.priceTotal + extrasEstimate);

  const gettingAround = {
    options: (Array.isArray(plan.gettingAround?.options) ? plan.gettingAround.options : [])
      .slice(0, 4)
      .map((o: any) => ({ name: String(o?.name || ''), price: String(o?.price || '') })),
    fastest: String(plan.gettingAround?.fastest || ''),
    cheapest: String(plan.gettingAround?.cheapest || ''),
  };

  return {
    mode: 'trip',
    plan: {
      meta,
      flight,
      flightAlternatives,
      hotel,
      hotelAlternatives,
      gettingAround,
      days,
      extrasEstimate,
      totalEstimate,
      agencyNote: String(plan.agencyNote || ''),
    },
  };
}
